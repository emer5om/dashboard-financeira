import { z } from "zod";

export const transactionTypeSchema = z.enum(["ads", "expense", "revenue"]);

export const transactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  type: transactionTypeSchema,
  amount: z.number().nonnegative(),
  category: z.string().optional(),
  note: z.string().optional(),
  createdAt: z.string(),
});

export type Transaction = z.infer<typeof transactionSchema>;
export type TransactionType = z.infer<typeof transactionTypeSchema>;

export const createTransactionSchema = z.object({
  date: z.string(),
  type: transactionTypeSchema,
  amount: z.number().nonnegative(),
  category: z.string().optional(),
  note: z.string().optional(),
});

export type CreateTransaction = z.infer<typeof createTransactionSchema>;
