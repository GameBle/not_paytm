import { Router } from "express";
import accountRouter from "./account.routes";
import adminRouter from "./admin.routes";
import authRouter from "./auth.routes";
import notificationRouter from "./notification.routes";
import transactionRouter from "./transaction.routes";
import userRouter from "./user.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/account", accountRouter);
router.use("/transactions", transactionRouter);
router.use("/notifications", notificationRouter);
router.use("/admin", adminRouter);

export default router;
