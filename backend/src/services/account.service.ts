import mongoose from "mongoose";
import { Account } from "../models/Account";
import { TransferInput } from "../schemas/account.schema";
import { ApiError } from "../utils/ApiError";

export async function getBalance(userId: string): Promise<number> {
  const account = await Account.findOne({ userId });
  if (!account) {
    throw new ApiError(404, "Account not found");
  }
  return account.balance;
}

export async function transferFunds(
  fromUserId: string,
  input: TransferInput
): Promise<{ message: string }> {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const account = await Account.findOne({ userId: fromUserId }).session(session);

    if (!account || account.balance < input.amount) {
      throw new ApiError(400, "Insufficient balance");
    }

    const toAccount = await Account.findOne({ userId: input.to }).session(session);

    if (!toAccount) {
      throw new ApiError(400, "Invalid account");
    }

    if (fromUserId === input.to) {
      throw new ApiError(400, "Cannot transfer to yourself");
    }

    await Account.updateOne(
      { userId: fromUserId },
      { $inc: { balance: -input.amount } }
    ).session(session);

    await Account.updateOne(
      { userId: input.to },
      { $inc: { balance: input.amount } }
    ).session(session);

    await session.commitTransaction();

    return { message: "Transfer successful" };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
