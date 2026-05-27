"use client";

import { useMemo, useState } from "react";
import { useConversations } from "@/context/conversations-store";
import { useErrorLogs } from "@/context/error-logs-store";
import { ConversationThreadView } from "@/components/conversations/conversation-thread-view";
import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AssignedStaffSelect } from "@/components/errors/assigned-staff-select";
import { ErrorLogDateTimeCell } from "@/components/errors/error-log-date-time-cell";
import { formatErrorLogInternalNotes } from "@/lib/error-log-display";
import { resolveConversationIdForError } from "@/lib/resolve-conversation-for-error";
import type { ErrorLog } from "@/lib/types";

export default function ErrorsPage() {
  const { conversations } = useConversations();
  const { errorLogs, resolveErrorLog, assignStaff } = useErrorLogs();
  const [reviewConversationId, setReviewConversationId] = useState<string | null>(null);

  const openIssues = errorLogs.filter(
    (error) => error.status === "new" || error.status === "in review"
  );

  const reviewConversation = useMemo(() => {
    if (!reviewConversationId) return undefined;

    return conversations.find(
      (conversation) => conversation.id === reviewConversationId
    );
  }, [conversations, reviewConversationId]);

  const openConversationReview = (error: ErrorLog) => {
    const conversationId = resolveConversationIdForError(error, conversations);

    if (conversationId) {
      setReviewConversationId(conversationId);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Error and Fallback Monitor</h2>

      <DataTable
        title="Issues Queue"
        leftColumns={[0]}
        centerColumns={[1, 2, 3, 4, 5, 6]}
        headers={[
          "Learner",
          "Date/Time",
          "Error Type",
          "Snippet",
          "Status",
          "Assigned Staff",
          "Internal Notes",
          "Actions",
        ]}
        rows={openIssues.map((error) => {
          const conversationId = resolveConversationIdForError(
            error,
            conversations
          );

          const isReviewing =
            conversationId !== null && conversationId === reviewConversationId;

          return [
            error.learner,
            <ErrorLogDateTimeCell
              key={`${error.id}-datetime`}
              timestamp={error.timestamp}
            />,
            error.errorType,
            error.snippet,
            <StatusBadge key={`${error.id}-status`} status={error.status} />,
            <AssignedStaffSelect
              key={`${error.id}-staff`}
              value={error.assignedStaffId}
              onChange={(staffMemberId) => assignStaff(error.id, staffMemberId)}
            />,
            formatErrorLogInternalNotes(error.internalNotes),
            <div key={`${error.id}-actions`} className="flex justify-center gap-2">
              <Button
                type="button"
                variant={isReviewing ? "default" : "outline"}
                onClick={() => openConversationReview(error)}
                disabled={!conversationId}
              >
                {isReviewing ? "Reviewing" : "Review"}
              </Button>

              <Button
                type="button"
                onClick={() => {
                  if (isReviewing) {
                    setReviewConversationId(null);
                  }

                  resolveErrorLog(error.id);
                }}
              >
                Resolve
              </Button>
            </div>,
          ];
        })}
      />

      {reviewConversationId && reviewConversation ? (
        <Card className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold">
              Conversation — {reviewConversation.learnerName}
            </h3>

            <Button
              type="button"
              variant="outline"
              onClick={() => setReviewConversationId(null)}
            >
              Close
            </Button>
          </div>

          <ConversationThreadView conversationId={reviewConversationId} />
        </Card>
      ) : null}
    </div>
  );
}