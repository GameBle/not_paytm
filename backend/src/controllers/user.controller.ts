import { Response } from "express";
import { ZodError } from "zod";
import { AuthRequest } from "../middleware/middleware";
import {
  bulkUsersQuerySchema,
  signinSchema,
  signupSchema,
  updateUserSchema,
} from "../schemas/user.schema";
import {
  searchUsers,
  signinUser,
  signupUser,
  updateUser,
} from "../services/user.service";
import { ApiError } from "../utils/ApiError";

export async function signup(req: AuthRequest, res: Response): Promise<void> {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(411, "Email already taken / Incorrect inputs", parsed.error.flatten());
  }

  const result = await signupUser(parsed.data);
  res.json(result);
}

export async function signin(req: AuthRequest, res: Response): Promise<void> {
  const parsed = signinSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(411, "Email already taken / Incorrect inputs", parsed.error.flatten());
  }

  const result = await signinUser(parsed.data);
  res.json(result);
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(411, "Error while updating information", parsed.error.flatten());
  }

  if (!req.userId) {
    throw new ApiError(403, "Unauthorized");
  }

  const result = await updateUser(req.userId, parsed.data);
  res.json(result);
}

export async function bulkUsers(req: AuthRequest, res: Response): Promise<void> {
  const parsed = bulkUsersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(400, "Invalid query parameters", parsed.error.flatten());
  }

  const users = await searchUsers(parsed.data.filter);
  res.json({ user: users });
}

export function handleControllerError(
  handler: (req: AuthRequest, res: Response) => Promise<void>
) {
  return async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await handler(req, res);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        });
        return;
      }
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Validation error", details: error.flatten() });
        return;
      }
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}
