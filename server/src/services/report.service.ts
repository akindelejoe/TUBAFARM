import { prisma } from "../config/prisma";
import { DateRangeInput } from "../validators/report.validators";

function dateFilter(range: DateRangeInput) {
  if (!range.dateFrom && !range.dateTo) return {};
  return {
    ...(range.dateFrom ? { gte: range.dateFrom } : {}),
    ...(range.dateTo ? { lte: range.dateTo } : {}),
  };
}

export async function productionReport(range: DateRangeInput) {
  const where = { tapDate: dateFilter(range) };
  const records = await prisma.tappingRecord.findMany({
    where,
    orderBy: { tapDate: "desc" },
    include: { tree: { select: { treeCode: true, species: true, farm: { select: { name: true } } } } },
  });
  const totalLiters = records.reduce((sum, r) => sum + r.quantityLiters, 0);
  return { rows: records, totalLiters, count: records.length };
}

export async function salesReport(range: DateRangeInput) {
  const where = { saleDate: dateFilter(range) };
  const sales = await prisma.sale.findMany({
    where,
    orderBy: { saleDate: "desc" },
    include: { customer: { select: { name: true } }, saleItems: { include: { product: { select: { name: true } } } } },
  });
  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
  return { rows: sales, totalRevenue, count: sales.length };
}

export async function inventoryReport() {
  const inventory = await prisma.inventory.findMany({ include: { product: true } });
  return { rows: inventory, count: inventory.length };
}

export async function expenseReport(range: DateRangeInput) {
  const where = { expenseDate: dateFilter(range) };
  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { expenseDate: "desc" },
    include: { supplier: { select: { name: true } } },
  });
  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  return { rows: expenses, totalAmount, count: expenses.length };
}

export async function profitLossSummary(range: DateRangeInput) {
  const [sales, expenses] = await Promise.all([
    prisma.sale.aggregate({ where: { saleDate: dateFilter(range) }, _sum: { totalAmount: true } }),
    prisma.expense.aggregate({ where: { expenseDate: dateFilter(range) }, _sum: { amount: true } }),
  ]);
  const revenue = Number(sales._sum.totalAmount ?? 0);
  const totalExpenses = Number(expenses._sum.amount ?? 0);
  return { revenue, totalExpenses, profit: revenue - totalExpenses };
}

export async function treeProductivityReport(range: DateRangeInput) {
  const grouped = await prisma.tappingRecord.groupBy({
    by: ["treeId"],
    where: { tapDate: dateFilter(range) },
    _sum: { quantityLiters: true },
    _count: true,
    orderBy: { _sum: { quantityLiters: "desc" } },
  });

  const trees = await prisma.tree.findMany({
    where: { id: { in: grouped.map((g) => g.treeId) } },
    select: { id: true, treeCode: true, species: true, status: true, farm: { select: { name: true } } },
  });
  const treeMap = new Map(trees.map((t) => [t.id, t]));

  const rows = grouped.map((g) => ({
    tree: treeMap.get(g.treeId),
    totalLiters: g._sum.quantityLiters ?? 0,
    tappingCount: g._count,
    averagePerTapping: g._count > 0 ? (g._sum.quantityLiters ?? 0) / g._count : 0,
  }));

  return { rows };
}

export async function customerSalesReport(range: DateRangeInput) {
  const grouped = await prisma.sale.groupBy({
    by: ["customerId"],
    where: { saleDate: dateFilter(range) },
    _sum: { totalAmount: true },
    _count: true,
    orderBy: { _sum: { totalAmount: "desc" } },
  });

  const customers = await prisma.customer.findMany({
    where: { id: { in: grouped.map((g) => g.customerId) } },
    select: { id: true, name: true, customerType: true },
  });
  const customerMap = new Map(customers.map((c) => [c.id, c]));

  const rows = grouped.map((g) => ({
    customer: customerMap.get(g.customerId),
    totalSpent: g._sum.totalAmount ?? 0,
    orderCount: g._count,
  }));

  return { rows };
}
