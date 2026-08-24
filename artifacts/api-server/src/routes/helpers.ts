import {
  patientsTable,
  appointmentsTable,
  billsTable,
  inventoryTable,
  employeesTable,
} from "@workspace/db";

export function toPatientResponse(p: typeof patientsTable.$inferSelect) {
  return {
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    phone: p.phone,
    dateOfBirth: p.dateOfBirth,
    address: p.address ?? null,
    insuranceProvider: p.insuranceProvider ?? null,
    insuranceNumber: p.insuranceNumber ?? null,
    notes: p.notes ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export function toAppointmentResponse(
  a: typeof appointmentsTable.$inferSelect,
  patientName: string,
) {
  return {
    id: a.id,
    patientId: a.patientId,
    patientName,
    dentistName: a.dentistName,
    appointmentDate: a.appointmentDate,
    appointmentTime: a.appointmentTime,
    durationMinutes: a.durationMinutes,
    type: a.type,
    status: a.status,
    notes: a.notes ?? null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

export function toBillResponse(
  b: typeof billsTable.$inferSelect,
  patientName: string,
) {
  return {
    id: b.id,
    patientId: b.patientId,
    patientName,
    appointmentId: b.appointmentId ?? null,
    totalAmount: Number(b.totalAmount),
    amountPaid: Number(b.amountPaid),
    status: b.status,
    dueDate: b.dueDate,
    notes: b.notes ?? null,
    items:
      (b.items as {
        description: string;
        quantity: number;
        unitPrice: number;
      }[]) ?? [],
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

export function toInventoryResponse(i: typeof inventoryTable.$inferSelect) {
  return {
    id: i.id,
    name: i.name,
    category: i.category,
    quantity: i.quantity,
    unit: i.unit,
    reorderLevel: i.reorderLevel,
    costPerUnit: Number(i.costPerUnit),
    supplier: i.supplier ?? null,
    lastRestockedAt: i.lastRestockedAt ? i.lastRestockedAt.toISOString() : null,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  };
}
export function toEmployeeResponse(e: typeof employeesTable.$inferSelect) {
  return {
    id: e.id,
    fullName: e.fullName,
    role: e.role,
    email: e.email,
    phone: e.phone,
    status: e.status,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}
