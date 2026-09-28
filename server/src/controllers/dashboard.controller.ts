import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";
import * as dashboardService from "../services/dashboard.service";

export const summary = asyncHandler(async (_req: Request, res: Response) => {
  const data = await dashboardService.getDashboard();
  return ok(res, data, "Dashboard data retrieved");
});
