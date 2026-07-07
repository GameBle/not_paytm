import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minLength: 3,
      maxLength: 30,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
