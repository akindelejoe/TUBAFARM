import { z } from "zod";

export const treeStatusEnum = z.enum(["ACTIVE", "INACTIVE", "DISEASED", "REMOVED"]);

export const createTreeSchema = z.object({
  farmId: z.string().uuid(),
  treeCode: z.string().min(1),
  species: z.string().min(1),
  variety: z.string().optional(),
  plantingDate: z.coerce.date(),
  status: treeStatusEnum.optional(),
  notes: z.string().optional(),
});

export const updateTreeSchema = createTreeSchema.partial();

export const treeQuerySchema = z.object({
  farmId: z.string().uuid().optional(),
  status: treeStatusEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
});

export type CreateTreeInput = z.infer<typeof createTreeSchema>;
export type UpdateTreeInput = z.infer<typeof updateTreeSchema>;
