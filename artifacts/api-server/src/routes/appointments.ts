import { Router, type IRouter } from "express";
import { eq, and, gte, sql } from "drizzle-orm";
import { db, appointmentsTable, patientsTable } from "@workspace/db";
import {
  ListAppointmentsQueryParams,
  CreateAppointmentBody,
  GetAppointmentParams,
  UpdateAppointmentParams,
  UpdateAppointmentBody,
  DeleteAppointmentParams,
} from "@workspace/api-zod";
import { toAppointmentResponse } from "./helpers";

const router: IRouter = Router();

async function enrichAppointments(rows: (typeof appointmentsTable.$inferSelect)[]) {
  const patientIds = [...new Set(rows.map((r) => r.patientId))];
  if (!patientIds.length) return rows.map((a) => toAppointmentResponse(a, "Unknown"));
  const patients = await db
    .select()
    .from(patientsTable)
    .where(sql`${patientsTable.id} = ANY(${sql.raw(`ARRAY[${patientIds.join(",")}]::integer[]`)})`);
  const patientMap = Object.fromEntries(patients.map((p) => [p.id, `${p.firstName} ${p.lastName}`]));
  return rows.map((a) => toAppointmentResponse(a, patientMap[a.patientId] ?? "Unknown"));
}

router.get("/appointments/today", async (req, res): Promise<void> => {
  const today = new Date().toISOString().slice(0, 10);
  const rows = await db
    .select()
    .from(appointmentsTable)
    .where(eq(appointmentsTable.appointmentDate, today))
    .orderBy(appointmentsTable.appointmentTime);
  res.json(await enrichAppointments(rows));
});

router.get("/appointments", async (req, res): Promise<void> => {
  const query = ListAppointmentsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions = [];
  if (query.data.date) {
    const dateStr = query.data.date instanceof Date
      ? query.data.date.toISOString().slice(0, 10)
      : String(query.data.date);
    conditions.push(eq(appointmentsTable.appointmentDate, dateStr));
  }
  if (query.data.status) conditions.push(eq(appointmentsTable.status, query.data.status));

  const rows = await db
    .select()
    .from(appointmentsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(appointmentsTable.appointmentDate, appointmentsTable.appointmentTime);

  res.json(await enrichAppointments(rows));
});

router.post("/appointments", async (req, res): Promise<void> => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, parsed.data.patientId));
  if (!patient) {
    res.status(400).json({ error: "Patient not found" });
    return;
  }
  const apptDate = parsed.data.appointmentDate instanceof Date
    ? parsed.data.appointmentDate.toISOString().slice(0, 10)
    : String(parsed.data.appointmentDate);
  const [appt] = await db.insert(appointmentsTable).values({
    ...parsed.data,
    appointmentDate: apptDate,
    status: parsed.data.status ?? "scheduled",
  }).returning();
  res.status(201).json(toAppointmentResponse(appt, `${patient.firstName} ${patient.lastName}`));
});

router.get("/appointments/:id", async (req, res): Promise<void> => {
  const params = GetAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [appt] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, params.data.id));
  if (!appt) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, appt.patientId));
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "Unknown";
  res.json(toAppointmentResponse(appt, patientName));
});

router.patch("/appointments/:id", async (req, res): Promise<void> => {
  const params = UpdateAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.appointmentDate !== undefined) {
    updateData.appointmentDate = parsed.data.appointmentDate instanceof Date
      ? parsed.data.appointmentDate.toISOString().slice(0, 10)
      : String(parsed.data.appointmentDate);
  }
  const [appt] = await db
    .update(appointmentsTable)
    .set(updateData)
    .where(eq(appointmentsTable.id, params.data.id))
    .returning();
  if (!appt) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, appt.patientId));
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "Unknown";
  res.json(toAppointmentResponse(appt, patientName));
});

router.delete("/appointments/:id", async (req, res): Promise<void> => {
  const params = DeleteAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db.delete(appointmentsTable).where(eq(appointmentsTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
