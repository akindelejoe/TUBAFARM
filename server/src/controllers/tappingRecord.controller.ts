import { Request, Response } from "express";
import { Quality } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, paginated } from "../utils/apiResponse";
import { getPagination } from "../utils/pagination";
import { AppError } from "../utils/AppError";
import * as tappingRecordService from "../services/tappingRecord.service";

function str(v: unknown) {
  return typeof v === "string" ? v : undefined;
}

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { page, pageSize, skip, take } = getPagination(req);
  const { farmId, treeId, quality, dateFrom, dateTo } = req.query;
  const { items, total } = await tappingRecordService.listTappingRecords(skip, take, {
    farmId: str(farmId),
    treeId: str(treeId),
    quality: str(quality) as Quality | undefined,
    dateFrom: str(dateFrom) ? new Date(str(dateFrom) as string) : undefined,
    dateTo: str(dateTo) ? new Date(str(dateTo) as string) : undefined,
  });
  return paginated(res, items, total, page, pageSize);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized();
  const record = await tappingRecordService.createTappingRecord(req.body, req.user.id);
  return ok(res, record, "Tapping record created successfully", 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const record = await tappingRecordService.updateTappingRecord(req.params.id, req.body);
  return ok(res, record, "Tapping record updated successfully");
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await tappingRecordService.deleteTappingRecord(req.params.id);
  return ok(res, null, "Tapping record deleted successfully");
});
