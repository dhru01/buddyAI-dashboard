import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subYears
} from "date-fns";
import type { Conversation } from "@/lib/types";

function includesInsensitive(haystack: string, needle: string): boolean {
  const n = needle.trim().toLowerCase();
  if (!n) return true;
  return haystack.toLowerCase().includes(n);
}

export type ConversationDatePeriod = "" | "today" | "week" | "month" | "3-months" | "1-year";

export function matchesLearnerSearch(conversation: Conversation, query: string): boolean {
  return includesInsensitive(conversation.learnerName, query);
}

export function matchesSubjectFilter(conversation: Conversation, query: string): boolean {
  return includesInsensitive(conversation.subject, query);
}

export function matchesLanguageFilter(conversation: Conversation, query: string): boolean {
  return includesInsensitive(conversation.language, query);
}

export function matchesDatePeriod(
  conversation: Conversation,
  period: ConversationDatePeriod,
  referenceDate: Date = new Date()
): boolean {
  if (!period) return true;

  const day = startOfDay(parseISO(conversation.date));
  const now = referenceDate;
  let start: Date;
  let end: Date = endOfDay(now);

  switch (period) {
    case "today":
      start = startOfDay(now);
      end = endOfDay(now);
      break;
    case "week":
      start = startOfWeek(now, { weekStartsOn: 1 });
      end = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case "month":
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;
    case "3-months":
      start = startOfDay(subMonths(now, 3));
      break;
    case "1-year":
      start = startOfDay(subYears(now, 1));
      break;
    default:
      return true;
  }

  return !isBefore(day, start) && !isAfter(day, end);
}

export function filterConversations(
  conversations: Conversation[],
  filters: {
    learnerQuery: string;
    datePeriod: ConversationDatePeriod;
    subjectQuery: string;
    languageQuery: string;
  }
): Conversation[] {
  return conversations.filter(
    (c) =>
      matchesLearnerSearch(c, filters.learnerQuery) &&
      matchesDatePeriod(c, filters.datePeriod) &&
      matchesSubjectFilter(c, filters.subjectQuery) &&
      matchesLanguageFilter(c, filters.languageQuery)
  );
}
