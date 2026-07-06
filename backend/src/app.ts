import cors from "cors";
import express, { Application } from "express";
import helmet from "helmet";
import rootRouter from "./routes";
import { errorHandler } from "./middleware/middleware";

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    })
  );
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/v1", rootRouter);
  app.use(errorHandler);

  return app;
}
