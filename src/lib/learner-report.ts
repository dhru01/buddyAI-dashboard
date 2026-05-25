import { format, parseISO } from "date-fns";
import { getBuddyTierLabel } from "@/lib/buddy-badges";
import {
  DEFAULT_STRONG_TOPICS,
  DEFAULT_WEAK_TOPICS
} from "@/lib/learner-profile-draft";
import { formatSubjectsAbbreviated } from "@/lib/subject-abbrev";
import type { Conversation, Learner } from "@/lib/types";

export type LearnerReportAnalytics = {
  totalConversations: number;
  flaggedConversations: number;
  fallbackConversations: number;
  reviewedConversations: number;
  topSubjects: { subject: string; count: number }[];
};

export type LearnerReport = {
  generatedAt: string;
  learner: Learner;
  badgeTier: string;
  subjectsDisplay: string;
  lastActiveDisplay: string;
  analytics: LearnerReportAnalytics;
  strengthsWeaknesses: string;
};

export function buildLearnerReportAnalytics(
  learnerId: string,
  conversations: Conversation[]
): LearnerReportAnalytics {
  const forLearner = conversations.filter((c) => c.learnerId === learnerId);
  const subjectCounts = new Map<string, number>();
  for (const c of forLearner) {
    subjectCounts.set(c.subject, (subjectCounts.get(c.subject) ?? 0) + 1);
  }
  const topSubjects = [...subjectCounts.entries()]
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    totalConversations: forLearner.length,
    flaggedConversations: forLearner.filter((c) => c.flagged).length,
    fallbackConversations: forLearner.filter((c) => c.fallback).length,
    reviewedConversations: forLearner.filter((c) => c.reviewed).length,
    topSubjects
  };
}

function formatLastActive(isoDate: string): string {
  try {
    return format(parseISO(isoDate), "d MMM yyyy");
  } catch {
    return isoDate;
  }
}

export function buildStrengthsWeaknessesNarrative(
  learner: Learner,
  analytics: LearnerReportAnalytics
): string {
  const strong = learner.strongTopics?.trim() || DEFAULT_STRONG_TOPICS;
  const weak = learner.weakTopics?.trim() || DEFAULT_WEAK_TOPICS;
  const topSubject =
    analytics.topSubjects[0]?.subject ??
    (learner.subjects[0] ? learner.subjects[0] : "their enrolled subjects");

  const engagement =
    learner.totalQuestionsAsked >= 300
      ? "shows strong overall engagement with BuddyAI"
      : learner.totalQuestionsAsked >= 100
        ? "is building steady engagement with BuddyAI"
        : "is still developing regular engagement with BuddyAI";

  const streakNote =
    learner.currentStreak >= 7
      ? `They maintain a ${learner.currentStreak}-day learning streak, which supports consistent practice.`
      : learner.currentStreak > 0
        ? `Their current streak is ${learner.currentStreak} day${learner.currentStreak === 1 ? "" : "s"}.`
        : "They do not currently have an active streak, which may indicate inconsistent study habits.";

  const supportNote =
    analytics.flaggedConversations > 0
      ? ` Staff have flagged ${analytics.flaggedConversations} conversation${analytics.flaggedConversations === 1 ? "" : "s"} for follow-up.`
      : "";

  return `${learner.name.split(" ")[0]} ${engagement}, with ${learner.totalQuestionsAsked} questions asked to date and most activity in ${topSubject}. ${streakNote} Strengths include ${strong}; areas to develop include ${weak}.${supportNote}`.trim();
}

export function buildLearnerReport(
  learner: Learner,
  conversations: Conversation[]
): LearnerReport {
  const analytics = buildLearnerReportAnalytics(learner.id, conversations);
  return {
    generatedAt: new Date().toISOString(),
    learner,
    badgeTier: getBuddyTierLabel(learner.buddyPoints),
    subjectsDisplay: formatSubjectsAbbreviated(learner.subjects),
    lastActiveDisplay: formatLastActive(learner.lastActiveDate),
    analytics,
    strengthsWeaknesses: buildStrengthsWeaknessesNarrative(learner, analytics)
  };
}
