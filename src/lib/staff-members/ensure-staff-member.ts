import type { SupabaseClient } from "@supabase/supabase-js";
import { formatStaffInitials } from "@/lib/staff-members/format-initials";
import type { StaffRole } from "@/lib/staff-members/types";

type EnsureStaffMemberInput = {
  email: string;
  firstName: string;
  lastName: string;
  role?: StaffRole;
};

/**
 * Ensures the signed-in auth user has a staff_members row (signup fallback).
 */
export async function ensureStaffMemberProfile(
  supabase: SupabaseClient,
  input: EnsureStaffMemberInput
): Promise<{ ok: true } | { ok: false; message: string }> {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, message: userError?.message ?? "Not signed in." };
  }

  const trimmedFirst = input.firstName.trim();
  const trimmedLast = input.lastName.trim();
  const fullName =
    `${trimmedFirst} ${trimmedLast}`.trim() ||
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    user.email?.split("@")[0] ||
    "Staff";

  const initials = formatStaffInitials(trimmedFirst, trimmedLast, fullName);
  const email = input.email.trim() || user.email || "";
  const role = input.role ?? "staff";

  const { error } = await supabase.from("staff_members").upsert(
    {
      auth_user_id: user.id,
      email,
      full_name: fullName,
      initials,
      role
    },
    { onConflict: "email" }
  );

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

/**
 * Ensures the current session user has a staff_members row using auth metadata.
 */
export async function ensureStaffMemberFromSession(
  supabase: SupabaseClient
): Promise<{ ok: true } | { ok: false; message: string }> {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, message: userError?.message ?? "Not signed in." };
  }

  const metadata = user.user_metadata ?? {};
  const firstName =
    (typeof metadata.first_name === "string" ? metadata.first_name : "") ||
    "";
  const lastName =
    (typeof metadata.last_name === "string" ? metadata.last_name : "") || "";

  return ensureStaffMemberProfile(supabase, {
    email: user.email ?? "",
    firstName,
    lastName
  });
}
