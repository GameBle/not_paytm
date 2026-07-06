import { z } from "zod";

export const signupSchema = z.object({
  username: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  password: z.string().min(6),
});

export const signinSchema = z.object({
  username: z.string().email(),
  password: z.string().min(1),
});

export const updateUserSchema = z.object({
  password: z.string().min(6).optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
});

export const bulkUsersQuerySchema = z.object({
  filter: z.string().optional().default(""),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
