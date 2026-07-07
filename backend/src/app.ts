import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application } from "express";
import helmet from "helmet";
import { env } from "./config/env";
import rootRouter from "./routes";
import { errorHandler } from "./middleware/middleware";

export function createApp(): Application {
  const app = express();

  // Render/Vercel sit behind a reverse proxy that sets X-Forwarded-For
  if (env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/v1", rootRouter);
  app.use(errorHandler);

  return app;
}
