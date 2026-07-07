import { Router } from "express";
import {
  forgotPasswordHandler,
  logoutHandler,
  refreshHandler,
  resendVerificationHandler,
  resetPasswordHandler,
  verifyEmailHandler,
} from "../controllers/auth.controller";
import { authRateLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/refresh", refreshHandler);
router.post("/logout", logoutHandler);
router.post("/verify-email", authRateLimiter, verifyEmailHandler);
router.post("/resend-verification", authRateLimiter, resendVerificationHandler);
router.post("/forgot-password", authRateLimiter, forgotPasswordHandler);
router.post("/reset-password", authRateLimiter, resetPasswordHandler);

export default router;
