import { formatGradeNumber } from "@/lib/grade-display";
import type { Learner, LearnerStatus } from "@/lib/types";
import type { ProfileDraft } from "@/lib/learner-profile-merge";

export const LEARNER_STATUS_OPTIONS: LearnerStatus[] = ["active", "inactive", "needs support"];

export const DEFAULT_CONSENT = "Parent consent verified";
export const DEFAULT_STRONG_TOPICS = "Algebra, Problem solving";
export const DEFAULT_WEAK_TOPICS = "Scientific notation";

export function buildProfileDraft(learner: Learner): ProfileDraft {
  return {
    name: learner.name,
    grade: formatGradeNumber(learner.grade),
    school: learner.school,
    curriculum: learner.curriculum,
    preferredLanguage: learner.preferredLanguage,
    subjectsLine: learner.subjects.join(", "),
    consent: learner.consentNote ?? DEFAULT_CONSENT,
    status: learner.status,
    buddyPoints: String(learner.buddyPoints),
    streakLabel: `${learner.currentStreak} days`,
    strongTopics: learner.strongTopics ?? DEFAULT_STRONG_TOPICS,
    weakTopics: learner.weakTopics ?? DEFAULT_WEAK_TOPICS
  };
}
