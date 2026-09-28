import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";
import { toCsv } from "../utils/csv";
import * as reportService from "../services/report.service";
import { DateRangeInput } from "../validators/report.validators";

function getRange(req: Request): DateRangeInput {
  const { dateFrom, dateTo } = req.query;
  return {
    dateFrom: typeof dateFrom === "string" ? new Date(dateFrom) : undefined,
    dateTo: typeof dateTo === "string" ? new Date(dateTo) : undefined,
  };
}

function wantsCsv(req: Request) {
  return req.query.format === "csv";
}

export const production = asyncHandler(async (req: Request, res: Response) => {
  const report = await reportService.productionReport(getRange(req));
  if (wantsCsv(req)) {
    res.header("Content-Type", "text/csv").attachment("production-report.csv").send(toCsv(report.rows as never));
    return;
  }
  return ok(res, report, "Production report generated");
});

export const sales = asyncHandler(async (req: Request, res: Response) => {
  const report = await reportService.salesReport(getRange(req));
  if (wantsCsv(req)) {
    res.header("Content-Type", "text/csv").attachment("sales-report.csv").send(toCsv(report.rows as never));
    return;
  }
  return ok(res, report, "Sales report generated");
});

export const inventory = asyncHandler(async (_req: Request, res: Response) => {
  const report = await reportService.inventoryReport();
  if (wantsCsv(_req)) {
    res.header("Content-Type", "text/csv").attachment("inventory-report.csv").send(toCsv(report.rows as never));
    return;
  }
  return ok(res, report, "Inventory report generated");
});

export const expenses = asyncHandler(async (req: Request, res: Response) => {
  const report = await reportService.expenseReport(getRange(req));
  if (wantsCsv(req)) {
    res.header("Content-Type", "text/csv").attachment("expense-report.csv").send(toCsv(report.rows as never));
    return;
  }
  return ok(res, report, "Expense report generated");
});

export const profitLoss = asyncHandler(async (req: Request, res: Response) => {
  const report = await reportService.profitLossSummary(getRange(req));
  return ok(res, report, "Profit/Loss summary generated");
});

export const treeProductivity = asyncHandler(async (req: Request, res: Response) => {
  const report = await reportService.treeProductivityReport(getRange(req));
  if (wantsCsv(req)) {
    res.header("Content-Type", "text/csv").attachment("tree-productivity-report.csv").send(toCsv(report.rows as never));
    return;
  }
  return ok(res, report, "Tree productivity report generated");
});

export const customerSales = asyncHandler(async (req: Request, res: Response) => {
  const report = await reportService.customerSalesReport(getRange(req));
  if (wantsCsv(req)) {
    res.header("Content-Type", "text/csv").attachment("customer-sales-report.csv").send(toCsv(report.rows as never));
    return;
  }
  return ok(res, report, "Customer sales report generated");
});
