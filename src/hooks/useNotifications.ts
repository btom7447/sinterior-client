"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPatch } from "@/lib/apiClient";
import { useAuth } from "./useAuth";

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

export const useNotifications = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    try {
      const res = await apiGet<{ data: Notification[] }>("/notifications?limit=30");
      setNotifications(res.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initial fetch + polling every 30s
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await apiPatch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch {
      // silent
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiPatch("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silent
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
};
