"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Conversation {
  id: string;
  participant_one: string;
  participant_two: string;
  last_message_text: string | null;
  last_message_at: string | null;
  created_at: string;
  other_user?: { full_name: string; avatar_url: string | null; role: string };
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);

  const fetchConversations = useCallback(async () => {
    if (!user) { setConversations([]); setLoading(false); return; }
    const { data: convos } = await supabase.from("conversations").select("*").or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`).order("last_message_at", { ascending: false });
    if (!convos) { setLoading(false); return; }
    const otherUserIds = convos.map(c => c.participant_one === user.id ? c.participant_two : c.participant_one);
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, avatar_url, role").in("user_id", otherUserIds);
    const { data: unreadData } = await supabase.from("messages").select("conversation_id").in("conversation_id", convos.map(c => c.id)).neq("sender_id", user.id).eq("is_read", false);
    const unreadMap: Record<string, number> = {};
    unreadData?.forEach(m => { unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] || 0) + 1; });
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
    const enriched: Conversation[] = convos.map(c => {
      const otherId = c.participant_one === user.id ? c.participant_two : c.participant_one;
      const prof = profileMap.get(otherId);
      return { ...c, other_user: prof ? { full_name: prof.full_name, avatar_url: prof.avatar_url, role: prof.role } : undefined, unread_count: unreadMap[c.id] || 0 };
    });
    setConversations(enriched);
    setTotalUnread(Object.values(unreadMap).reduce((a, b) => a + b, 0));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchConversations();
    const channel = supabase.channel("chat-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => fetchConversations())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => fetchConversations())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchConversations]);

  const startConversation = async (otherUserId: string) => {
    if (!user) return null;
    const { data: existing } = await supabase.from("conversations").select("id").or(`and(participant_one.eq.${user.id},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${user.id})`).maybeSingle();
    if (existing) return existing.id;
    const { data, error } = await supabase.from("conversations").insert({ participant_one: user.id, participant_two: otherUserId }).select("id").single();
    if (error) throw error;
    return data.id;
  };

  return { conversations, loading, totalUnread, startConversation, refetch: fetchConversations };
};

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) { setMessages([]); setLoading(false); return; }
    const { data } = await supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
    setMessages((data as Message[]) || []);
    setLoading(false);
    if (user) await supabase.from("messages").update({ is_read: true }).eq("conversation_id", conversationId).neq("sender_id", user.id).eq("is_read", false);
  }, [conversationId, user]);

  useEffect(() => {
    if (!conversationId) return;
    fetchMessages();
    const channel = supabase.channel(`messages-${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => [...prev, newMsg]);
        if (user && newMsg.sender_id !== user.id) supabase.from("messages").update({ is_read: true }).eq("id", newMsg.id);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, user, fetchMessages]);

  const sendMessage = async (content: string) => {
    if (!conversationId || !user || !content.trim()) return;
    await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: user.id, content: content.trim() });
    await supabase.from("conversations").update({ last_message_text: content.trim(), last_message_at: new Date().toISOString() }).eq("id", conversationId);
  };

  return { messages, loading, sendMessage };
};
