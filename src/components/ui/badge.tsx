import { cn } from "@/lib/utils";

/** Bold label + colour-matched soft glow (no pill background). */
const statusStyles: Record<string, string> = {
  active:
    "text-green-600 [text-shadow:0_0_10px_rgba(22,163,74,0.55),0_0_22px_rgba(34,197,94,0.3)]",
  inactive:
    "text-gray-600 [text-shadow:0_0_10px_rgba(107,114,128,0.45),0_0_18px_rgba(156,163,175,0.25)]",
  "needs support":
    "text-amber-700 [text-shadow:0_0_10px_rgba(180,83,9,0.45),0_0_20px_rgba(251,191,36,0.35)]",
  new: "text-blue-600 [text-shadow:0_0_10px_rgba(37,99,235,0.45),0_0_20px_rgba(96,165,250,0.25)]",
  "in review":
    "text-yellow-800 [text-shadow:0_0_10px_rgba(161,98,7,0.4),0_0_18px_rgba(250,204,21,0.25)]",
  resolved:
    "text-green-600 [text-shadow:0_0_10px_rgba(22,163,74,0.45),0_0_20px_rgba(34,197,94,0.25)]"
};

const statusDisplay: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  "needs support": "Needs support",
  new: "New",
  "in review": "In review",
  resolved: "Resolved"
};

export function StatusBadge({
  status,
  layout = "fixed"
}: {
  status: string;
  /** `fixed`: table column — centred, stable width for alignment. `inline`: sits beside buttons. */
  layout?: "fixed" | "inline";
}) {
  const key = status.toLowerCase();
  const display =
    statusDisplay[key] ??
    status
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap font-bold",
        layout === "inline"
          ? "shrink-0 px-1 py-0.5 text-sm leading-tight"
          : "min-h-7 w-[9.25rem] min-w-[9.25rem] text-xs leading-tight",
        statusStyles[key] ?? "text-foreground [text-shadow:0_0_10px_rgba(20,20,20,0.12)]"
      )}
      title={display}
    >
      {display}
    </span>
  );
}
