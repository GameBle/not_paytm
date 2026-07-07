import { Router } from "express";
import {
  listNotificationsHandler,
  markAllReadHandler,
  markReadHandler,
} from "../controllers/notification.controller";
import { authMiddleware } from "../middleware/middleware";
import { handleControllerError } from "../controllers/user.controller";

const router = Router();

router.get("/", authMiddleware, listNotificationsHandler);
router.post("/read-all", authMiddleware, markAllReadHandler);
router.post("/:id/read", authMiddleware, markReadHandler);

export default router;
