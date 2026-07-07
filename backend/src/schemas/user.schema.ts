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
  rememberMe: z.boolean().optional().default(false),
});

export const updateUserSchema = z.object({
  password: z.string().min(6).optional(),
  currentPassword: z.string().optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
});

export const bulkUsersQuerySchema = z.object({
  filter: z.string().optional().default(""),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

export const resendVerificationSchema = z.object({
  email: z.string().email(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
