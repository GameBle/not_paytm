import mongoose, { Document, Schema, Types } from "mongoose";

export interface IRefreshToken extends Document {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    } as mongoose.SchemaDefinitionProperty<Types.ObjectId>,
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

export const RefreshToken = mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);
