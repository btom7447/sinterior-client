// Re-export from AuthContext so all existing imports of `@/hooks/useAuth`
// continue to work unchanged while sharing the single context instance.
export { useAuth, AuthProvider } from "@/contexts/AuthContext";
export type { Profile, AuthResponse } from "@/contexts/AuthContext";
