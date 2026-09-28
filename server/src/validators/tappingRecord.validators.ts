import { z } from "zod";

export const qualityEnum = z.enum(["EXCELLENT", "GOOD", "AVERAGE", "POOR"]);

export const createTappingRecordSchema = z.object({
  treeId: z.string().uuid(),
  tapDate: z.coerce.date(),
  quantityLiters: z.number().positive(),
  quality: qualityEnum,
  remarks: z.string().optional(),
});

export const updateTappingRecordSchema = createTappingRecordSchema.partial();

export type CreateTappingRecordInput = z.infer<typeof createTappingRecordSchema>;
export type UpdateTappingRecordInput = z.infer<typeof updateTappingRecordSchema>;
