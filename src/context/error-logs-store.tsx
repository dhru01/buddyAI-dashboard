"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { format } from "date-fns";
import { errorLogs as seedErrorLogs } from "@/lib/mock-data";
import { UNASSIGNED_STAFF } from "@/lib/issue-queue-staff";
import type { Conversation, ErrorLog } from "@/lib/types";

type ErrorLogsContextValue = {
  errorLogs: ErrorLog[];
  isConversationFlagged: (conversationId: string) => boolean;
  flagConversation: (conversation: Conversation) => boolean;
  unflagConversation: (conversationId: string) => boolean;
  resolveErrorLog: (errorLogId: string) => void;
  assignStaff: (errorLogId: string, staff: string) => void;
};

const ErrorLogsContext = createContext<ErrorLogsContextValue | null>(null);

function newErrorId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `e-${Date.now()}`;
}

/** Stored as YYYY-MM-DD HH:mm at the moment the conversation is flagged. */
function flaggedAtTimestamp(): string {
  return format(new Date(), "yyyy-MM-dd HH:mm");
}

function buildErrorFromConversation(conversation: Conversation): ErrorLog {
  return {
    id: newErrorId(),
    conversationId: conversation.id,
    learner: conversation.learnerName,
    timestamp: flaggedAtTimestamp(),
    errorType: conversation.fallback ? "Fallback response" : "Flagged conversation",
    snippet: conversation.snippet,
    status: "new",
    assignedStaff: UNASSIGNED_STAFF,
    internalNotes: "Flagged from Conversation Viewer."
  };
}

export function ErrorLogsProvider({ children }: { children: ReactNode }) {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>(() =>
    seedErrorLogs.map((e) => ({ ...e }))
  );

  const isConversationFlagged = useCallback(
    (conversationId: string) =>
      errorLogs.some(
        (e) =>
          e.conversationId === conversationId &&
          (e.status === "new" || e.status === "in review")
      ),
    [errorLogs]
  );

  const flagConversation = useCallback((conversation: Conversation) => {
    let added = false;
    setErrorLogs((prev) => {
      const alreadyQueued = prev.some(
        (e) =>
          e.conversationId === conversation.id &&
          (e.status === "new" || e.status === "in review")
      );
      if (alreadyQueued) return prev;
      added = true;
      return [buildErrorFromConversation(conversation), ...prev];
    });
    return added;
  }, []);

  const unflagConversation = useCallback((conversationId: string) => {
    let removed = false;
    setErrorLogs((prev) => {
      const next = prev.filter((e) => e.conversationId !== conversationId);
      removed = next.length < prev.length;
      return next;
    });
    return removed;
  }, []);

  const resolveErrorLog = useCallback((errorLogId: string) => {
    setErrorLogs((prev) => prev.filter((e) => e.id !== errorLogId));
  }, []);

  const assignStaff = useCallback((errorLogId: string, staff: string) => {
    setErrorLogs((prev) =>
      prev.map((e) => (e.id === errorLogId ? { ...e, assignedStaff: staff } : e))
    );
  }, []);

  const value = useMemo(
    () => ({
      errorLogs,
      isConversationFlagged,
      flagConversation,
      unflagConversation,
      resolveErrorLog,
      assignStaff
    }),
    [errorLogs, isConversationFlagged, flagConversation, unflagConversation, resolveErrorLog, assignStaff]
  );

  return <ErrorLogsContext.Provider value={value}>{children}</ErrorLogsContext.Provider>;
}

export function useErrorLogs() {
  const ctx = useContext(ErrorLogsContext);
  if (!ctx) {
    throw new Error("useErrorLogs must be used within ErrorLogsProvider");
  }
  return ctx;
}
