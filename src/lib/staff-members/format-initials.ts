/**
 * Formats display initials for staff assignment dropdowns.
 * Example: "Dhru", "Mistry" → "D. Mistry"
 */
export function formatStaffInitials(
  firstName: string,
  lastName: string,
  fullName?: string
): string {
  let first = firstName.trim();
  let last = lastName.trim();

  if (!first && !last && fullName?.trim()) {
    const parts = fullName.trim().split(/\s+/);
    first = parts[0] ?? "";
    last = parts.slice(1).join(" ");
  }

  if (!first && !last) {
    return "Staff";
  }

  if (!last) {
    return `${first.charAt(0).toUpperCase()}.`;
  }

  return `${first.charAt(0).toUpperCase()}. ${last}`;
}
