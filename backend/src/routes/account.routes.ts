import { Router } from "express";
import { getBalanceHandler, transferHandler } from "../controllers/account.controller";
import { authMiddleware } from "../middleware/middleware";

const router = Router();

router.get("/balance", authMiddleware, getBalanceHandler);
router.post("/transfer", authMiddleware, transferHandler);

export default router;
