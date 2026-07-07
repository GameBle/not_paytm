import dotenv from "dotenv";
import { connectDb, disconnectDb } from "../db";
import { User } from "../models/User";

dotenv.config();

async function promoteAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx ts-node src/scripts/promoteAdmin.ts <email>");
    process.exit(1);
  }

  await connectDb();
  const user = await User.findOneAndUpdate(
    { username: email.toLowerCase() },
    { $set: { role: "admin" } },
    { new: true }
  );

  if (!user) {
    console.error(`User not found: ${email}`);
    await disconnectDb();
    process.exit(1);
  }

  console.log(`Promoted ${user.username} to admin`);
  await disconnectDb();
}

promoteAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
