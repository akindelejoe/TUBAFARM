import { ExpenseCategory, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { CreateExpenseInput, UpdateExpenseInput } from "../validators/expense.validators";

export interface ExpenseFilters {
  category?: ExpenseCategory;
  dateFrom?: Date;
  dateTo?: Date;
}

export async function listExpenses(skip: number, take: number, filters: ExpenseFilters) {
  const where: Prisma.ExpenseWhereInput = {
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.dateFrom || filters.dateTo
      ? {
          expenseDate: {
            ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
            ...(filters.dateTo ? { lte: filters.dateTo } : {}),
          },
        }
      : {}),
  };

  const [items, total, sumAgg] = await prisma.$transaction([
    prisma.expense.findMany({
      where,
      skip,
      take,
      orderBy: { expenseDate: "desc" },
      include: { supplier: { select: { id: true, name: true } } },
    }),
    prisma.expense.count({ where }),
    prisma.expense.aggregate({ where, _sum: { amount: true } }),
  ]);

  return { items, total, totalAmount: sumAgg._sum.amount ?? 0 };
}

export async function createExpense(input: CreateExpenseInput, createdByUserId: string) {
  if (input.supplierId) {
    const supplier = await prisma.supplier.findUnique({ where: { id: input.supplierId } });
    if (!supplier) throw AppError.notFound("Supplier");
  }
  return prisma.expense.create({ data: { ...input, createdByUserId } });
}

export async function updateExpense(id: string, input: UpdateExpenseInput) {
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) throw AppError.notFound("Expense");
  return prisma.expense.update({ where: { id }, data: input });
}

export async function deleteExpense(id: string) {
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) throw AppError.notFound("Expense");
  await prisma.expense.delete({ where: { id } });
}
