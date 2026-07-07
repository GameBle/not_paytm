import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { getAccessToken } from "../api/client";
import { NotificationItem } from "../types/api";

const SOCKET_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1").replace(
    "/api/v1",
    ""
  );

export function useSocket(onNotification?: (n: NotificationItem) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
    });

    socket.on("notification", (payload: NotificationItem) => {
      toast.success(payload.message);
      onNotification?.(payload);
    });

    socketRef.current = socket;
    return () => {
      socket.disconnect();
    };
  }, [onNotification]);

  return socketRef;
}
