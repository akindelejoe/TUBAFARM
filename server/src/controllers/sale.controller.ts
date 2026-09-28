import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, paginated } from "../utils/apiResponse";
import { getPagination } from "../utils/pagination";
import { AppError } from "../utils/AppError";
import * as saleService from "../services/sale.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { page, pageSize, skip, take } = getPagination(req);
  const customerId = typeof req.query.customerId === "string" ? req.query.customerId : undefined;
  const { items, total } = await saleService.listSales(skip, take, customerId);
  return paginated(res, items, total, page, pageSize);
});

export const details = asyncHandler(async (req: Request, res: Response) => {
  const sale = await saleService.getSale(req.params.id);
  return ok(res, sale, "Sale retrieved");
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized();
  const sale = await saleService.createSale(req.body, req.user.id);
  return ok(res, sale, "Sale completed successfully", 201);
});
