import { Notification } from "../models/Notification";

export async function createNotification(
  userId: string,
  type: string,
  message: string,
  meta?: Record<string, unknown>
) {
  const notification = await Notification.create({
    userId,
    type,
    message,
    meta,
    read: false,
  });
  return {
    _id: notification._id,
    type: notification.type,
    message: notification.message,
    read: notification.read,
    meta: notification.meta,
    createdAt: notification.createdAt,
  };
}

export async function getNotifications(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [items, total, unreadCount] = await Promise.all([
    Notification.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments({ userId }),
    Notification.countDocuments({ userId, read: false }),
  ]);
  return { items, total, unreadCount, page, limit };
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const result = await Notification.updateOne(
    { _id: notificationId, userId },
    { $set: { read: true } }
  );
  if (result.matchedCount === 0) throw new Error("Notification not found");
  return { message: "Marked as read" };
}

export async function markAllNotificationsRead(userId: string) {
  await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
  return { message: "All marked as read" };
}
