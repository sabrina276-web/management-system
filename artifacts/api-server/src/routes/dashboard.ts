import { Router, type IRouter } from "express";
import { eq, gte, lte, and, count, sql } from "drizzle-orm";
import { db, patientsTable, appointmentsTable, billsTable, inventoryTable } from "@workspace/db";
import { toAppointmentResponse, toPatientResponse } from "./helpers";

const router: IRouter = Router();

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const [
    [{ total: totalPatients }],
    [{ total: todayCount }],
    [{ total: monthCount }],
    outstandingBills,
    paidBills,
    statusCounts,
    upcomingRows,
    recentPatientRows,
    [{ lowStock }],
  ] = await Promise.all([
    db.select({ total: count() }).from(patientsTable),
    db.select({ total: count() }).from(appointmentsTable).where(eq(appointmentsTable.appointmentDate, today)),
    db.select({ total: count() }).from(appointmentsTable).where(
      and(
        gte(appointmentsTable.appointmentDate, monthStart),
        lte(appointmentsTable.appointmentDate, monthEnd),
      ),
    ),
    db.select({ amountPaid: billsTable.amountPaid, totalAmount: billsTable.totalAmount })
      .from(billsTable)
      .where(sql`${billsTable.status} IN ('pending','partial','overdue')`),
    db.select({ totalAmount: billsTable.totalAmount, amountPaid: billsTable.amountPaid })
      .from(billsTable)
      .where(eq(billsTable.status, "paid")),
    db.select({ status: appointmentsTable.status, total: count() })
      .from(appointmentsTable)
      .groupBy(appointmentsTable.status),
    db.select().from(appointmentsTable)
      .where(gte(appointmentsTable.appointmentDate, today))
      .orderBy(appointmentsTable.appointmentDate, appointmentsTable.appointmentTime)
      .limit(5),
    db.select().from(patientsTable).orderBy(patientsTable.createdAt).limit(5),
    db.select({ lowStock: count() }).from(inventoryTable)
      .where(lte(inventoryTable.quantity, inventoryTable.reorderLevel)),
  ]);

  const outstandingRevenue = outstandingBills.reduce(
    (sum, b) => sum + (Number(b.totalAmount) - Number(b.amountPaid)),
    0,
  );
  const totalRevenue = paidBills.reduce((sum, b) => sum + Number(b.totalAmount), 0);

  const statusMap: Record<string, number> = { scheduled: 0, confirmed: 0, completed: 0, cancelled: 0, no_show: 0 };
  for (const row of statusCounts) statusMap[row.status] = Number(row.total);

  const patientIds = [...new Set(upcomingRows.map((r) => r.patientId))];
  const patients = patientIds.length
    ? await db.select().from(patientsTable)
        .where(sql`${patientsTable.id} = ANY(${sql.raw(`ARRAY[${patientIds.join(",")}]::integer[]`)})`)
    : [];
  const patientMap = Object.fromEntries(patients.map((p) => [p.id, `${p.firstName} ${p.lastName}`]));

  res.json({
    totalPatients: Number(totalPatients),
    todayAppointments: Number(todayCount),
    totalAppointmentsThisMonth: Number(monthCount),
    outstandingRevenue,
    totalRevenue,
    appointmentsByStatus: statusMap,
    upcomingAppointments: upcomingRows.map((a) => toAppointmentResponse(a, patientMap[a.patientId] ?? "Unknown")),
    lowStockCount: Number(lowStock),
    recentPatients: recentPatientRows.map(toPatientResponse),
  });
});

export default router;
