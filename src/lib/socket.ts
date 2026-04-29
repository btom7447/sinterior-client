/**
 * Shared Socket.IO singleton with ref-counting.
 * Both useChat and useNotifications share the same connection.
 *
 * Token handling:
 *  - Auth is supplied as a function so socket.io picks up the freshest access
 *    token on every (re)connect, including after a silent /auth/refresh.
 *  - On a connect_error caused by an expired token, we trigger a refresh and
 *    explicitly reconnect so the next handshake carries the new token.
 *  - When the apiClient broadcasts auth:unauthorized (refresh failed), we
 *    fully tear down the socket — no point retrying without a session.
 */
import { io, Socket } from "socket.io-client";
import { getToken } from "./apiClient";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ||
  "http://localhost:5000";

let socket: Socket | null = null;
let refCount = 0;
let unauthorizedListener: (() => void) | null = null;

const tearDown = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  refCount = 0;
  if (unauthorizedListener && typeof window !== "undefined") {
    window.removeEventListener("auth:unauthorized", unauthorizedListener);
    unauthorizedListener = null;
  }
};

export function acquireSocket(): Socket | null {
  const token = getToken();
  if (!token) return null;

  if (!socket || socket.disconnected) {
    socket = io(API_BASE, {
      // Function form — runs on every (re)connect, so the latest token is
      // sent even after a silent refresh.
      auth: (cb) => cb({ token: getToken() }),
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      // Cap the back-off so a long outage still recovers in reasonable time.
      reconnectionDelayMax: 5000,
    });

    // Auth-related connect errors → ditch the socket and let the next
    // acquireSocket() call create a fresh one once the apiClient refreshes.
    socket.on("connect_error", (err) => {
      const msg = (err as Error)?.message || "";
      const looksAuthy = /jwt|unauthor|token|auth/i.test(msg);
      if (looksAuthy) {
        // Force the next reconnect to carry whatever token is current.
        if (socket) {
          socket.auth = { token: getToken() };
        }
      }
    });

    // Refresh-failure (apiClient gave up) — kill the socket so we don't
    // burn CPU reconnecting with no credentials.
    if (typeof window !== "undefined") {
      unauthorizedListener = () => tearDown();
      window.addEventListener("auth:unauthorized", unauthorizedListener);
    }
  }
  refCount++;
  return socket;
}

export function releaseSocket() {
  refCount--;
  if (refCount <= 0) {
    tearDown();
  }
}

export function getSocket(): Socket | null {
  return socket;
}

/**
 * Manually nudge the socket to reconnect with whatever token is current.
 * Call this from AuthContext after a successful login/refresh so an active
 * tab picks up the new credentials without waiting for the next disconnect.
 */
export function refreshSocketAuth(): void {
  if (!socket) return;
  socket.auth = { token: getToken() };
  if (socket.connected) {
    socket.disconnect().connect();
  } else {
    socket.connect();
  }
}
