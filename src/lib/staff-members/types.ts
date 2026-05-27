/** Staff roles reserved for future permission models. */
export type StaffRole = "admin" | "support" | "tutor" | "reviewer" | "staff";

export type StaffMember = {
  id: string;
  authUserId: string | null;
  email: string;
  fullName: string;
  initials: string;
  role: StaffRole;
  createdAt: string;
};

export type StaffMemberRow = {
  id: string;
  auth_user_id: string | null;
  email: string;
  full_name: string;
  initials: string;
  role: StaffRole;
  created_at: string;
};

export function mapStaffMemberRow(row: StaffMemberRow): StaffMember {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    email: row.email,
    fullName: row.full_name,
    initials: row.initials,
    role: row.role,
    createdAt: row.created_at
  };
}
