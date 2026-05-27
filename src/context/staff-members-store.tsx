"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { createClient } from "@/lib/supabase/client";
import { ensureStaffMemberFromSession } from "@/lib/staff-members/ensure-staff-member";
import { syncStaffMembersFromAuth } from "@/lib/staff-members/sync-from-auth";
import { mapStaffMemberRow, type StaffMember } from "@/lib/staff-members/types";

type StaffMembersContextValue = {
  staffMembers: StaffMember[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getStaffMemberById: (id: string | null | undefined) => StaffMember | undefined;
};

const StaffMembersContext = createContext<StaffMembersContextValue | null>(null);

export function StaffMembersProvider({ children }: { children: ReactNode }) {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaffMembers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (session) {
        await ensureStaffMemberFromSession(supabase);
        await syncStaffMembersFromAuth(supabase);
      }

      const { data, error: fetchError } = await supabase
        .from("staff_members")
        .select("id, auth_user_id, email, full_name, initials, role, created_at")
        .order("full_name", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
        setStaffMembers([]);
        return;
      }

      setStaffMembers((data ?? []).map(mapStaffMemberRow));
    } catch {
      setError("Unable to load staff members.");
      setStaffMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStaffMembers();
  }, [fetchStaffMembers]);

  const getStaffMemberById = useCallback(
    (id: string | null | undefined) => {
      if (!id) return undefined;
      return staffMembers.find((member) => member.id === id);
    },
    [staffMembers]
  );

  const value = useMemo(
    () => ({
      staffMembers,
      loading,
      error,
      refresh: fetchStaffMembers,
      getStaffMemberById
    }),
    [staffMembers, loading, error, fetchStaffMembers, getStaffMemberById]
  );

  return (
    <StaffMembersContext.Provider value={value}>{children}</StaffMembersContext.Provider>
  );
}

export function useStaffMembers() {
  const ctx = useContext(StaffMembersContext);
  if (!ctx) {
    throw new Error("useStaffMembers must be used within StaffMembersProvider");
  }
  return ctx;
}
