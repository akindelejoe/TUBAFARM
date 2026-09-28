import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { deriveInventoryStatus } from "./inventory.service";

function startOfDay(d = new Date()) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

interface TimeBucket {
  bucket: Date;
  total: string | number | null;
}

async function bucketedSum(table: "tapping_records" | "sales" | "expenses", dateColumn: string, valueColumn: string, unit: "day" | "week" | "month", sinceMonthsOrDays: number, isDay: boolean) {
  const since = isDay
    ? new Date(Date.now() - sinceMonthsOrDays * 24 * 60 * 60 * 1000)
    : new Date(new Date().getFullYear(), new Date().getMonth() - sinceMonthsOrDays, 1);

  const rows = await prisma.$queryRaw<TimeBucket[]>(Prisma.sql`
    SELECT date_trunc(${unit}, "${Prisma.raw(dateColumn)}") AS bucket, SUM("${Prisma.raw(valueColumn)}") AS total
    FROM ${Prisma.raw(`"${table}"`)}
    WHERE "${Prisma.raw(dateColumn)}" >= ${since}
    GROUP BY bucket
    ORDER BY bucket ASC
  `);

  return rows.map((r) => ({ date: r.bucket, total: Number(r.total ?? 0) }));
}

export async function getDashboard() {
  const today = startOfDay();
  const monthStart = startOfMonth();

  const [
    totalFarms,
    totalTrees,
    activeTrees,
    todayProductionAgg,
    monthlyProductionAgg,
    monthlySalesAgg,
    monthlyExpensesAgg,
    inventoryRecords,
    recentTappingRecords,
    recentSales,
    topTrees,
    farms,
  ] = await Promise.all([
    prisma.farm.count({ where: { isArchived: false } }),
    prisma.tree.count(),
    prisma.tree.count({ where: { status: "ACTIVE" } }),
    prisma.tappingRecord.aggregate({ where: { tapDate: { gte: today } }, _sum: { quantityLiters: true } }),
    prisma.tappingRecord.aggregate({ where: { tapDate: { gte: monthStart } }, _sum: { quantityLiters: true } }),
    prisma.sale.aggregate({ where: { saleDate: { gte: monthStart } }, _sum: { totalAmount: true } }),
    prisma.expense.aggregate({ where: { expenseDate: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.inventory.findMany({ include: { product: { select: { id: true, name: true, unit: true } } } }),
    prisma.tappingRecord.findMany({
      orderBy: { tapDate: "desc" },
      take: 5,
      include: { tree: { select: { treeCode: true } }, recordedBy: { select: { firstName: true, lastName: true } } },
    }),
    prisma.sale.findMany({
      orderBy: { saleDate: "desc" },
      take: 5,
      include: { customer: { select: { name: true } } },
    }),
    prisma.tappingRecord.groupBy({
      by: ["treeId"],
      _sum: { quantityLiters: true },
      orderBy: { _sum: { quantityLiters: "desc" } },
      take: 5,
    }),
    prisma.farm.findMany({ where: { isArchived: false }, select: { id: true, name: true } }),
  ]);

  const treeInfos = await prisma.tree.findMany({
    where: { id: { in: topTrees.map((t) => t.treeId) } },
    select: { id: true, treeCode: true, species: true, farm: { select: { name: true } } },
  });
  const treeInfoMap = new Map(treeInfos.map((t) => [t.id, t]));

  const lowInventory = inventoryRecords
    .map((inv) => ({ ...inv, status: deriveInventoryStatus(inv.quantityAvailable, inv.reorderLevel) }))
    .filter((inv) => inv.status !== "IN_STOCK");

  const farmPerformance = await Promise.all(
    farms.map(async (farm) => {
      const agg = await prisma.tappingRecord.aggregate({
        where: { tree: { farmId: farm.id } },
        _sum: { quantityLiters: true },
      });
      return { farmId: farm.id, farmName: farm.name, totalProductionLiters: agg._sum.quantityLiters ?? 0 };
    })
  );

  const totalInventoryUnits = inventoryRecords.reduce((sum, i) => sum + i.quantityAvailable, 0);
  const monthlySales = Number(monthlySalesAgg._sum.totalAmount ?? 0);
  const monthlyExpenses = Number(monthlyExpensesAgg._sum.amount ?? 0);

  const productBreakdownGrouped = await prisma.saleItem.groupBy({
    by: ["productId"],
    _sum: { lineTotal: true },
    orderBy: { _sum: { lineTotal: "desc" } },
    take: 8,
  });
  const breakdownProducts = await prisma.product.findMany({
    where: { id: { in: productBreakdownGrouped.map((p) => p.productId) } },
    select: { id: true, name: true },
  });
  const breakdownProductMap = new Map(breakdownProducts.map((p) => [p.id, p.name]));
  const productSalesBreakdown = productBreakdownGrouped.map((p) => ({
    productName: breakdownProductMap.get(p.productId) ?? "Unknown",
    totalRevenue: Number(p._sum.lineTotal ?? 0),
  }));

  return {
    kpis: {
      totalFarms,
      totalTrees,
      activeTrees,
      todaysProductionLiters: todayProductionAgg._sum.quantityLiters ?? 0,
      monthlyProductionLiters: monthlyProductionAgg._sum.quantityLiters ?? 0,
      currentInventoryUnits: totalInventoryUnits,
      monthlySales,
      monthlyExpenses,
      estimatedProfit: monthlySales - monthlyExpenses,
    },
    charts: {
      dailyTuppingCollection: await bucketedSum("tapping_records", "tapDate", "quantityLiters", "day", 7, true),
      weeklyTuppingCollection: await bucketedSum("tapping_records", "tapDate", "quantityLiters", "week", 56, true),
      monthlyProductionTrend: await bucketedSum("tapping_records", "tapDate", "quantityLiters", "month", 12, false),
      salesTrend: await bucketedSum("sales", "saleDate", "totalAmount", "month", 12, false),
      expensesTrend: await bucketedSum("expenses", "expenseDate", "amount", "month", 12, false),
      productSalesBreakdown,
    },
    recentTappingRecords,
    recentSales,
    lowInventoryAlerts: lowInventory,
    highestProducingTrees: topTrees.map((t) => ({
      tree: treeInfoMap.get(t.treeId),
      totalLiters: t._sum.quantityLiters ?? 0,
    })),
    farmPerformance,
  };
}
