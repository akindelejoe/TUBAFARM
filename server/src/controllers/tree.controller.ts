import { Request, Response } from "express";
import { TreeStatus } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, paginated } from "../utils/apiResponse";
import { getPagination } from "../utils/pagination";
import * as treeService from "../services/tree.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { page, pageSize, skip, take } = getPagination(req);
  const { farmId, status, search } = req.query;
  const { items, total } = await treeService.listTrees(skip, take, {
    farmId: typeof farmId === "string" ? farmId : undefined,
    status: typeof status === "string" ? (status as TreeStatus) : undefined,
    search: typeof search === "string" ? search : undefined,
  });
  return paginated(res, items, total, page, pageSize);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const tree = await treeService.createTree(req.body);
  return ok(res, tree, "Tree created successfully", 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const tree = await treeService.updateTree(req.params.id, req.body);
  return ok(res, tree, "Tree updated successfully");
});

export const archive = asyncHandler(async (req: Request, res: Response) => {
  await treeService.archiveTree(req.params.id);
  return ok(res, null, "Tree marked as removed");
});

export const details = asyncHandler(async (req: Request, res: Response) => {
  const data = await treeService.getTreeDetails(req.params.id);
  return ok(res, data, "Tree details retrieved");
});
