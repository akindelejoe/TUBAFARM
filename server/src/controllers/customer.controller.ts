import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, paginated } from "../utils/apiResponse";
import { getPagination } from "../utils/pagination";
import * as customerService from "../services/customer.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { page, pageSize, skip, take } = getPagination(req);
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const { items, total } = await customerService.listCustomers(skip, take, search);
  return paginated(res, items, total, page, pageSize);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const customer = await customerService.createCustomer(req.body);
  return ok(res, customer, "Customer created successfully", 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const customer = await customerService.updateCustomer(req.params.id, req.body);
  return ok(res, customer, "Customer updated successfully");
});

export const details = asyncHandler(async (req: Request, res: Response) => {
  const data = await customerService.getCustomerDetails(req.params.id);
  return ok(res, data, "Customer details retrieved");
});
