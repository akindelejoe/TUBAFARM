import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";
import * as authService from "../services/auth.service";
import { AppError } from "../utils/AppError";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  return ok(res, result, "Login successful");
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized();
  const profile = await authService.getProfile(req.user.id);
  return ok(res, profile, "Profile retrieved");
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  return ok(res, null, "Logged out. Discard the client-side token.");
});
