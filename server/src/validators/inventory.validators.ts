import { z } from "zod";

export const stockMovementSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const adjustmentSchema = z.object({
  productId: z.string().uuid(),
  newQuantity: z.number().nonnegative(),
  notes: z.string().optional(),
});

export type StockMovementInput = z.infer<typeof stockMovementSchema>;
export type AdjustmentInput = z.infer<typeof adjustmentSchema>;
