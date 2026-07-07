import { NextFunction, Response } from "express";
import { User } from "../models/User";
import { AuthRequest } from "./middleware";
import { ApiError } from "../utils/ApiError";

export async function adminMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.userId) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }
  const user = await User.findById(req.userId).select("role");
  if (!user || user.role !== "admin") {
    res.status(403).json({ message: "Admin access required" });
    return;
  }
  next();
}
