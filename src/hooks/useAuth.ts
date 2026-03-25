"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email?: string | null;
  phone: string | null;
  role: "artisan" | "supplier" | "client";
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (!data) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return { ...data, email: user?.email ?? null } as Profile;
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        if (user) {
          setTimeout(async () => {
            const profile = await fetchProfile(user.id);
            setState({ user, session, profile, loading: false });
          }, 0);
          setState(prev => ({ ...prev, user, session, loading: !prev.profile }));
        } else {
          setState({ user: null, session: null, profile: null, loading: false });
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      if (user) {
        const profile = await fetchProfile(user.id);
        setState({ user, session, profile, loading: false });
      } else {
        setState({ user: null, session: null, profile: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  return {
    ...state,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    isAuthenticated: !!state.session,
  };
};
