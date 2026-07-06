import { Response } from "express";
import { AuthRequest } from "../middleware/middleware";
import { transferSchema } from "../schemas/account.schema";
import { getBalance, transferFunds } from "../services/account.service";
import { ApiError } from "../utils/ApiError";
import { handleControllerError } from "./user.controller";

export const getBalanceHandler = handleControllerError(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw new ApiError(403, "Unauthorized");
    }

    const balance = await getBalance(req.userId);
    res.json({ balance });
  }
);

export const transferHandler = handleControllerError(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw new ApiError(403, "Unauthorized");
    }

    const parsed = transferSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid transfer request", parsed.error.flatten());
    }

    const result = await transferFunds(req.userId, parsed.data);
    res.json(result);
  }
);
