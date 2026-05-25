/** Strip trailing "(Subject • Language)" suffix from legacy internal notes. */
export function formatErrorLogInternalNotes(notes: string): string {
  return notes.replace(/\s+\([^)]+\)\.?$/, "").trim();
}
