import { Response } from "express";
import { AuthRequest } from "../middleware/middleware";
import { transactionsQuerySchema } from "../schemas/transaction.schema";
import { getTransactionById, getUserTransactions } from "../services/transaction.service";
import { ApiError } from "../utils/ApiError";
import { handleControllerError } from "./user.controller";

export const listTransactionsHandler = handleControllerError(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw new ApiError(403, "Unauthorized");
    const parsed = transactionsQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ApiError(400, "Invalid query");
    const result = await getUserTransactions(req.userId, parsed.data);
    res.json(result);
  }
);

export const getTransactionHandler = handleControllerError(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw new ApiError(403, "Unauthorized");
    const result = await getTransactionById(req.userId, req.params.id);
    res.json(result);
  }
);
