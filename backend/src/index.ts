import http from "http";
import { createApp } from "./app";
import { connectDb } from "./db";
import { env } from "./config/env";
import { initSocket } from "./realtime/io";

async function start() {
  await connectDb();
  const app = createApp();
  const server = http.createServer(app);
  initSocket(server);

  server.listen(env.PORT, () => {
    console.log(`Server is running on http://localhost:${env.PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
