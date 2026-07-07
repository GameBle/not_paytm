import jwt from "jsonwebtoken";
import { Response } from "express";
import { Types } from "mongoose";
import { env } from "../config/env";
import { RefreshToken } from "../models/RefreshToken";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { generateToken, hashToken } from "../utils/tokens";
import { sendPasswordResetEmail, sendVerificationEmail } from "./mailer";
import { hashPassword } from "../utils/password";

const REFRESH_COOKIE = "refreshToken";

export function signAccessToken(userId: Types.ObjectId | string): string {
  return jwt.sign({ userId: userId.toString() }, env.JWT_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"],
  });
}

function getRefreshExpiry(rememberMe: boolean): Date {
  const ttl = rememberMe ? env.REFRESH_TOKEN_TTL_REMEMBER : env.REFRESH_TOKEN_TTL;
  const match = ttl.match(/^(\d+)([dhms])$/);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return new Date(Date.now() + value * multipliers[unit]);
}

function cookieOptions(rememberMe: boolean, expires: Date) {
  const isProd = env.NODE_ENV === "production";
  const base = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ("none" as const) : ("lax" as const),
    path: "/api/v1/auth",
  };
  // Session cookie when not remembering — cleared when browser closes
  if (!rememberMe) return base;
  return { ...base, expires };
}

export async function issueAuthTokens(
  userId: Types.ObjectId,
  rememberMe: boolean,
  res: Response
) {
  const accessToken = signAccessToken(userId);
  const refreshToken = generateToken();
  const expiresAt = getRefreshExpiry(rememberMe);

  await RefreshToken.create({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt,
    rememberMe,
  });

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(rememberMe, expiresAt));
  return { accessToken };
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    path: "/api/v1/auth",
  });
}

export async function refreshAccessToken(refreshToken: string, res: Response) {
  const tokenHash = hashToken(refreshToken);
  const stored = await RefreshToken.findOne({ tokenHash });
  if (!stored || stored.expiresAt < new Date()) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  await RefreshToken.deleteOne({ _id: stored._id });
  const rememberMe = stored.rememberMe ?? false;
  const { accessToken } = await issueAuthTokens(stored.userId, rememberMe, res);
  return { accessToken };
}

export async function logoutUser(refreshToken: string | undefined, res: Response) {
  if (refreshToken) {
    await RefreshToken.deleteOne({ tokenHash: hashToken(refreshToken) });
  }
  clearRefreshCookie(res);
  return { message: "Logged out" };
}

export async function createVerificationToken(userId: Types.ObjectId) {
  const token = generateToken();
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await User.updateOne(
    { _id: userId },
    {
      $set: {
        verificationToken: hashToken(token),
        verificationTokenExpiry: expiry,
      },
    }
  );
  return token;
}

export async function sendUserVerificationEmail(userId: Types.ObjectId) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  const token = await createVerificationToken(userId);
  await sendVerificationEmail(user.username, token);
}

export async function verifyEmail(token: string) {
  const hashed = hashToken(token);
  const user = await User.findOne({
    verificationToken: hashed,
    verificationTokenExpiry: { $gt: new Date() },
  });
  if (!user) throw new ApiError(400, "Invalid or expired verification token");
  user.emailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save();
  return { message: "Email verified successfully" };
}

export async function resendVerification(email: string) {
  const user = await User.findOne({ username: email });
  if (!user) return { message: "If the email exists, a verification link was sent" };
  if (user.emailVerified) throw new ApiError(400, "Email already verified");
  await sendUserVerificationEmail(user._id);
  return { message: "Verification email sent" };
}

export async function forgotPassword(email: string) {
  const user = await User.findOne({ username: email });
  if (!user) return { message: "If the email exists, a reset link was sent" };
  const token = generateToken();
  const expiry = new Date(Date.now() + 60 * 60 * 1000);
  await User.updateOne(
    { _id: user._id },
    { $set: { resetToken: hashToken(token), resetTokenExpiry: expiry } }
  );
  await sendPasswordResetEmail(user.username, token);
  return { message: "If the email exists, a reset link was sent" };
}

export async function resetPassword(token: string, newPassword: string) {
  const hashed = hashToken(token);
  const user = await User.findOne({
    resetToken: hashed,
    resetTokenExpiry: { $gt: new Date() },
  });
  if (!user) throw new ApiError(400, "Invalid or expired reset token");
  user.password = await hashPassword(newPassword);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();
  await RefreshToken.deleteMany({ userId: user._id });
  return { message: "Password reset successfully" };
}

export { REFRESH_COOKIE };
