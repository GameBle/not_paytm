import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITransaction extends Document {
  fromUserId: Types.ObjectId;
  toUserId: Types.ObjectId;
  amount: number;
  type: "transfer";
  status: "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    } as mongoose.SchemaDefinitionProperty<Types.ObjectId>,
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    } as mongoose.SchemaDefinitionProperty<Types.ObjectId>,
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["transfer"], default: "transfer" },
    status: { type: String, enum: ["completed", "failed"], default: "completed" },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model<ITransaction>("Transaction", transactionSchema);
