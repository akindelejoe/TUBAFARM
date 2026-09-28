import { Request, Response } from "express";
import { ExpenseCategory } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, paginated } from "../utils/apiResponse";
import { getPagination } from "../utils/pagination";
import { AppError } from "../utils/AppError";
import * as expenseService from "../services/expense.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { page, pageSize, skip, take } = getPagination(req);
  const { category, dateFrom, dateTo } = req.query;
  const { items, total, totalAmount } = await expenseService.listExpenses(skip, take, {
    category: typeof category === "string" ? (category as ExpenseCategory) : undefined,
    dateFrom: typeof dateFrom === "string" ? new Date(dateFrom) : undefined,
    dateTo: typeof dateTo === "string" ? new Date(dateTo) : undefined,
  });
  return res.status(200).json({
    success: true,
    message: "Success",
    data: items,
    pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) || 1 },
    totalAmount,
  });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized();
  const expense = await expenseService.createExpense(req.body, req.user.id);
  return ok(res, expense, "Expense recorded successfully", 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expenseService.updateExpense(req.params.id, req.body);
  return ok(res, expense, "Expense updated successfully");
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await expenseService.deleteExpense(req.params.id);
  return ok(res, null, "Expense deleted successfully");
});
