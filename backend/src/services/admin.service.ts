import { Account } from "../models/Account";
import { Transaction } from "../models/Transaction";
import { User } from "../models/User";

export async function getAdminStats() {
  const [totalUsers, verifiedUsers, totalVolume, totalTransactions] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ emailVerified: true }),
    Transaction.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
    Transaction.countDocuments(),
  ]);
  return {
    totalUsers,
    verifiedUsers,
    totalVolume: totalVolume[0]?.total ?? 0,
    totalTransactions,
  };
}

export async function getAdminUsers(page: number, limit: number, search = "") {
  const filter = search
    ? {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
        ],
      }
    : {};
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter).select("-password -verificationToken -resetToken").skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  const userIds = users.map((u) => u._id);
  const accounts = await Account.find({ userId: { $in: userIds } }).lean();
  const balanceMap = new Map(accounts.map((a) => [a.userId.toString(), a.balance]));
  const items = users.map((u) => ({
    ...u,
    balance: balanceMap.get(u._id.toString()) ?? 0,
  }));
  return { items, total, page, limit };
}
