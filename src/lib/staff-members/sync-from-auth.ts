import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Imports all auth.users into staff_members (idempotent). Requires DB function
 * from supabase/migrations/20260526_sync_staff_members_from_auth.sql.
 */
export async function syncStaffMembersFromAuth(
  supabase: SupabaseClient
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase.rpc("sync_staff_members_from_auth");

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}
