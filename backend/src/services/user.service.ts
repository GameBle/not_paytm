import { Response } from "express";
import { Types } from "mongoose";
import { Account } from "../models/Account";
import { User } from "../models/User";
import { SigninInput, SignupInput, UpdateUserInput } from "../schemas/user.schema";
import { ApiError } from "../utils/ApiError";
import { comparePassword, hashPassword } from "../utils/password";
import { issueAuthTokens, sendUserVerificationEmail } from "./auth.service";

export async function signupUser(input: SignupInput, res: Response) {
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
    emailVerified: false,
  });

  await Account.create({
    userId: user._id,
    balance: Math.round((1 + Math.random() * 10000) * 100) / 100,
  });

  const { accessToken } = await issueAuthTokens(user._id, false, res);
  await sendUserVerificationEmail(user._id);

  return {
    message: "User created successfully",
    token: accessToken,
    firstName: user.firstName,
    emailVerified: user.emailVerified,
  };
}

export async function signinUser(input: SigninInput & { rememberMe?: boolean }, res: Response) {
  const user = await User.findOne({ username: input.username });
  if (!user) {
    throw new ApiError(411, "Error while logging in");
  }

  const passwordMatch = await comparePassword(input.password, user.password);
  if (!passwordMatch) {
    throw new ApiError(411, "Error while logging in");
  }

  const { accessToken } = await issueAuthTokens(user._id, !!input.rememberMe, res);

  return {
    token: accessToken,
    firstName: user.firstName,
    emailVerified: user.emailVerified,
    role: user.role,
  };
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId).select(
    "username firstName lastName role emailVerified"
  );
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    emailVerified: user.emailVerified,
  };
}

export async function updateUser(userId: string, input: UpdateUserInput) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (input.firstName) user.firstName = input.firstName;
  if (input.lastName) user.lastName = input.lastName;

  if (input.password) {
    if (!input.currentPassword) {
      throw new ApiError(400, "Current password is required to change password");
    }
    const match = await comparePassword(input.currentPassword, user.password);
    if (!match) throw new ApiError(400, "Current password is incorrect");
    user.password = await hashPassword(input.password);
  }

  await user.save();
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
