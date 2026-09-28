import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { CreateSupplierInput, UpdateSupplierInput } from "../validators/supplier.validators";

export async function listSuppliers(skip: number, take: number, search?: string) {
  const where = {
    isArchived: false,
    ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.supplier.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.supplier.count({ where }),
  ]);

  return { items, total };
}

export async function createSupplier(input: CreateSupplierInput) {
  return prisma.supplier.create({ data: input });
}

export async function updateSupplier(id: string, input: UpdateSupplierInput) {
  await getSupplierOrThrow(id);
  return prisma.supplier.update({ where: { id }, data: input });
}

export async function archiveSupplier(id: string) {
  await getSupplierOrThrow(id);
  return prisma.supplier.update({ where: { id }, data: { isArchived: true } });
}

async function getSupplierOrThrow(id: string) {
  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) throw AppError.notFound("Supplier");
  return supplier;
}

export async function getSupplierDetails(id: string) {
  const supplier = await getSupplierOrThrow(id);
  const expenses = await prisma.expense.findMany({
    where: { supplierId: id },
    orderBy: { expenseDate: "desc" },
    take: 20,
  });
  return { supplier, expenses };
}
