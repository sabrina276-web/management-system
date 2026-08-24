import { Router, type IRouter } from "express";
import { eq, ilike, or, sql } from "drizzle-orm";
import { db, patientsTable, appointmentsTable, billsTable } from "@workspace/db";
import {
  ListPatientsQueryParams,
  CreatePatientBody,
  GetPatientParams,
  UpdatePatientParams,
  UpdatePatientBody,
  DeletePatientParams,
  ListPatientAppointmentsParams,
  ListPatientBillsParams,
} from "@workspace/api-zod";
import { toPatientResponse, toAppointmentResponse, toBillResponse } from "./helpers";

const router: IRouter = Router();

router.get("/patients", async (req, res): Promise<void> => {
  const query = ListPatientsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { search } = query.data;
  let rows;
  if (search) {
    const term = `%${search}%`;
    rows = await db
      .select()
      .from(patientsTable)
      .where(
        or(
          ilike(patientsTable.firstName, term),
          ilike(patientsTable.lastName, term),
          ilike(patientsTable.email, term),
          ilike(patientsTable.phone, term),
        ),
      )
      .orderBy(patientsTable.lastName);
  } else {
    rows = await db.select().from(patientsTable).orderBy(patientsTable.lastName);
  }
  res.json(rows.map(toPatientResponse));
});

router.post("/patients", async (req, res): Promise<void> => {
  const parsed = CreatePatientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const insertData = {
    ...parsed.data,
    dateOfBirth: parsed.data.dateOfBirth instanceof Date
      ? parsed.data.dateOfBirth.toISOString().slice(0, 10)
      : String(parsed.data.dateOfBirth),
  };
  const [patient] = await db.insert(patientsTable).values(insertData).returning();
  res.status(201).json(toPatientResponse(patient));
});

router.get("/patients/:id", async (req, res): Promise<void> => {
  const params = GetPatientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, params.data.id));
  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json(toPatientResponse(patient));
});

router.patch("/patients/:id", async (req, res): Promise<void> => {
  const params = UpdatePatientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdatePatientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.dateOfBirth !== undefined) {
    updateData.dateOfBirth = parsed.data.dateOfBirth instanceof Date
      ? parsed.data.dateOfBirth.toISOString().slice(0, 10)
      : String(parsed.data.dateOfBirth);
  }
  const [patient] = await db
    .update(patientsTable)
    .set(updateData)
    .where(eq(patientsTable.id, params.data.id))
    .returning();
  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json(toPatientResponse(patient));
});

router.delete("/patients/:id", async (req, res): Promise<void> => {
  const params = DeletePatientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db.delete(patientsTable).where(eq(patientsTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/patients/:id/appointments", async (req, res): Promise<void> => {
  const params = ListPatientAppointmentsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const rows = await db
    .select()
    .from(appointmentsTable)
    .where(eq(appointmentsTable.patientId, params.data.id))
    .orderBy(appointmentsTable.appointmentDate);

  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, params.data.id));
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "Unknown";
  res.json(rows.map((a) => toAppointmentResponse(a, patientName)));
});

router.get("/patients/:id/bills", async (req, res): Promise<void> => {
  const params = ListPatientBillsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const rows = await db
    .select()
    .from(billsTable)
    .where(eq(billsTable.patientId, params.data.id))
    .orderBy(billsTable.createdAt);

  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, params.data.id));
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "Unknown";
  res.json(rows.map((b) => toBillResponse(b, patientName)));
});

export default router;
