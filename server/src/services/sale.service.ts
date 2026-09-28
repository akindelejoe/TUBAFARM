import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { CreateSaleInput } from "../validators/sale.validators";

export async function listSales(skip: number, take: number, customerId?: string) {
  const where = customerId ? { customerId } : {};

  const [items, total] = await prisma.$transaction([
    prisma.sale.findMany({
      where,
      skip,
      take,
      orderBy: { saleDate: "desc" },
      include: {
        customer: { select: { id: true, name: true } },
        soldBy: { select: { id: true, firstName: true, lastName: true } },
        saleItems: { include: { product: { select: { name: true, unit: true } } } },
      },
    }),
    prisma.sale.count({ where }),
  ]);

  return { items, total };
}

export async function getSale(id: string) {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      customer: true,
      soldBy: { select: { id: true, firstName: true, lastName: true } },
      saleItems: { include: { product: true } },
    },
  });
  if (!sale) throw AppError.notFound("Sale");
  return sale;
}

// Financial calculations happen here, server-side only. Client-submitted totals are never trusted.
export async function createSale(input: CreateSaleInput, soldByUserId: string) {
  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({ where: { id: input.customerId } });
    if (!customer) throw AppError.notFound("Customer");

    const productIds = input.items.map((item) => item.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
      include: { inventory: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = new Prisma.Decimal(0);
    const lineItems: { productId: string; quantity: number; unitPrice: Prisma.Decimal; lineTotal: Prisma.Decimal }[] = [];

    for (const item of input.items) {
      const product = productMap.get(item.productId);
      if (!product) throw AppError.notFound(`Product ${item.productId}`);
      if (product.status !== "ACTIVE") throw AppError.conflict(`Product "${product.name}" is not active`);
      if (!product.inventory || product.inventory.quantityAvailable < item.quantity) {
        throw AppError.conflict(
          `Insufficient inventory for "${product.name}": ${product.inventory?.quantityAvailable ?? 0} available, ${item.quantity} requested`
        );
      }

      const unitPrice = product.sellingPrice;
      const lineTotal = unitPrice.mul(item.quantity);
      subtotal = subtotal.add(lineTotal);
      lineItems.push({ productId: item.productId, quantity: item.quantity, unitPrice, lineTotal });
    }

    const discount = new Prisma.Decimal(input.discount ?? 0);
    if (discount.gt(subtotal)) throw AppError.conflict("Discount cannot exceed subtotal");
    const totalAmount = subtotal.sub(discount);

    const sale = await tx.sale.create({
      data: {
        customerId: input.customerId,
        soldByUserId,
        saleDate: input.saleDate ?? new Date(),
        subtotal,
        discount,
        totalAmount,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentStatus ?? "UNPAID",
        notes: input.notes,
        saleItems: { create: lineItems },
      },
      include: { saleItems: { include: { product: true } }, customer: true },
    });

    for (const item of lineItems) {
      await tx.inventory.update({
        where: { productId: item.productId },
        data: { quantityAvailable: { decrement: item.quantity } },
      });
      await tx.inventoryTransaction.create({
        data: {
          productId: item.productId,
          type: "SALE",
          quantity: item.quantity,
          reference: sale.id,
          notes: `Sale ${sale.id}`,
          createdByUserId: soldByUserId,
        },
      });
    }

    return sale;
  });
}
