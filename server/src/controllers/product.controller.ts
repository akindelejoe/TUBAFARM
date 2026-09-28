import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, paginated } from "../utils/apiResponse";
import { getPagination } from "../utils/pagination";
import * as productService from "../services/product.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { page, pageSize, skip, take } = getPagination(req);
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const { items, total } = await productService.listProducts(skip, take, search);
  return paginated(res, items, total, page, pageSize);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  return ok(res, product, "Product created successfully", 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  return ok(res, product, "Product updated successfully");
});

export const discontinue = asyncHandler(async (req: Request, res: Response) => {
  await productService.discontinueProduct(req.params.id);
  return ok(res, null, "Product discontinued successfully");
});
