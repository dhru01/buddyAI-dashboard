"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  ["Overview", "/dashboard"],
  ["Learners", "/dashboard/learners"],
  ["Conversations", "/dashboard/conversations"],
  ["Errors and Fallbacks", "/dashboard/errors"],
  ["Manual Controls", "/dashboard/manual-controls"],
  ["Generate Report", "/dashboard/generate-report"],
  ["Settings", "/dashboard/settings"]
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 border-r border-border bg-background p-4">
      <h1 className="mb-6 text-xl font-bold">
        BuddyAI <span className="text-primary">Dashboard</span>
      </h1>
      <nav className="space-y-1">
        {items.map(([label, href]) => {
          const isOverview = href === "/dashboard";
          const isActive = isOverview
            ? pathname === "/dashboard"
            : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "block rounded-xl px-3 py-2 text-sm",
                isActive ? "bg-primary text-black" : "hover:bg-muted"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
