export function formatGradeNumber(grade: string): string {
  return grade.replace(/^Grade\s+/i, "").trim();
}
