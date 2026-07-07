import { Response } from "express";
import { AuthRequest } from "../middleware/middleware";
import {
  forgotPasswordSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../schemas/user.schema";
import {
  REFRESH_COOKIE,
  forgotPassword,
  logoutUser,
  refreshAccessToken,
  resendVerification,
  resetPassword,
  verifyEmail,
} from "../services/auth.service";
import { ApiError } from "../utils/ApiError";
import { handleControllerError } from "./user.controller";

export const refreshHandler = handleControllerError(
  async (req: AuthRequest, res: Response) => {
    const refreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!refreshToken) throw new ApiError(401, "No refresh token");
    const result = await refreshAccessToken(refreshToken, res);
    res.json({ token: result.accessToken });
  }
);

export const logoutHandler = handleControllerError(
  async (req: AuthRequest, res: Response) => {
    const refreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    const result = await logoutUser(refreshToken, res);
    res.json(result);
  }
);

export const verifyEmailHandler = handleControllerError(
  async (req: AuthRequest, res: Response) => {
    const parsed = verifyEmailSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, "Invalid token");
    const result = await verifyEmail(parsed.data.token);
    res.json(result);
  }
);

export const resendVerificationHandler = handleControllerError(
  async (req: AuthRequest, res: Response) => {
    const parsed = resendVerificationSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, "Invalid email");
    const result = await resendVerification(parsed.data.email);
    res.json(result);
  }
);

export const forgotPasswordHandler = handleControllerError(
  async (req: AuthRequest, res: Response) => {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, "Invalid email");
    const result = await forgotPassword(parsed.data.email);
    res.json(result);
  }
);

export const resetPasswordHandler = handleControllerError(
  async (req: AuthRequest, res: Response) => {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, "Invalid input");
    const result = await resetPassword(parsed.data.token, parsed.data.password);
    res.json(result);
  }
);
