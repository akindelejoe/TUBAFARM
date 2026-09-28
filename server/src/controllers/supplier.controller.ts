import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, paginated } from "../utils/apiResponse";
import { getPagination } from "../utils/pagination";
import * as supplierService from "../services/supplier.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { page, pageSize, skip, take } = getPagination(req);
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const { items, total } = await supplierService.listSuppliers(skip, take, search);
  return paginated(res, items, total, page, pageSize);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await supplierService.createSupplier(req.body);
  return ok(res, supplier, "Supplier created successfully", 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await supplierService.updateSupplier(req.params.id, req.body);
  return ok(res, supplier, "Supplier updated successfully");
});

export const archive = asyncHandler(async (req: Request, res: Response) => {
  await supplierService.archiveSupplier(req.params.id);
  return ok(res, null, "Supplier archived successfully");
});

export const details = asyncHandler(async (req: Request, res: Response) => {
  const data = await supplierService.getSupplierDetails(req.params.id);
  return ok(res, data, "Supplier details retrieved");
});
