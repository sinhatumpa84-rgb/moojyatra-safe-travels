import { useAuthContext } from "@/contexts/AuthContext";

/**
 * Drop-in replacement for the old Supabase-based useAuth.
 * Returns the same shape { user, loading, signOut } so all
 * existing call-sites continue to work without changes.
 */
export function useAuth() {
  return useAuthContext();
}
