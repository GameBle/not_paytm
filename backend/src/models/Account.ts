import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAccount extends Document {
  userId: Types.ObjectId;
  balance: number;
}

const accountSchema = new Schema<IAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    } as mongoose.SchemaDefinitionProperty<Types.ObjectId>,
    balance: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

export const Account = mongoose.model<IAccount>("Account", accountSchema);
