"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { apiGet, apiPost } from "@/lib/apiClient";
import { Search, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface UserRow {
  _id: string;
  email: string;
  role: string;
  profile?: {
    fullName: string;
    avatarUrl: string | null;
  };
}

interface Message {
  _id: string;
  senderId: string;
  text: string;
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: string[];
  lastMessage?: { text: string; createdAt: string };
}

export default function AdminChatPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (search) params.set("search", search);
      const res = await apiGet<{ data: { users: UserRow[] } }>(`/admin/users?${params}`);
      setUsers(res.data.users);
    } catch {
      // silent
    }
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const selectUser = async (u: UserRow) => {
    setSelectedUser(u);
    setMessages([]);
    setConversationId(null);
    try {
      // Get or create conversation with this user
      const res = await apiPost<{ data: { conversation: Conversation; messages: Message[] } }>("/chat/conversations", {
        participantId: u._id,
      });
      setConversationId(res.data.conversation._id);
      setMessages(res.data.messages || []);
    } catch {
      // May need a different endpoint — try fetching existing
      try {
        const res = await apiGet<{ data: { conversations: Conversation[] } }>("/chat/conversations");
        const conv = res.data.conversations.find((c) => c.participants.includes(u._id));
        if (conv) {
          setConversationId(conv._id);
          const msgRes = await apiGet<{ data: { messages: Message[] } }>(`/chat/conversations/${conv._id}/messages`);
          setMessages(msgRes.data.messages || []);
        }
      } catch {
        // silent
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !selectedUser) return;
    setSending(true);
    try {
      if (conversationId) {
        const res = await apiPost<{ data: { message: Message } }>(`/chat/conversations/${conversationId}/messages`, { text });
        setMessages((prev) => [...prev, res.data.message]);
      } else {
        const res = await apiPost<{ data: { conversation: Conversation; message: Message } }>("/chat/conversations", {
          participantId: selectedUser._id,
          text,
        });
        setConversationId(res.data.conversation._id);
        setMessages([res.data.message]);
      }
      setText("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-card border border-border rounded-2xl overflow-hidden">
      {/* User list */}
      <div className="w-80 border-r border-border flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.map((u) => (
            <button
              key={u._id}
              onClick={() => selectUser(u)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left ${
                selectedUser?._id === u._id ? "bg-secondary" : ""
              }`}
            >
              <Avatar className="w-9 h-9 shrink-0">
                <AvatarImage src={u.profile?.avatarUrl || ""} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {u.profile?.fullName?.charAt(0) || u.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{u.profile?.fullName || u.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{u.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedUser ? (
          <>
            <div className="shrink-0 p-4 border-b border-border flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={selectedUser.profile?.avatarUrl || ""} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {selectedUser.profile?.fullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{selectedUser.profile?.fullName || selectedUser.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{selectedUser.role}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground mt-8">No messages yet. Start a conversation.</p>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-secondary text-foreground rounded-bl-md"
                      }`}>
                        <p>{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="shrink-0 p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !text.trim()}
                  className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
