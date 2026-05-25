"use client";

import { cn } from "@/lib/utils";
import type { ConversationDatePeriod } from "@/lib/conversation-filters";

const OPTIONS: { value: ConversationDatePeriod; label: string }[] = [
  { value: "", label: "Filter by date" },
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "3-months", label: "3 months" },
  { value: "1-year", label: "1 year" }
];

type DatePeriodSelectProps = {
  value: ConversationDatePeriod;
  onChange: (value: ConversationDatePeriod) => void;
  className?: string;
};

export function DatePeriodSelect({ value, onChange, className }: DatePeriodSelectProps) {
  return (
    <select
      aria-label="Filter by date"
      value={value}
      onChange={(e) => onChange(e.target.value as ConversationDatePeriod)}
      className={cn(
        "h-10 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary",
        !value && "text-foreground/50",
        className
      )}
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value || "all"} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
