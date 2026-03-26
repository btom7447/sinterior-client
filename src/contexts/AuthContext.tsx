"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
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

export interface AuthResponse {
  data: { accessToken: string; user: ApiUser };
}

interface AuthContextType extends AuthState {
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (payload: {
    email: string;
    password: string;
    role: string;
    fullName: string;
    city: string;
    state: string;
  }) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (token: string, password: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  });

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

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    const data = await apiPost<AuthResponse>("/auth/login", { email, password });
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
  }): Promise<AuthResponse> => {
    const data = await apiPost<AuthResponse>("/auth/register", payload);
    setToken(data.data.accessToken);
    const user = data.data.user;
    setState({ user, profile: toProfile(user), loading: false });
    return data;
  };

  const signOut = async () => {
    try {
      await apiPost("/auth/logout");
    } catch {
      // best-effort
    }
    setToken(null);
    setState({ user: null, profile: null, loading: false });
  };

  const resetPassword = async (email: string) => {
    await apiPost("/auth/forgot-password", { email });
  };

  const updatePassword = async (token: string, password: string) => {
    await apiPost(`/auth/reset-password/${token}`, { password });
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    const data = await apiPost<{ data: { accessToken: string } }>(
      "/auth/change-password",
      { currentPassword, newPassword }
    );
    setToken(data.data.accessToken);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isAuthenticated: !!state.user,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
