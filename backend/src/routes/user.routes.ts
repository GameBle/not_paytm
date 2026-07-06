import { Router } from "express";
import { getBalanceHandler, transferHandler } from "../controllers/account.controller";
import {
  bulkUsers,
  getMe,
  signin,
  signup,
  updateProfile,
  handleControllerError,
} from "../controllers/user.controller";
import { authMiddleware } from "../middleware/middleware";
import { authRateLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/signup", authRateLimiter, handleControllerError(signup));
router.post("/signin", authRateLimiter, handleControllerError(signin));
router.put("/", authMiddleware, handleControllerError(updateProfile));
router.get("/me", authMiddleware, handleControllerError(getMe));
router.get("/bulk", handleControllerError(bulkUsers));

export default router;
