"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPatch } from "@/lib/apiClient";
import { acquireSocket, releaseSocket } from "@/lib/socket";
import { useAuth } from "./useAuth";

export interface Notification {
  _id: string;
  title: string;
  body?: string;
  message?: string;
  type: string;
  isRead: boolean;
  data?: Record<string, unknown>;
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
      const res = await apiGet<{ data: Notification[] }>(
        "/notifications?limit=30"
      );
      setNotifications(res.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch once on mount + listen for real-time notifications via shared socket
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    let mounted = true;
    fetchNotifications();

    const s = acquireSocket();
    if (s) {
      const handler = (notification: Notification) => {
        if (!mounted) return;
        setNotifications((prev) => {
          if (prev.some((n) => n._id === notification._id)) return prev;
          return [notification, ...prev];
        });
      };

      s.on("notification:new", handler);

      return () => {
        mounted = false;
        s.off("notification:new", handler);
        releaseSocket();
      };
    }

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await apiPatch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
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
