import { format, parseISO } from "date-fns";

/** ISO date (YYYY-MM-DD) → e.g. 5 May '26 */
export function formatLastActiveDisplay(isoDate: string): string {
  return format(parseISO(isoDate), "d MMM ''yy");
}

export function parseErrorLogDateTimeParts(timestamp: string): {
  date: string;
  time: string | null;
} {
  const trimmed = timestamp.trim();
  const match = /^(\d{4}-\d{2}-\d{2})(?:\s+(\d{1,2}):(\d{2}))?/.exec(trimmed);
  if (!match) return { date: trimmed, time: null };
  const [, datePart, hour, minute] = match;
  const date = formatLastActiveDisplay(datePart);
  if (hour === undefined) return { date, time: null };
  const h = Number.parseInt(hour, 10);
  const m = Number.parseInt(minute ?? "0", 10);
  if (!Number.isFinite(h)) return { date, time: null };
  const d = parseISO(datePart);
  d.setHours(h, m, 0, 0);
  return { date, time: format(d, "h:mm a") };
}

/** ISO 8601 timestamp → e.g. 12 May 2026 at 5:53 PM */
export function formatNoteTimestamp(iso: string): string {
  try {
    return format(parseISO(iso), "d MMM yyyy 'at' h:mm a");
  } catch {
    return iso;
  }
}
