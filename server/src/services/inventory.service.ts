import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { AdjustmentInput, StockMovementInput } from "../validators/inventory.validators";

export type InventoryStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export function deriveInventoryStatus(quantityAvailable: number, reorderLevel: number): InventoryStatus {
  if (quantityAvailable <= 0) return "OUT_OF_STOCK";
  if (quantityAvailable <= reorderLevel) return "LOW_STOCK";
  return "IN_STOCK";
}

export async function listInventory(skip: number, take: number) {
  const [items, total] = await prisma.$transaction([
    prisma.inventory.findMany({
      skip,
      take,
      orderBy: { lastUpdated: "desc" },
      include: { product: true },
    }),
    prisma.inventory.count(),
  ]);

  return {
    items: items.map((i) => ({ ...i, status: deriveInventoryStatus(i.quantityAvailable, i.reorderLevel) })),
    total,
  };
}

export async function stockIn(input: StockMovementInput, userId: string) {
  return prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUnique({ where: { productId: input.productId } });
    if (!inventory) throw AppError.notFound("Inventory record for product");

    const updated = await tx.inventory.update({
      where: { productId: input.productId },
      data: { quantityAvailable: { increment: input.quantity } },
    });

    await tx.inventoryTransaction.create({
      data: {
        productId: input.productId,
        type: "STOCK_IN",
        quantity: input.quantity,
        reference: input.reference,
        notes: input.notes,
        createdByUserId: userId,
      },
    });

    return updated;
  });
}

export async function stockOut(input: StockMovementInput, userId: string) {
  return prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUnique({ where: { productId: input.productId } });
    if (!inventory) throw AppError.notFound("Inventory record for product");

    if (inventory.quantityAvailable - input.quantity < 0) {
      throw AppError.conflict(
        `Insufficient inventory: ${inventory.quantityAvailable} available, ${input.quantity} requested`
      );
    }

    const updated = await tx.inventory.update({
      where: { productId: input.productId },
      data: { quantityAvailable: { decrement: input.quantity } },
    });

    await tx.inventoryTransaction.create({
      data: {
        productId: input.productId,
        type: "STOCK_OUT",
        quantity: input.quantity,
        reference: input.reference,
        notes: input.notes,
        createdByUserId: userId,
      },
    });

    return updated;
  });
}

export async function adjustInventory(input: AdjustmentInput, userId: string) {
  return prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUnique({ where: { productId: input.productId } });
    if (!inventory) throw AppError.notFound("Inventory record for product");

    const delta = input.newQuantity - inventory.quantityAvailable;

    const updated = await tx.inventory.update({
      where: { productId: input.productId },
      data: { quantityAvailable: input.newQuantity },
    });

    await tx.inventoryTransaction.create({
      data: {
        productId: input.productId,
        type: "ADJUSTMENT",
        quantity: delta,
        notes: input.notes,
        createdByUserId: userId,
      },
    });

    return updated;
  });
}

export async function listTransactions(skip: number, take: number, productId?: string) {
  const where = productId ? { productId } : {};

  const [items, total] = await prisma.$transaction([
    prisma.inventoryTransaction.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { id: true, name: true, unit: true } },
        createdByUser: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.inventoryTransaction.count({ where }),
  ]);

  return { items, total };
}
