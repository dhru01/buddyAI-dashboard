import type { Conversation, ErrorLog } from "@/lib/types";

/** Resolves the conversation to open for an issues-queue row. */
export function resolveConversationIdForError(
  error: ErrorLog,
  conversations: Conversation[]
): string | undefined {
  if (error.conversationId && conversations.some((c) => c.id === error.conversationId)) {
    return error.conversationId;
  }
  return conversations.find((c) => c.learnerName === error.learner)?.id;
}
