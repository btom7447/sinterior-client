"use client";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, setToken } from "@/lib/apiClient";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ApiProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  city: string;
  state: string;
}

interface ApiUser {
  id: string;
  email: string;
  role: "artisan" | "supplier" | "client";
  isEmailVerified: boolean;
  profile: ApiProfile | null;
}

// Matches the snake_case shape that existing components already expect
export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: "artisan" | "supplier" | "client";
  avatar_url: string | null;
  bio: string | null;
  city: string;
  state: string;
}

interface AuthState {
  user: ApiUser | null;
  profile: Profile | null;
  loading: boolean;
}

// ── Shape the raw API user into the snake_case profile components expect ──────
function toProfile(user: ApiUser): Profile {
  return {
    id: user.profile?.id ?? user.id,
    user_id: user.id,
    full_name: user.profile?.fullName ?? "",
    email: user.email,
    phone: null,
    role: user.role,
    avatar_url: user.profile?.avatarUrl ?? null,
    bio: null,
    city: user.profile?.city ?? "",
    state: user.profile?.state ?? "",
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  });

  // On mount: try to restore session using the httpOnly refresh-token cookie
  const restoreSession = useCallback(async () => {
    try {
      const refreshData = await apiPost<{ data: { accessToken: string } }>(
        "/auth/refresh"
      );
      setToken(refreshData.data.accessToken);

      const meData = await apiGet<{ data: { user: ApiUser } }>("/auth/me");
      const user = meData.data.user;
      setState({ user, profile: toProfile(user), loading: false });
    } catch {
      setToken(null);
      setState({ user: null, profile: null, loading: false });
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    const data = await apiPost<{ data: { accessToken: string; user: ApiUser } }>(
      "/auth/login",
      { email, password }
    );
    setToken(data.data.accessToken);
    const user = data.data.user;
    setState({ user, profile: toProfile(user), loading: false });
    return data;
  };

  const signUp = async (payload: {
    email: string;
    password: string;
    role: string;
    fullName: string;
    city: string;
    state: string;
  }) => {
    const data = await apiPost<{ data: { accessToken: string; user: ApiUser } }>(
      "/auth/register",
      payload
    );
    setToken(data.data.accessToken);
    const user = data.data.user;
    setState({ user, profile: toProfile(user), loading: false });
    return data;
  };

  const signOut = async () => {
    try {
      await apiPost("/auth/logout");
    } catch {
      // best-effort — clear client state regardless
    }
    setToken(null);
    setState({ user: null, profile: null, loading: false });
  };

  /** Sends a password reset email (or returns token in dev mode). */
  const resetPassword = async (email: string) => {
    await apiPost("/auth/forgot-password", { email });
  };

  /**
   * Completes the reset flow.
   * @param token  The raw token from the ?token= query param in the reset link
   * @param password  The user's new password
   */
  const updatePassword = async (token: string, password: string) => {
    await apiPost(`/auth/reset-password/${token}`, { password });
  };

  /** Changes password for the currently logged-in user. */
  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    const data = await apiPost<{ data: { accessToken: string } }>(
      "/auth/change-password",
      { currentPassword, newPassword }
    );
    // Server reissues a fresh access token after password change
    setToken(data.data.accessToken);
  };

  return {
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    isAuthenticated: !!state.user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    changePassword,
  };
};
