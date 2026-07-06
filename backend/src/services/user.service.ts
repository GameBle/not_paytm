import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { env } from "../config/env";
import { Account } from "../models/Account";
import { User } from "../models/User";
import { SigninInput, SignupInput, UpdateUserInput } from "../schemas/user.schema";
import { ApiError } from "../utils/ApiError";
import { comparePassword, hashPassword } from "../utils/password";

const JWT_EXPIRY = "7d";

export function signToken(userId: Types.ObjectId): string {
  return jwt.sign({ userId: userId.toString() }, env.JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
}

export async function signupUser(input: SignupInput) {
  const existingUser = await User.findOne({ username: input.username });
  if (existingUser) {
    throw new ApiError(411, "Email already taken / Incorrect inputs");
  }

  const hashedPassword = await hashPassword(input.password);

  const user = await User.create({
    username: input.username,
    password: hashedPassword,
    firstName: input.firstName,
    lastName: input.lastName,
  });

  await Account.create({
    userId: user._id,
    balance: Math.round((1 + Math.random() * 10000) * 100) / 100,
  });

  return {
    message: "User created successfully",
    token: signToken(user._id),
    firstName: user.firstName,
  };
}

export async function signinUser(input: SigninInput) {
  const user = await User.findOne({ username: input.username });
  if (!user) {
    throw new ApiError(411, "Error while logging in");
  }

  const passwordMatch = await comparePassword(input.password, user.password);
  if (!passwordMatch) {
    throw new ApiError(411, "Error while logging in");
  }

  return {
    token: signToken(user._id),
    firstName: user.firstName,
  };
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId).select("username firstName lastName");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

export async function updateUser(userId: string, input: UpdateUserInput) {
  const update: Partial<UpdateUserInput> = { ...input };

  if (input.password) {
    update.password = await hashPassword(input.password);
  }

  const result = await User.updateOne({ _id: userId }, { $set: update });

  if (result.matchedCount === 0) {
    throw new ApiError(404, "User not found");
  }

  return { message: "Updated successfully" };
}

export async function searchUsers(filter: string) {
  const users = await User.find({
    $or: [
      { firstName: { $regex: filter, $options: "i" } },
      { lastName: { $regex: filter, $options: "i" } },
    ],
  }).select("username firstName lastName");

  return users.map((user) => ({
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    _id: user._id,
  }));
}
