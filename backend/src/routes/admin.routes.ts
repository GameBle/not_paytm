import { Router } from "express";
import {
  adminStatsHandler,
  adminTransactionsHandler,
  adminUsersHandler,
} from "../controllers/admin.controller";
import { adminMiddleware } from "../middleware/adminMiddleware";
import { authMiddleware } from "../middleware/middleware";

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get("/stats", adminStatsHandler);
router.get("/users", adminUsersHandler);
router.get("/transactions", adminTransactionsHandler);

export default router;
