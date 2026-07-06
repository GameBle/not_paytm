import mongoose from "mongoose";
import { env } from "./config/env";

export async function connectDb(uri?: string): Promise<void> {
  await mongoose.connect(uri ?? env.MONGO_URL);
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
