import { z } from "zod";

export const createFarmSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  areaSize: z.number().positive().optional(),
  description: z.string().optional(),
});

export const updateFarmSchema = createFarmSchema.partial();

export type CreateFarmInput = z.infer<typeof createFarmSchema>;
export type UpdateFarmInput = z.infer<typeof updateFarmSchema>;
