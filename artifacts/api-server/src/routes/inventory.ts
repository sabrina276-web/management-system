import { Router, type IRouter } from "express";
import { eq, lte } from "drizzle-orm";
import { db, inventoryTable } from "@workspace/db";
import {
  ListInventoryItemsQueryParams,
  CreateInventoryItemBody,
  GetInventoryItemParams,
  UpdateInventoryItemParams,
  UpdateInventoryItemBody,
  DeleteInventoryItemParams,
} from "@workspace/api-zod";
import { toInventoryResponse } from "./helpers";

const router: IRouter = Router();

router.get("/inventory/low-stock", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(inventoryTable)
    .where(lte(inventoryTable.quantity, inventoryTable.reorderLevel))
    .orderBy(inventoryTable.quantity);
  res.json(rows.map(toInventoryResponse));
});

router.get("/inventory", async (req, res): Promise<void> => {
  const query = ListInventoryItemsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const rows = await db
    .select()
    .from(inventoryTable)
    .where(query.data.category ? eq(inventoryTable.category, query.data.category) : undefined)
    .orderBy(inventoryTable.name);
  res.json(rows.map(toInventoryResponse));
});

router.post("/inventory", async (req, res): Promise<void> => {
  const parsed = CreateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(inventoryTable).values({
    ...parsed.data,
    costPerUnit: String(parsed.data.costPerUnit),
  }).returning();
  res.status(201).json(toInventoryResponse(item));
});

router.get("/inventory/:id", async (req, res): Promise<void> => {
  const params = GetInventoryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [item] = await db.select().from(inventoryTable).where(eq(inventoryTable.id, params.data.id));
  if (!item) {
    res.status(404).json({ error: "Inventory item not found" });
    return;
  }
  res.json(toInventoryResponse(item));
});

router.patch("/inventory/:id", async (req, res): Promise<void> => {
  const params = UpdateInventoryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.category !== undefined) updateData.category = parsed.data.category;
  if (parsed.data.quantity !== undefined) updateData.quantity = parsed.data.quantity;
  if (parsed.data.unit !== undefined) updateData.unit = parsed.data.unit;
  if (parsed.data.reorderLevel !== undefined) updateData.reorderLevel = parsed.data.reorderLevel;
  if (parsed.data.costPerUnit !== undefined) updateData.costPerUnit = String(parsed.data.costPerUnit);
  if (parsed.data.supplier !== undefined) updateData.supplier = parsed.data.supplier;
  if (parsed.data.lastRestockedAt !== undefined) {
    updateData.lastRestockedAt = parsed.data.lastRestockedAt ? new Date(parsed.data.lastRestockedAt) : null;
  }

  const [item] = await db
    .update(inventoryTable)
    .set(updateData)
    .where(eq(inventoryTable.id, params.data.id))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Inventory item not found" });
    return;
  }
  res.json(toInventoryResponse(item));
});

router.delete("/inventory/:id", async (req, res): Promise<void> => {
  const params = DeleteInventoryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db.delete(inventoryTable).where(eq(inventoryTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Inventory item not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
