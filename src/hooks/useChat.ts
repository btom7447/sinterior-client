"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Socket } from "socket.io-client";
import { apiGet } from "@/lib/apiClient";
import { acquireSocket, releaseSocket, getSocket } from "@/lib/socket";
import { useAuth } from "./useAuth";

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
  media?: string[];
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


// ── useChat — conversation list + socket events ─────────────────────────────

export const useChat = () => {
  const { isAuthenticated, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);

  const myProfileId = profile?.id;

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    [conversations]
  );

  const markConversationRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.conversationId === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

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

    const s = acquireSocket();
    if (!s) return;
    socketRef.current = s;

    const handleConnect = () => { if (mounted) setConnected(true); };
    const handleDisconnect = () => { if (mounted) setConnected(false); };

    const handleConversationUpdated = (data: any) => {
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
    };

    const handleUserOnline = ({ profileId }: { profileId: string }) => {
      if (mounted) setOnlineUsers((prev) => new Set(prev).add(profileId));
    };

    const handleUserOffline = ({ profileId }: { profileId: string }) => {
      if (mounted)
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          next.delete(profileId);
          return next;
        });
    };

    const handleMessageRead = ({ conversationId }: { conversationId: string }) => {
      if (mounted) {
        setConversations((prev) =>
          prev.map((c) => (c.conversationId === conversationId ? { ...c, unreadCount: 0 } : c))
        );
      }
    };

    s.on("connect", handleConnect);
    s.on("disconnect", handleDisconnect);
    s.on("conversation:updated", handleConversationUpdated);
    s.on("user:online", handleUserOnline);
    s.on("user:offline", handleUserOffline);
    s.on("message:read", handleMessageRead);

    // Socket may already be connected (shared singleton from another hook)
    if (s.connected && mounted) setConnected(true);

    fetchConversations();

    return () => {
      mounted = false;
      s.off("connect", handleConnect);
      s.off("disconnect", handleDisconnect);
      s.off("conversation:updated", handleConversationUpdated);
      s.off("user:online", handleUserOnline);
      s.off("user:offline", handleUserOffline);
      s.off("message:read", handleMessageRead);
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
    markConversationRead,
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
  const typingAutoResetRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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
      const fetched = (res.data || []).reverse(); // API returns newest first, we want oldest first
      setMessages((prev) => {
        // Merge: keep any socket-delivered messages not yet in the fetched batch
        const fetchedIds = new Set(fetched.map((m) => m._id));
        const socketOnly = prev.filter((m) => !fetchedIds.has(m._id));
        if (socketOnly.length === 0) return fetched;
        return [...fetched, ...socketOnly].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
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

    const s = acquireSocket();
    if (!s) return;
    socketRef.current = s;

    const handleNewMessage = (msg: ChatMessage) => {
      if (msg.conversationId !== conversationId || !mounted) return;
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      const senderId = typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;
      if (senderId !== myProfileId) {
        s.emit("message:read", { conversationId });
      }
    };

    const handleTypingStart = ({ conversationId: cid }: { conversationId: string }) => {
      if (cid === conversationId && mounted) {
        setTyping(true);
        // Auto-clear after 5s in case sender disconnects mid-typing
        clearTimeout(typingAutoResetRef.current);
        typingAutoResetRef.current = setTimeout(() => {
          if (mounted) setTyping(false);
        }, 5000);
      }
    };

    const handleTypingStop = ({ conversationId: cid }: { conversationId: string }) => {
      if (cid === conversationId && mounted) {
        setTyping(false);
        clearTimeout(typingAutoResetRef.current);
      }
    };

    s.on("message:new", handleNewMessage);
    s.on("typing:start", handleTypingStart);
    s.on("typing:stop", handleTypingStop);

    // Mark existing messages as read
    s.emit("message:read", { conversationId });

    return () => {
      mounted = false;
      s.off("message:new", handleNewMessage);
      s.off("typing:start", handleTypingStart);
      s.off("typing:stop", handleTypingStop);
      clearTimeout(typingTimeoutRef.current);
      clearTimeout(typingAutoResetRef.current);
      releaseSocket();
      socketRef.current = null;
    };
  }, [conversationId, isAuthenticated, fetchMessages, myProfileId]);

  const sendMessage = useCallback(
    async (content: string, receiverId: string) => {
      if (!content.trim() || !receiverId) return;

      // Use local socket ref, or fall back to the shared singleton (needed for
      // new conversations where conversationId is "" and the effect didn't run)
      const s = socketRef.current ?? getSocket();
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
