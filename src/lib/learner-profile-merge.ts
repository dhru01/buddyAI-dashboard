import type { Learner, LearnerStatus } from "@/lib/types";

export type ProfileDraft = {
  name: string;
  grade: string;
  school: string;
  curriculum: string;
  preferredLanguage: string;
  subjectsLine: string;
  consent: string;
  status: LearnerStatus;
  buddyPoints: string;
  streakLabel: string;
  strongTopics: string;
  weakTopics: string;
};

function normalizeGradeFromDraft(input: string): string {
  const t = input.trim();
  if (!t) return "";
  if (/^grade\s+/i.test(t)) {
    return t.replace(/^grade\s+/i, "Grade ").trim();
  }
  return `Grade ${t}`;
}

export function mergeProfileDraftIntoLearner(learner: Learner, draft: ProfileDraft): Learner {
  const streakMatch = draft.streakLabel.match(/(\d+)/);
  const parsedStreak = streakMatch ? Number.parseInt(streakMatch[1], 10) : NaN;
  const currentStreak = Number.isFinite(parsedStreak) ? parsedStreak : learner.currentStreak;

  const digitsOnly = draft.buddyPoints.replace(/\D/g, "");
  const parsedBp = digitsOnly ? Number.parseInt(digitsOnly, 10) : NaN;
  const buddyPoints = Number.isFinite(parsedBp) ? parsedBp : learner.buddyPoints;

  const subjects = draft.subjectsLine
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const gradeNorm = normalizeGradeFromDraft(draft.grade);
  const grade = gradeNorm || learner.grade;

  const consentTrim = draft.consent.trim();
  const strongTrim = draft.strongTopics.trim();
  const weakTrim = draft.weakTopics.trim();

  return {
    ...learner,
    name: draft.name.trim() || learner.name,
    grade,
    school: draft.school.trim(),
    curriculum: draft.curriculum.trim(),
    preferredLanguage: draft.preferredLanguage.trim(),
    subjects: subjects.length ? subjects : learner.subjects,
    status: draft.status,
    buddyPoints,
    currentStreak,
    consentNote: consentTrim || undefined,
    strongTopics: strongTrim || undefined,
    weakTopics: weakTrim || undefined
  };
}
