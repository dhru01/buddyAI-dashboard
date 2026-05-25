/** Maps CAPS-style subject labels to 3-letter codes for compact tables. */
const ABBREV_BY_NORMALIZED: Record<string, string> = {
  english: "Eng",
  mathematics: "Mat",
  "physical sciences": "Phy",
  "physical science": "Phy",
  "life sciences": "Lif",
  "life science": "Lif",
  accounting: "Acc",
  geography: "Geo",
  history: "His",
  economics: "Eco",
  "natural sciences": "Lif",
  "natural science": "Lif"
};

function normalizeSubjectKey(name: string): string {
  return name.trim().toLowerCase();
}

export function abbreviateSubject(name: string): string {
  const key = normalizeSubjectKey(name);
  return ABBREV_BY_NORMALIZED[key] ?? name.slice(0, 3);
}

export function formatSubjectsAbbreviated(subjects: readonly string[]): string {
  return subjects.map(abbreviateSubject).join(", ");
}
