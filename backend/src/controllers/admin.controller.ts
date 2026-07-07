import { Response } from "express";
import { AuthRequest } from "../middleware/middleware";
import { getAdminStats, getAdminUsers } from "../services/admin.service";
import { getAllTransactions } from "../services/transaction.service";
import { ApiError } from "../utils/ApiError";
import { handleControllerError } from "./user.controller";

export const adminStatsHandler = handleControllerError(
  async (_req: AuthRequest, res: Response) => {
    const stats = await getAdminStats();
    res.json(stats);
  }
);

export const adminUsersHandler = handleControllerError(
  async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const result = await getAdminUsers(page, limit, search);
    res.json(result);
  }
);

export const adminTransactionsHandler = handleControllerError(
  async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await getAllTransactions(page, limit);
    res.json(result);
  }
);
