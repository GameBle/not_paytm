import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { apiClient } from "../api/client";
import { useSocket } from "../hooks/useSocket";
import { NotificationItem, NotificationsResponse } from "../types/api";
import { IconButton } from "./ui/IconButton";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    const res = await apiClient.get<NotificationsResponse>("/notifications");
    setNotifications(res.data.items);
    setUnreadCount(res.data.unreadCount);
  }, []);

  useEffect(() => {
    fetchNotifications().catch(() => undefined);
  }, [fetchNotifications]);

  useSocket((n) => {
    setNotifications((prev) => [n, ...prev]);
    setUnreadCount((c) => c + 1);
  });

  const markRead = async (id: string) => {
    await apiClient.post(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await apiClient.post("/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <IconButton
        aria-label="Notifications"
        variant="ghost"
        size="sm"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </IconButton>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(calc(100vw-1.5rem),20rem)] rounded-lg border border-border bg-card shadow-lg sm:w-80">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <span className="text-sm font-medium">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No notifications
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  type="button"
                  onClick={() => !n.read && markRead(n._id)}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-muted/50 ${
                    !n.read ? "bg-primary/5" : ""
                  }`}
                >
                  {n.message}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
