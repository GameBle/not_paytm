import mongoose from "mongoose";
import { Transaction } from "../models/Transaction";
import { Account } from "../models/Account";
import { User } from "../models/User";
import { TransferInput } from "../schemas/account.schema";
import { ApiError } from "../utils/ApiError";
import { TransactionsQuery } from "../schemas/transaction.schema";
import { createNotification } from "./notification.service";
import { emitToUser } from "../realtime/io";

export async function transferFunds(
  fromUserId: string,
  input: TransferInput
): Promise<{ message: string; transactionId: string }> {
  const session = await mongoose.startSession();
  let transactionId = "";

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

    const [transaction] = await Transaction.create(
      [
        {
          fromUserId,
          toUserId: input.to,
          amount: input.amount,
          type: "transfer",
          status: "completed",
        },
      ],
      { session }
    );

    transactionId = transaction._id.toString();
    await session.commitTransaction();

    const sender = await User.findById(fromUserId).select("firstName");
    const message = `You received ₹${input.amount} from ${sender?.firstName ?? "a user"}`;
    const notification = await createNotification(input.to, "money_received", message, {
      transactionId,
      amount: input.amount,
      fromUserId,
    });
    emitToUser(input.to, "notification", notification);

    return { message: "Transfer successful", transactionId };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function getUserTransactions(userId: string, query: TransactionsQuery) {
  const filter: Record<string, unknown> = {};
  if (query.type === "sent") filter.fromUserId = userId;
  else if (query.type === "received") filter.toUserId = userId;
  else filter.$or = [{ fromUserId: userId }, { toUserId: userId }];

  const skip = (query.page - 1) * query.limit;
  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  const userIds = new Set<string>();
  transactions.forEach((t) => {
    userIds.add(t.fromUserId.toString());
    userIds.add(t.toUserId.toString());
  });
  const users = await User.find({ _id: { $in: [...userIds] } }).select(
    "firstName lastName username"
  );
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const items = transactions.map((t) => {
    const from = userMap.get(t.fromUserId.toString());
    const to = userMap.get(t.toUserId.toString());
    const direction = t.fromUserId.toString() === userId ? "sent" : "received";
    const counterpart = direction === "sent" ? to : from;
    return {
      _id: t._id,
      amount: t.amount,
      status: t.status,
      type: t.type,
      direction,
      createdAt: t.createdAt,
      counterpart: counterpart
        ? {
            _id: counterpart._id,
            firstName: counterpart.firstName,
            lastName: counterpart.lastName,
            username: counterpart.username,
          }
        : null,
    };
  });

  return { items, total, page: query.page, limit: query.limit };
}

export async function getTransactionById(userId: string, transactionId: string) {
  const transaction = await Transaction.findById(transactionId).lean();
  if (!transaction) throw new ApiError(404, "Transaction not found");

  const isParty =
    transaction.fromUserId.toString() === userId ||
    transaction.toUserId.toString() === userId;
  if (!isParty) throw new ApiError(403, "Unauthorized");

  const [from, to] = await Promise.all([
    User.findById(transaction.fromUserId).select("firstName lastName username"),
    User.findById(transaction.toUserId).select("firstName lastName username"),
  ]);

  return {
    _id: transaction._id,
    amount: transaction.amount,
    status: transaction.status,
    type: transaction.type,
    createdAt: transaction.createdAt,
    from: from
      ? { _id: from._id, firstName: from.firstName, lastName: from.lastName, username: from.username }
      : null,
    to: to
      ? { _id: to._id, firstName: to.firstName, lastName: to.lastName, username: to.username }
      : null,
    direction: transaction.fromUserId.toString() === userId ? "sent" : "received",
  };
}

export async function getAllTransactions(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [transactions, total] = await Promise.all([
    Transaction.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Transaction.countDocuments(),
  ]);
  return { items: transactions, total, page, limit };
}
