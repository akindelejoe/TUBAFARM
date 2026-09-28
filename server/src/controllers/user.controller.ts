import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, paginated } from "../utils/apiResponse";
import { getPagination } from "../utils/pagination";
import * as userService from "../services/user.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { page, pageSize, skip, take } = getPagination(req);
  const { items, total } = await userService.listUsers(skip, take);
  return paginated(res, items, total, page, pageSize);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  return ok(res, user, "User created successfully", 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.params.id, req.body);
  return ok(res, user, "User updated successfully");
});

export const deactivate = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.deactivateUser(req.params.id);
  return ok(res, user, "User deactivated successfully");
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await userService.resetPassword(req.params.id, req.body);
  return ok(res, null, "Password reset successfully");
});
