"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { apiGet } from "@/lib/apiClient";
import { useAuth } from "./useAuth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:5000";

export interface Participant {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface Conversation {
  conversationId: string;
  lastMessage: { content: string; createdAt: string; senderId: string; isRead?: boolean } | null;
  unreadCount: number;
  participant: Participant | null;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: { _id: string; fullName: string; avatarUrl: string | null } | string;
  receiverId: { _id: string; fullName: string; avatarUrl: string | null } | string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface SearchResult {
  _id: string;
  fullName: string;
  avatarUrl: string | null;
  city?: string;
  canChat: boolean;
}

// Get the access token from the apiClient module
let getToken: (() => string | null) | null = null;

async function loadToken() {
  if (!getToken) {
    const mod = await import("@/lib/apiClient");
    getToken = (mod as any).getToken || (() => null);
  }
  return getToken?.() ?? null;
}

// ── Singleton socket connection ──────────────────────────────────────────────

let socket: Socket | null = null;
let socketRefCount = 0;

function getSocket(token: string): Socket {
  if (!socket || socket.disconnected) {
    socket = io(API_BASE, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  socketRefCount++;
  return socket;
}

function releaseSocket() {
  socketRefCount--;
  if (socketRefCount <= 0 && socket) {
    socket.disconnect();
    socket = null;
    socketRefCount = 0;
  }
}

// ── useChat — conversation list + socket events ─────────────────────────────

export const useChat = () => {
  const { isAuthenticated, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);

  const myProfileId = profile?.id;

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) {
      setConversations([]);
      setLoading(false);
      return;
    }
    try {
      const res = await apiGet<{ data: { conversations: Conversation[] } }>("/chat/conversations");
      const convos = res.data.conversations || [];
      setConversations(convos);
      setTotalUnread(convos.reduce((sum, c) => sum + (c.unreadCount || 0), 0));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Connect socket
  useEffect(() => {
    if (!isAuthenticated) {
      setConversations([]);
      setLoading(false);
      return;
    }

    let mounted = true;

    const connect = async () => {
      const token = await loadToken();
      if (!token || !mounted) return;

      const s = getSocket(token);
      socketRef.current = s;

      s.on("connect", () => {
        if (mounted) setConnected(true);
      });

      s.on("disconnect", () => {
        if (mounted) setConnected(false);
      });

      // Listen for new messages to update conversation list
      s.on("conversation:updated", (data: any) => {
        if (!mounted) return;
        setConversations((prev) => {
          const exists = prev.find((c) => c.conversationId === data.conversationId);
          if (exists) {
            return prev
              .map((c) =>
                c.conversationId === data.conversationId
                  ? { ...c, lastMessage: data.lastMessage, unreadCount: c.unreadCount + 1 }
                  : c
              )
              .sort((a, b) => {
                const aTime = a.lastMessage?.createdAt || "";
                const bTime = b.lastMessage?.createdAt || "";
                return bTime.localeCompare(aTime);
              });
          }
          // New conversation
          return [
            {
              conversationId: data.conversationId,
              lastMessage: data.lastMessage,
              unreadCount: 1,
              participant: data.participant,
            },
            ...prev,
          ];
        });
        setTotalUnread((prev) => prev + 1);
      });

      // Online/offline tracking
      s.on("user:online", ({ profileId }: { profileId: string }) => {
        if (mounted) setOnlineUsers((prev) => new Set(prev).add(profileId));
      });

      s.on("user:offline", ({ profileId }: { profileId: string }) => {
        if (mounted)
          setOnlineUsers((prev) => {
            const next = new Set(prev);
            next.delete(profileId);
            return next;
          });
      });

      // Read receipts — update unread count
      s.on("message:read", ({ conversationId }: { conversationId: string }) => {
        if (mounted) {
          setConversations((prev) =>
            prev.map((c) => (c.conversationId === conversationId ? { ...c, unreadCount: 0 } : c))
          );
        }
      });
    };

    fetchConversations();
    connect();

    return () => {
      mounted = false;
      releaseSocket();
      socketRef.current = null;
    };
  }, [isAuthenticated, fetchConversations]);

  // Check online status for all conversation participants
  useEffect(() => {
    if (!socketRef.current || !connected || conversations.length === 0) return;
    const ids = conversations.map((c) => c.participant?.id).filter(Boolean) as string[];
    socketRef.current.emit("user:check-online", { profileIds: ids }, (statuses: Record<string, boolean>) => {
      setOnlineUsers(new Set(Object.entries(statuses).filter(([, v]) => v).map(([k]) => k)));
    });
  }, [connected, conversations.length]);

  const searchByEmail = useCallback(
    async (email: string): Promise<SearchResult[]> => {
      try {
        const res = await apiGet<{ data: { users: SearchResult[] } }>(`/chat/search?email=${encodeURIComponent(email)}`);
        return res.data.users || [];
      } catch {
        return [];
      }
    },
    []
  );

  return {
    conversations,
    loading,
    totalUnread,
    connected,
    onlineUsers,
    myProfileId,
    socket: socketRef.current,
    refetch: fetchConversations,
    searchByEmail,
  };
};

// ── useMessages — messages for a specific conversation ───────────────────────

export const useMessages = (conversationId: string | null) => {
  const { isAuthenticated, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const myProfileId = profile?.id;

  // Load messages from REST API (initial load + pagination)
  const fetchMessages = useCallback(async () => {
    if (!conversationId || !isAuthenticated) {
      setMessages([]);
      setLoading(false);
      return;
    }
    try {
      const res = await apiGet<{ data: ChatMessage[] }>(`/chat/messages/${conversationId}?limit=100`);
      const msgs = res.data || [];
      setMessages(msgs.reverse()); // API returns newest first, we want oldest first
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [conversationId, isAuthenticated]);

  useEffect(() => {
    if (!conversationId || !isAuthenticated) return;

    let mounted = true;
    fetchMessages();

    const connect = async () => {
      const token = await loadToken();
      if (!token || !mounted) return;

      const s = getSocket(token);
      socketRef.current = s;

      // Listen for new messages in this conversation
      const handleNewMessage = (msg: ChatMessage) => {
        if (msg.conversationId !== conversationId || !mounted) return;
        setMessages((prev) => {
          // Deduplicate
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        // Auto mark as read if we're viewing this conversation
        const senderId = typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;
        if (senderId !== myProfileId) {
          s.emit("message:read", { conversationId });
        }
      };

      s.on("message:new", handleNewMessage);

      // Typing indicators
      s.on("typing:start", ({ conversationId: cid }: { conversationId: string }) => {
        if (cid === conversationId && mounted) setTyping(true);
      });
      s.on("typing:stop", ({ conversationId: cid }: { conversationId: string }) => {
        if (cid === conversationId && mounted) setTyping(false);
      });

      // Mark existing messages as read
      s.emit("message:read", { conversationId });

      return () => {
        s.off("message:new", handleNewMessage);
      };
    };

    const cleanup = connect();

    return () => {
      mounted = false;
      cleanup?.then((fn) => fn?.());
      releaseSocket();
      socketRef.current = null;
    };
  }, [conversationId, isAuthenticated, fetchMessages, myProfileId]);

  const sendMessage = useCallback(
    async (content: string, receiverId: string) => {
      if (!content.trim() || !receiverId) return;

      const s = socketRef.current;
      if (!s?.connected) return;

      return new Promise<ChatMessage | null>((resolve) => {
        s.emit("message:send", { receiverId, content: content.trim() }, (response: any) => {
          if (response?.error) {
            resolve(null);
            return;
          }
          if (response?.message) {
            setMessages((prev) => {
              if (prev.some((m) => m._id === response.message._id)) return prev;
              return [...prev, response.message];
            });
          }
          resolve(response?.message || null);
        });
      });
    },
    []
  );

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (!conversationId || !socketRef.current) return;
      socketRef.current.emit(isTyping ? "typing:start" : "typing:stop", { conversationId });
      if (isTyping) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          socketRef.current?.emit("typing:stop", { conversationId });
        }, 3000);
      }
    },
    [conversationId]
  );

  return { messages, loading, typing, sendMessage, emitTyping, refetch: fetchMessages };
};
