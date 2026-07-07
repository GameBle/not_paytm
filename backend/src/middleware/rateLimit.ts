import rateLimit from "express-rate-limit";
import { env } from "../config/env";

const noop = (_req: unknown, _res: unknown, next: () => void) => next();

export const authRateLimiter =
  env.NODE_ENV === "test"
    ? noop
    : rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 20,
        standardHeaders: true,
        legacyHeaders: false,
        message: { message: "Too many requests, please try again later" },
      });
