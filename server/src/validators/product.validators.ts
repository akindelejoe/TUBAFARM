import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  unit: z.string().min(1),
  sellingPrice: z.number().nonnegative(),
  status: z.enum(["ACTIVE", "DISCONTINUED"]).optional(),
  initialQuantity: z.number().nonnegative().optional(),
  reorderLevel: z.number().nonnegative().optional(),
});

export const updateProductSchema = createProductSchema
  .omit({ initialQuantity: true, reorderLevel: true })
  .partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
