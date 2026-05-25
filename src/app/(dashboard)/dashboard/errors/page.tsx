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

  const openIssues = errorLogs.filter((e) => e.status === "new" || e.status === "in review");

  const reviewConversation = useMemo(
    () =>
      reviewConversationId
        ? conversations.find((c) => c.id === reviewConversationId)
        : undefined,
    [conversations, reviewConversationId]
  );

  const openConversationReview = (error: ErrorLog) => {
    const conversationId = resolveConversationIdForError(error, conversations);
    if (conversationId) setReviewConversationId(conversationId);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Error and Fallback Monitor</h2>
      <DataTable
        title="Issues Queue"
        leftColumns={[0]}
        centerColumns={[1, 2, 3, 4, 5, 6]}
        columnWidths={[
          "w-[13%]",
          "w-[9%]",
          "w-[12%]",
          "w-[18%]",
          "w-[8%]",
          "w-[12%]",
          "w-[20%]",
          "w-[14%]"
        ]}
        headers={[
          "Learner",
          "Date/Time",
          "Error Type",
          "Snippet",
          "Status",
          "Assigned Staff",
          "Internal Notes",
          "Actions"
        ]}
        rows={openIssues.map((e) => {
          const conversationId = resolveConversationIdForError(e, conversations);
          const isReviewing = conversationId != null && conversationId === reviewConversationId;

          return [
            e.learner,
            <ErrorLogDateTimeCell key={`${e.id}-datetime`} timestamp={e.timestamp} />,
            e.errorType,
            e.snippet,
            <StatusBadge key={e.id} status={e.status} />,
            <AssignedStaffSelect
              key={`${e.id}-staff`}
              value={e.assignedStaff}
              onChange={(staff) => assignStaff(e.id, staff)}
            />,
            formatErrorLogInternalNotes(e.internalNotes),
            <div key={`${e.id}-actions`} className="flex justify-center gap-2">
              <Button
                type="button"
                variant={isReviewing ? "default" : "outline"}
                onClick={() => openConversationReview(e)}
                disabled={!conversationId}
              >
                {isReviewing ? "Reviewing" : "Review"}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (isReviewing) setReviewConversationId(null);
                  resolveErrorLog(e.id);
                }}
              >
                Resolve
              </Button>
            </div>
          ];
        })}
      />

      {reviewConversationId && reviewConversation ? (
        <Card className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold">
              Conversation — {reviewConversation.learnerName}
            </h3>
            <Button type="button" variant="outline" onClick={() => setReviewConversationId(null)}>
              Close
            </Button>
          </div>
          <ConversationThreadView conversationId={reviewConversationId} />
        </Card>
      ) : null}
    </div>
  );
}
