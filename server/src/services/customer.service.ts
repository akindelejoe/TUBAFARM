import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { CreateCustomerInput, UpdateCustomerInput } from "../validators/customer.validators";

export async function listCustomers(skip: number, take: number, search?: string) {
  const where = search
    ? { name: { contains: search, mode: "insensitive" as const } }
    : {};

  const [items, total] = await prisma.$transaction([
    prisma.customer.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.customer.count({ where }),
  ]);

  return { items, total };
}

export async function createCustomer(input: CreateCustomerInput) {
  return prisma.customer.create({ data: input });
}

export async function updateCustomer(id: string, input: UpdateCustomerInput) {
  await getCustomerOrThrow(id);
  return prisma.customer.update({ where: { id }, data: input });
}

async function getCustomerOrThrow(id: string) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) throw AppError.notFound("Customer");
  return customer;
}

export async function getCustomerDetails(id: string) {
  await getCustomerOrThrow(id);

  const [sales, aggregate] = await Promise.all([
    prisma.sale.findMany({
      where: { customerId: id },
      orderBy: { saleDate: "desc" },
      take: 20,
      include: { saleItems: { include: { product: { select: { name: true } } } } },
    }),
    prisma.sale.aggregate({ where: { customerId: id }, _sum: { totalAmount: true }, _count: true }),
  ]);

  return {
    customer: await prisma.customer.findUnique({ where: { id } }),
    totalPurchases: aggregate._sum.totalAmount ?? 0,
    orderCount: aggregate._count,
    recentSales: sales,
  };
}
