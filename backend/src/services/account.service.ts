import { Account } from "../models/Account";
import { ApiError } from "../utils/ApiError";

export async function getBalance(userId: string): Promise<number> {
  const account = await Account.findOne({ userId });
  if (!account) {
    throw new ApiError(404, "Account not found");
  }
  return account.balance;
}
