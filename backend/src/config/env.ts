import dotenv from "dotenv";
import { z } from "zod";
import { resolveMongoUrl } from "../utils/mongoUrl";

dotenv.config();

const envSchema = z
  .object({
    MONGO_URL: z.string().optional(),
    MONGO_USERNAME: z.string().optional(),
    MONGO_PASSWORD: z.string().optional(),
    MONGO_HOST: z.string().optional(),
    MONGO_DB: z.string().default("not_paytm"),
    JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  })
  .refine(
    (data) =>
      !!data.MONGO_URL ||
      !!(data.MONGO_USERNAME && data.MONGO_PASSWORD && data.MONGO_HOST),
    {
      message:
        "Provide MONGO_URL or all of MONGO_USERNAME, MONGO_PASSWORD, and MONGO_HOST",
      path: ["MONGO_URL"],
    }
  );

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

const config = parsed.data;

export const env = {
  ...config,
  MONGO_URL: resolveMongoUrl(config.MONGO_URL, {
    username: config.MONGO_USERNAME,
    password: config.MONGO_PASSWORD,
    host: config.MONGO_HOST,
    database: config.MONGO_DB,
  }),
};
