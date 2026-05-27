"use client";

import { useStaffMembers } from "@/context/staff-members-store";
import { UNASSIGNED_STAFF_LABEL } from "@/lib/issue-queue-staff";
import { UNASSIGNED_STAFF_VALUE } from "@/lib/staff-members/constants";
import { cn } from "@/lib/utils";

type AssignedStaffSelectProps = {
  value: string | null;
  onChange: (staffMemberId: string | null) => void;
  className?: string;
};

export function AssignedStaffSelect({ value, onChange, className }: AssignedStaffSelectProps) {
  const { staffMembers, loading } = useStaffMembers();

  const selectValue = value ?? UNASSIGNED_STAFF_VALUE;

  if (loading) {
    return (
      <div
        aria-label="Assign staff"
        aria-busy="true"
        className={cn(
          "mx-auto block h-9 min-w-[8.5rem] max-w-full animate-pulse rounded-xl border border-border bg-muted/60",
          className
        )}
      />
    );
  }

  return (
    <select
      aria-label="Assign staff"
      value={selectValue}
      onChange={(event) => {
        const next = event.target.value;
        onChange(next === UNASSIGNED_STAFF_VALUE ? null : next);
      }}
      className={cn(
        "mx-auto block h-9 min-w-[8.5rem] max-w-full rounded-xl border border-border bg-card px-2 text-sm text-foreground outline-none focus:border-primary",
        className
      )}
    >
      <option value={UNASSIGNED_STAFF_VALUE}>{UNASSIGNED_STAFF_LABEL}</option>
      {staffMembers.length === 0 ? (
        <option value="__no_staff__" disabled>
          No staff available
        </option>
      ) : (
        staffMembers.map((member) => (
          <option key={member.id} value={member.id}>
            {member.initials}
          </option>
        ))
      )}
    </select>
  );
}
