import { z } from "zod";

export const transferSchema = z.object({
  to: z.string().min(1, "Recipient user id is required"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
});

export type TransferInput = z.infer<typeof transferSchema>;
