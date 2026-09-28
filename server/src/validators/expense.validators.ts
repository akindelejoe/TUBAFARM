import { z } from "zod";

export const expenseCategoryEnum = z.enum([
  "LABOR",
  "EQUIPMENT",
  "TRANSPORTATION",
  "FARM_SUPPLIES",
  "MAINTENANCE",
  "UTILITIES",
  "OTHER",
]);

export const createExpenseSchema = z.object({
  category: expenseCategoryEnum,
  description: z.string().min(1),
  amount: z.number().positive(),
  expenseDate: z.coerce.date(),
  supplierId: z.string().uuid().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
