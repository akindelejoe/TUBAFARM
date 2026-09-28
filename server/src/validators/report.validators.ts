import { z } from "zod";

export const dateRangeSchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export type DateRangeInput = z.infer<typeof dateRangeSchema>;
