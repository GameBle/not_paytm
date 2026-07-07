import { Router } from "express";
import {
  getTransactionHandler,
  listTransactionsHandler,
} from "../controllers/transaction.controller";
import { authMiddleware } from "../middleware/middleware";
import { handleControllerError } from "../controllers/user.controller";

const router = Router();

router.get("/", authMiddleware, listTransactionsHandler);
router.get("/:id", authMiddleware, getTransactionHandler);

export default router;
