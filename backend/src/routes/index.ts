import { Router } from "express";
import accountRouter from "./account.routes";
import userRouter from "./user.routes";

const router = Router();

router.use("/user", userRouter);
router.use("/account", accountRouter);

export default router;
