import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, paginated } from "../utils/apiResponse";
import { getPagination } from "../utils/pagination";
import { AppError } from "../utils/AppError";
import * as inventoryService from "../services/inventory.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { page, pageSize, skip, take } = getPagination(req);
  const { items, total } = await inventoryService.listInventory(skip, take);
  return paginated(res, items, total, page, pageSize);
});

export const stockIn = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized();
  const inventory = await inventoryService.stockIn(req.body, req.user.id);
  return ok(res, inventory, "Stock added successfully");
});

export const stockOut = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized();
  const inventory = await inventoryService.stockOut(req.body, req.user.id);
  return ok(res, inventory, "Stock removed successfully");
});

export const adjust = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized();
  const inventory = await inventoryService.adjustInventory(req.body, req.user.id);
  return ok(res, inventory, "Inventory adjusted successfully");
});

export const transactions = asyncHandler(async (req: Request, res: Response) => {
  const { page, pageSize, skip, take } = getPagination(req);
  const productId = typeof req.query.productId === "string" ? req.query.productId : undefined;
  const { items, total } = await inventoryService.listTransactions(skip, take, productId);
  return paginated(res, items, total, page, pageSize);
});
