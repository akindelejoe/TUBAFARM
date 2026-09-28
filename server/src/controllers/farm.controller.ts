import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, paginated } from "../utils/apiResponse";
import { getPagination } from "../utils/pagination";
import * as farmService from "../services/farm.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { page, pageSize, skip, take } = getPagination(req);
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const { items, total } = await farmService.listFarms(skip, take, search);
  return paginated(res, items, total, page, pageSize);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const farm = await farmService.createFarm(req.body);
  return ok(res, farm, "Farm created successfully", 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const farm = await farmService.updateFarm(req.params.id, req.body);
  return ok(res, farm, "Farm updated successfully");
});

export const archive = asyncHandler(async (req: Request, res: Response) => {
  await farmService.archiveFarm(req.params.id);
  return ok(res, null, "Farm archived successfully");
});

export const details = asyncHandler(async (req: Request, res: Response) => {
  const data = await farmService.getFarmDetails(req.params.id);
  return ok(res, data, "Farm details retrieved");
});
