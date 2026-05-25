"use client";

import {
  ISSUE_QUEUE_STAFF,
  UNASSIGNED_STAFF,
  isIssueQueueStaffName
} from "@/lib/issue-queue-staff";
import { cn } from "@/lib/utils";

type AssignedStaffSelectProps = {
  value: string;
  onChange: (staff: string) => void;
  className?: string;
};

export function AssignedStaffSelect({ value, onChange, className }: AssignedStaffSelectProps) {
  const selectValue = isIssueQueueStaffName(value) || value === UNASSIGNED_STAFF ? value : UNASSIGNED_STAFF;

  return (
    <select
      aria-label="Assign staff"
      value={selectValue}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "mx-auto block h-9 min-w-[8.5rem] max-w-full rounded-xl border border-border bg-white px-2 text-sm outline-none focus:border-primary",
        className
      )}
    >
      <option value={UNASSIGNED_STAFF}>{UNASSIGNED_STAFF}</option>
      {ISSUE_QUEUE_STAFF.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
}
