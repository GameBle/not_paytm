import mongoose, { Document, Schema, Types } from "mongoose";

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: string;
  message: string;
  read: boolean;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    } as mongoose.SchemaDefinitionProperty<Types.ObjectId>,
    type: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>("Notification", notificationSchema);
