import { Router, type IRouter } from "express";
import { eq, or, sql } from "drizzle-orm";
import { db, billsTable, patientsTable } from "@workspace/db";
import {
  ListBillsQueryParams,
  CreateBillBody,
  GetBillParams,
  UpdateBillParams,
  UpdateBillBody,
  DeleteBillParams,
} from "@workspace/api-zod";
import { toBillResponse } from "./helpers";

const router: IRouter = Router();

async function enrichBills(rows: (typeof billsTable.$inferSelect)[]) {
  const patientIds = [...new Set(rows.map((r) => r.patientId))];
  if (!patientIds.length) return rows.map((b) => toBillResponse(b, "Unknown"));
  const patients = await db
    .select()
    .from(patientsTable)
    .where(sql`${patientsTable.id} = ANY(${sql.raw(`ARRAY[${patientIds.join(",")}]::integer[]`)})`);
  const patientMap = Object.fromEntries(patients.map((p) => [p.id, `${p.firstName} ${p.lastName}`]));
  return rows.map((b) => toBillResponse(b, patientMap[b.patientId] ?? "Unknown"));
}

router.get("/bills/outstanding", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(billsTable)
    .where(or(eq(billsTable.status, "pending"), eq(billsTable.status, "partial"), eq(billsTable.status, "overdue")))
    .orderBy(billsTable.dueDate);
  res.json(await enrichBills(rows));
});

router.get("/bills", async (req, res): Promise<void> => {
  const query = ListBillsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const rows = await db
    .select()
    .from(billsTable)
    .where(query.data.status ? eq(billsTable.status, query.data.status) : undefined)
    .orderBy(billsTable.createdAt);
  res.json(await enrichBills(rows));
});

router.post("/bills", async (req, res): Promise<void> => {
  const parsed = CreateBillBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, parsed.data.patientId));
  if (!patient) {
    res.status(400).json({ error: "Patient not found" });
    return;
  }
  const dueDate = parsed.data.dueDate instanceof Date
    ? parsed.data.dueDate.toISOString().slice(0, 10)
    : String(parsed.data.dueDate);
  const [bill] = await db.insert(billsTable).values({
    patientId: parsed.data.patientId,
    appointmentId: parsed.data.appointmentId ?? null,
    totalAmount: String(parsed.data.totalAmount),
    amountPaid: String(parsed.data.amountPaid ?? 0),
    status: parsed.data.status ?? "pending",
    dueDate,
    notes: parsed.data.notes ?? null,
    items: parsed.data.items ?? [],
  }).returning();
  res.status(201).json(toBillResponse(bill, `${patient.firstName} ${patient.lastName}`));
});

router.get("/bills/:id", async (req, res): Promise<void> => {
  const params = GetBillParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [bill] = await db.select().from(billsTable).where(eq(billsTable.id, params.data.id));
  if (!bill) {
    res.status(404).json({ error: "Bill not found" });
    return;
  }
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, bill.patientId));
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "Unknown";
  res.json(toBillResponse(bill, patientName));
});

router.patch("/bills/:id", async (req, res): Promise<void> => {
  const params = UpdateBillParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateBillBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.totalAmount !== undefined) updateData.totalAmount = String(parsed.data.totalAmount);
  if (parsed.data.amountPaid !== undefined) updateData.amountPaid = String(parsed.data.amountPaid);
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.dueDate !== undefined) {
    updateData.dueDate = parsed.data.dueDate instanceof Date
      ? parsed.data.dueDate.toISOString().slice(0, 10)
      : String(parsed.data.dueDate);
  }
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;
  if (parsed.data.items !== undefined) updateData.items = parsed.data.items;

  const [bill] = await db
    .update(billsTable)
    .set(updateData)
    .where(eq(billsTable.id, params.data.id))
    .returning();
  if (!bill) {
    res.status(404).json({ error: "Bill not found" });
    return;
  }
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, bill.patientId));
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "Unknown";
  res.json(toBillResponse(bill, patientName));
});

router.delete("/bills/:id", async (req, res): Promise<void> => {
  const params = DeleteBillParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db.delete(billsTable).where(eq(billsTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Bill not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
