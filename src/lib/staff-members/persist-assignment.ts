import type { SupabaseClient } from "@supabase/supabase-js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isPersistableErrorLogId(errorLogId: string): boolean {
  return UUID_PATTERN.test(errorLogId);
}

/**
 * Persists staff assignment on error_logs (Supabase). No-op for client-only mock ids.
 */
export async function persistErrorLogStaffAssignment(
  supabase: SupabaseClient,
  errorLogId: string,
  staffMemberId: string | null
): Promise<void> {
  if (!isPersistableErrorLogId(errorLogId)) {
    return;
  }

  const { error } = await supabase
    .from("error_logs")
    .update({ assigned_staff: staffMemberId })
    .eq("id", errorLogId);

  if (error) {
    throw new Error(error.message);
  }
}
