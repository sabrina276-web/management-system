import { Router, type IRouter } from "express";
import { eq, ilike, or } from "drizzle-orm";
import {
  db,
  employeesTable,
  insertEmployeeSchema,
} from "@workspace/db";
import { toEmployeeResponse } from "./helpers";

const router: IRouter = Router();

router.get("/employees", async (req, res): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;

    let rows;

    if (search) {
      const term = `%${search}%`;

      rows = await db
        .select()
        .from(employeesTable)
        .where(
          or(
            ilike(employeesTable.fullName, term),
            ilike(employeesTable.email, term),
            ilike(employeesTable.role, term),
            ilike(employeesTable.phone, term),
          ),
        )
        .orderBy(employeesTable.fullName);
    } else {
      rows = await db
        .select()
        .from(employeesTable)
        .orderBy(employeesTable.fullName);
    }

    res.json(rows.map(toEmployeeResponse));
  } catch (error) {
    console.error("Failed to list employees:", error);
    res.status(500).json({
      message: "Failed to load employees",
    });
  }
});

router.post("/employees", async (req, res): Promise<void> => {
  try {
    const result = insertEmployeeSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: "Invalid employee data",
        errors: result.error.flatten(),
      });
      return;
    }

    const [employee] = await db
      .insert(employeesTable)
      .values(result.data)
      .returning();

    res.status(201).json(toEmployeeResponse(employee));
  } catch (error) {
    console.error("Failed to create employee:", error);

    res.status(500).json({
      message: "Failed to create employee",
    });
  }
});
router.patch("/employees/:id", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      res.status(400).json({ message: "Invalid employee ID" });
      return;
    }

    const { fullName, role, email, phone, status } = req.body;

    const [employee] = await db
      .update(employeesTable)
      .set({
        ...(fullName !== undefined && { fullName }),
        ...(role !== undefined && { role }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(status !== undefined && { status }),
      })
      .where(eq(employeesTable.id, id))
      .returning();

    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    res.json(toEmployeeResponse(employee));
  } catch (error) {
    console.error("Failed to update employee:", error);
    res.status(500).json({
      message: "Failed to update employee",
    });
  }
});

router.delete("/employees/:id", async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      res.status(400).json({ message: "Invalid employee ID" });
      return;
    }

    const [deleted] = await db
      .delete(employeesTable)
      .where(eq(employeesTable.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete employee:", error);
    res.status(500).json({
      message: "Failed to delete employee",
    });
  }
});

export default router;
