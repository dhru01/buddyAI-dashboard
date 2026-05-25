"use client";

import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";

export function Topbar() {
  const pathname = usePathname();
  const hideSearch =
    pathname === "/dashboard" ||
    pathname === "/dashboard/learners" ||
    pathname.startsWith("/dashboard/learners/") ||
    pathname === "/dashboard/conversations" ||
    pathname === "/dashboard/errors" ||
    pathname === "/dashboard/manual-controls" ||
    pathname === "/dashboard/settings" ||
    pathname === "/dashboard/generate-report";

  return (
    <header className="flex items-center justify-between bg-background px-6 py-4">
      {!hideSearch ? (
        <div className="w-full max-w-sm">
          <Input placeholder="Search learners, conversations, errors..." />
        </div>
      ) : null}
    </header>
  );
}
