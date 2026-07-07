import { Response } from "express";
import { AuthRequest } from "../middleware/middleware";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notification.service";
import { ApiError } from "../utils/ApiError";
import { handleControllerError } from "./user.controller";

export const listNotificationsHandler = handleControllerError(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw new ApiError(403, "Unauthorized");
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await getNotifications(req.userId, page, limit);
    res.json(result);
  }
);

export const markReadHandler = handleControllerError(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw new ApiError(403, "Unauthorized");
    const result = await markNotificationRead(req.userId, req.params.id);
    res.json(result);
  }
);

export const markAllReadHandler = handleControllerError(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw new ApiError(403, "Unauthorized");
    const result = await markAllNotificationsRead(req.userId);
    res.json(result);
  }
);
