/**
 * Shared Socket.IO singleton with ref-counting.
 * Both useChat and useNotifications share the same connection.
 */
import { io, Socket } from "socket.io-client";
import { getToken } from "./apiClient";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ||
  "http://localhost:5000";

let socket: Socket | null = null;
let refCount = 0;

export function acquireSocket(): Socket | null {
  const token = getToken();
  if (!token) return null;

  if (!socket || socket.disconnected) {
    socket = io(API_BASE, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  refCount++;
  return socket;
}

export function releaseSocket() {
  refCount--;
  if (refCount <= 0 && socket) {
    socket.disconnect();
    socket = null;
    refCount = 0;
  }
}

export function getSocket(): Socket | null {
  return socket;
}
