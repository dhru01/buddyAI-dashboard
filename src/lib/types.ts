export type LearnerStatus = "active" | "inactive" | "needs support";
export type ReviewStatus = "new" | "in review" | "resolved";

export interface LearnerSupportNote {
  id: string;
  body: string;
  /** ISO 8601 timestamp */
  createdAt: string;
}

export interface Learner {
  id: string;
  name: string;
  /** Optional profile image URL; UI falls back to a deterministic AI demo portrait if missing */
  avatarUrl?: string;
  grade: string;
  school: string;
  curriculum: string;
  preferredLanguage: string;
  subjects: string[];
  totalQuestionsAsked: number;
  buddyPoints: number;
  currentStreak: number;
  lastActiveDate: string;
  status: LearnerStatus;
  /** Profile-only fields persisted in client state until a backend exists */
  consentNote?: string;
  strongTopics?: string;
  weakTopics?: string;
  supportNotes?: LearnerSupportNote[];
}

export interface ConversationNote {
  id: string;
  body: string;
  /** ISO 8601 timestamp */
  createdAt: string;
}

export interface Conversation {
  id: string;
  learnerId: string;
  learnerName: string;
  subject: string;
  language: string;
  date: string;
  flagged: boolean;
  fallback: boolean;
  reviewed: boolean;
  snippet: string;
  staffNotes?: ConversationNote[];
}

export interface Message {
  id: string;
  conversationId: string;
  sender: "learner" | "buddyai";
  content: string;
  timestamp: string;
  metadata?: {
    topic?: string;
    difficulty?: string;
    confidence?: number;
    correctness?: string;
    usedFallback?: boolean;
    imageIncluded?: boolean;
  };
}

export interface ErrorLog {
  id: string;
  learner: string;
  timestamp: string;
  errorType: string;
  snippet: string;
  status: ReviewStatus;
  /** staff_members.id; null means unassigned */
  assignedStaffId: string | null;
  internalNotes: string;
  /** Links a queue row to a conversation when flagged from Conversation Viewer */
  conversationId?: string;
}
