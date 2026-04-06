"use client";

import { useEffect, useState, useRef } from "react";
import { useChat, useMessages, type Conversation, type SearchResult, type ChatMessage } from "@/hooks/useChat";
import { resolveAssetUrl } from "@/types/api";
import { apiUpload } from "@/lib/apiClient";
import { Send, MessageCircle, ArrowLeft, Search, Wifi, WifiOff, Check, CheckCheck, AlertTriangle, ImagePlus, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

/* ── Media grid (WhatsApp-style 2x2 with +N) ──────────────────────────────── */
function MediaGrid({ media, onPreview }: { media: string[]; onPreview: (url: string) => void }) {
  const resolved = media.map(resolveAssetUrl);
  const show = resolved.slice(0, 4);
  const extra = resolved.length - 4;

  if (show.length === 1) {
    return (
      <button onClick={() => onPreview(show[0])} className="block rounded-xl overflow-hidden max-w-[260px]">
        <img src={show[0]} alt="" className="w-full max-h-[280px] object-cover" loading="lazy" />
      </button>
    );
  }

  return (
    <div className={`grid gap-1 rounded-xl overflow-hidden max-w-[260px] ${show.length === 2 ? "grid-cols-2" : "grid-cols-2"}`}>
      {show.map((url, i) => (
        <button key={i} onClick={() => onPreview(url)} className="relative aspect-square overflow-hidden">
          <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
          {i === 3 && extra > 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">+{extra}</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

/* ── Image preview modal ──────────────────────────────────────────────────── */
function ImagePreview({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20">
        <X className="w-5 h-5" />
      </button>
      <img src={url} alt="" className="max-w-full max-h-[90vh] object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

export default function DashboardChat() {
  const {
    conversations,
    loading: loadingConvos,
    connected,
    onlineUsers,
    myProfileId,
    searchByEmail,
    refetch,
  } = useChat();

  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const filteredConvos = searchQuery.trim()
    ? conversations.filter((c) =>
        c.participant?.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const handleSearch = async () => {
    if (!searchQuery.trim() || !searchQuery.includes("@")) return;
    setSearching(true);
    const results = await searchByEmail(searchQuery.trim());
    setSearchResults(results);
    setSearching(false);
  };

  const receiverId = activeConvo?.participant?.id || "";
  const {
    messages,
    loading: loadingMessages,
    typing,
    sendMessage,
    emitTyping,
  } = useMessages(activeConvo?.conversationId || null);

  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && selectedFiles.length === 0) || !receiverId || sending) return;
    setSending(true);

    try {
      if (selectedFiles.length > 0) {
        // Send as multipart with media
        const form = new FormData();
        form.append("receiverId", receiverId);
        if (newMessage.trim()) form.append("content", newMessage.trim());
        selectedFiles.forEach((file) => form.append("media", file));
        await apiUpload("/chat/messages", form);
        setNewMessage("");
        setSelectedFiles([]);
        setFilePreviews([]);
        refetch();
      } else {
        // Send text-only via socket
        const msg = await sendMessage(newMessage.trim(), receiverId);
        if (msg) {
          setNewMessage("");
          refetch();
        } else {
          toast.error("Failed to send message");
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (value: string) => {
    setNewMessage(value);
    emitTyping(!!value.trim());
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 4);
    setSelectedFiles(files);
    setFilePreviews(files.map((f) => URL.createObjectURL(f)));
    if (e.target) e.target.value = "";
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(filePreviews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const openConversation = (convo: Conversation) => {
    setActiveConvo(convo);
    setSearchQuery("");
    setSearchResults([]);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return d.toLocaleDateString("en-NG", { weekday: "short" });
    return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
  };

  // Group consecutive messages by same sender for avatar clustering
  const shouldShowAvatar = (msg: ChatMessage, index: number, all: ChatMessage[]) => {
    const senderId = typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;
    if (index === all.length - 1) return true;
    const nextSenderId = typeof all[index + 1].senderId === "object"
      ? (all[index + 1].senderId as { _id: string })._id
      : all[index + 1].senderId;
    return senderId !== nextSenderId;
  };

  const getAvatarUrl = (msg: ChatMessage, isMine: boolean) => {
    if (isMine) return null;
    if (typeof msg.senderId === "object" && msg.senderId.avatarUrl) {
      return resolveAssetUrl(msg.senderId.avatarUrl);
    }
    return activeConvo?.participant?.avatarUrl ? resolveAssetUrl(activeConvo.participant.avatarUrl) : null;
  };

  const getInitial = (msg: ChatMessage, isMine: boolean) => {
    if (isMine) return "Y";
    if (typeof msg.senderId === "object") return msg.senderId.fullName?.charAt(0) || "?";
    return activeConvo?.participant?.fullName?.charAt(0) || "?";
  };

  const showMessages = !!activeConvo;

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-4 lg:-m-6">
      {/* Conversations List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-card ${showMessages ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-border shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-foreground">Messages</h2>
            <span className={`flex items-center gap-1 text-[10px] font-medium ${connected ? "text-success" : "text-muted-foreground"}`}>
              {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {connected ? "Live" : "Offline"}
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1} />
            <input
              type="text"
              placeholder="Search contacts or enter email..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchResults([]); }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {searchResults.length > 0 && (
            <div className="p-2 border-b border-border">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 mb-1">Search Results</p>
              {searchResults.map((user) => (
                <button
                  key={user._id}
                  onClick={() => {
                    const existing = conversations.find((c) => c.participant?.id === user._id);
                    if (existing) {
                      openConversation(existing);
                    } else {
                      setActiveConvo({
                        conversationId: "",
                        lastMessage: null,
                        unreadCount: 0,
                        participant: { id: user._id, fullName: user.fullName, avatarUrl: user.avatarUrl },
                      });
                      setSearchQuery("");
                      setSearchResults([]);
                    }
                  }}
                  className="w-full flex items-center gap-3 p-3 text-left rounded-xl hover:bg-secondary/50"
                >
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarImage src={resolveAssetUrl(user.avatarUrl || "")} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{user.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{user.fullName}</p>
                    {user.city && <p className="text-[10px] text-muted-foreground">{user.city}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {searching && <div className="flex items-center justify-center py-6"><p className="text-xs text-muted-foreground">Searching...</p></div>}

          {loadingConvos ? (
            <div className="space-y-1 p-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-40" /></div>
                  <Skeleton className="h-3 w-10" />
                </div>
              ))}
            </div>
          ) : filteredConvos.length === 0 && !searchResults.length ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                <MessageCircle className="w-7 h-7 text-muted-foreground" strokeWidth={1} />
              </div>
              <p className="text-sm font-medium text-foreground">
                {searchQuery ? "No matching contacts" : "No conversations"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery ? "Try searching by email to find someone" : "Search by email to start a new chat"}
              </p>
            </div>
          ) : (
            filteredConvos.map((convo) => {
              const isOnline = convo.participant?.id ? onlineUsers.has(convo.participant.id) : false;
              return (
                <button
                  key={convo.conversationId}
                  onClick={() => openConversation(convo)}
                  className={`w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/50 transition-colors ${
                    activeConvo?.conversationId === convo.conversationId ? "bg-secondary" : ""
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={resolveAssetUrl(convo.participant?.avatarUrl || "")} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                        {convo.participant?.fullName?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    {isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-card" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground truncate">{convo.participant?.fullName}</p>
                      {convo.lastMessage && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatTime(convo.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {convo.lastMessage && (
                      <div className="flex items-center gap-1 mt-0.5">
                        {convo.lastMessage.senderId === myProfileId && (
                          <span className="shrink-0">
                            {convo.lastMessage.isRead ? <CheckCheck className="w-3 h-3 text-primary" /> : <Check className="w-3 h-3 text-muted-foreground" />}
                          </span>
                        )}
                        <p className="text-xs text-muted-foreground truncate">{convo.lastMessage.content || "Sent an image"}</p>
                      </div>
                    )}
                  </div>
                  {convo.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                      {convo.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Messages Panel */}
      <div className={`flex-1 flex flex-col ${showMessages ? "flex" : "hidden md:flex"}`}>
        {activeConvo ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border shrink-0">
              <button onClick={() => setActiveConvo(null)} className="p-1 rounded-lg hover:bg-secondary md:hidden">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={resolveAssetUrl(activeConvo.participant?.avatarUrl || "")} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {activeConvo.participant?.fullName?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                {activeConvo.participant?.id && onlineUsers.has(activeConvo.participant.id) && (
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-success border border-card" />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{activeConvo.participant?.fullName}</p>
                <p className="text-[10px] text-muted-foreground">
                  {activeConvo.participant?.id && onlineUsers.has(activeConvo.participant.id) ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            {/* Off-platform warning */}
            <div className="mx-4 mt-3 flex items-start gap-2 rounded-xl bg-warning/10 border border-warning/20 px-3 py-2">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="text-[11px] text-warning leading-relaxed">
                For your safety, keep all transactions on Sintherior. We cannot protect payments or resolve disputes for off-platform deals.
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const senderId = typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;
                  const isMine = senderId === myProfileId;
                  const showAvi = shouldShowAvatar(msg, idx, messages);
                  const hasMedia = msg.media && msg.media.length > 0;

                  return (
                    <div key={msg._id} className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"} ${showAvi ? "mb-3" : "mb-0.5"}`}>
                      {/* Avatar (left side, only for other person) */}
                      {!isMine && (
                        <div className="w-7 shrink-0">
                          {showAvi ? (
                            <Avatar className="w-7 h-7">
                              <AvatarImage src={getAvatarUrl(msg, false) || ""} />
                              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                                {getInitial(msg, false)}
                              </AvatarFallback>
                            </Avatar>
                          ) : null}
                        </div>
                      )}

                      <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"}`}>
                        {/* Media */}
                        {hasMedia && (
                          <div className="mb-1">
                            <MediaGrid media={msg.media!} onPreview={setPreviewImage} />
                          </div>
                        )}

                        {/* Text bubble */}
                        {msg.content && (
                          <div className={`px-3.5 py-2 rounded-2xl ${
                            isMine
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-secondary text-foreground rounded-bl-md"
                          }`}>
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                            <div className="flex items-center gap-1 justify-end mt-1">
                              <span className={`text-[10px] ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                {formatTime(msg.createdAt)}
                              </span>
                              {isMine && (
                                msg.isRead
                                  ? <CheckCheck className="w-3 h-3 text-primary-foreground/70" />
                                  : <Check className="w-3 h-3 text-primary-foreground/50" />
                              )}
                            </div>
                          </div>
                        )}

                        {/* Time for media-only messages */}
                        {hasMedia && !msg.content && (
                          <div className="flex items-center gap-1 justify-end mt-0.5 px-1">
                            <span className="text-[10px] text-muted-foreground">{formatTime(msg.createdAt)}</span>
                            {isMine && (
                              msg.isRead
                                ? <CheckCheck className="w-3 h-3 text-primary" />
                                : <Check className="w-3 h-3 text-muted-foreground" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              {typing && (
                <div className="flex items-end gap-2 justify-start mb-3">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={resolveAssetUrl(activeConvo.participant?.avatarUrl || "")} />
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                      {activeConvo.participant?.fullName?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-secondary px-4 py-2.5 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick-reply chips */}
            {messages.length === 0 && (
              <div className="px-4 pt-2 flex flex-wrap gap-2">
                {["Hello! I'm interested in your services", "What are your rates?", "Are you available this week?", "Can you share more details?"].map((text) => (
                  <button key={text} type="button" onClick={() => setNewMessage(text)} className="px-3 py-1.5 rounded-full border border-border bg-secondary/50 text-xs text-foreground hover:bg-secondary transition-colors">
                    {text}
                  </button>
                ))}
              </div>
            )}

            {/* File previews */}
            {filePreviews.length > 0 && (
              <div className="px-4 pt-2 flex gap-2">
                {filePreviews.map((preview, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-border">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeFile(i)} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-destructive text-white flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-border shrink-0 flex gap-2 items-end">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl hover:bg-secondary text-muted-foreground transition-colors shrink-0"
              >
                <ImagePlus className="w-5 h-5" strokeWidth={1} />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => handleInputChange(e.target.value)}
                maxLength={2000}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                disabled={(!newMessage.trim() && selectedFiles.length === 0) || sending}
                className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-3" strokeWidth={1} />
            <p className="text-muted-foreground">Select a conversation to start messaging</p>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && <ImagePreview url={previewImage} onClose={() => setPreviewImage(null)} />}
    </div>
  );
}
