import { z } from "zod";

export const saleItemInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
});

export const createSaleSchema = z.object({
  customerId: z.string().uuid(),
  saleDate: z.coerce.date().optional(),
  discount: z.number().nonnegative().optional(),
  paymentMethod: z.enum(["CASH", "CARD", "BANK_TRANSFER", "MOBILE_PAYMENT", "OTHER"]),
  paymentStatus: z.enum(["PAID", "PARTIAL", "UNPAID"]).optional(),
  notes: z.string().optional(),
  items: z.array(saleItemInputSchema).min(1, "A sale must contain at least one item"),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
