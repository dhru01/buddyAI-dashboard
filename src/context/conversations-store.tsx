"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { conversations as seedConversations } from "@/lib/mock-data";
import type { Conversation, ConversationNote } from "@/lib/types";

type ConversationsContextValue = {
  conversations: Conversation[];
  getLatestConversationForLearner: (learnerId: string) => Conversation | undefined;
  markConversationReviewed: (conversationId: string) => boolean;
  setConversationFlagged: (conversationId: string, flagged: boolean) => void;
  addNote: (conversationId: string, body: string) => void;
  deleteNote: (conversationId: string, noteId: string) => void;
};

const ConversationsContext = createContext<ConversationsContextValue | null>(null);

function newNoteId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `cnote-${Date.now()}`;
}

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    seedConversations.map((c) => ({ ...c }))
  );

  const getLatestConversationForLearner = useCallback(
    (learnerId: string) => {
      const forLearner = conversations.filter((c) => c.learnerId === learnerId);
      if (forLearner.length === 0) return undefined;
      return [...forLearner].sort((a, b) => b.date.localeCompare(a.date))[0];
    },
    [conversations]
  );

  const markConversationReviewed = useCallback((conversationId: string) => {
    let updated = false;
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;
        if (c.reviewed) return c;
        updated = true;
        return { ...c, reviewed: true };
      })
    );
    return updated;
  }, []);

  const setConversationFlagged = useCallback((conversationId: string, flagged: boolean) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, flagged } : c))
    );
  }, []);

  const addNote = useCallback((conversationId: string, body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const note: ConversationNote = {
      id: newNoteId(),
      body: trimmed,
      createdAt: new Date().toISOString()
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, staffNotes: [...(c.staffNotes ?? []), note] }
          : c
      )
    );
  }, []);

  const deleteNote = useCallback((conversationId: string, noteId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;
        const next = (c.staffNotes ?? []).filter((n) => n.id !== noteId);
        return { ...c, staffNotes: next.length > 0 ? next : undefined };
      })
    );
  }, []);

  const value = useMemo(
    () => ({
      conversations,
      getLatestConversationForLearner,
      markConversationReviewed,
      setConversationFlagged,
      addNote,
      deleteNote
    }),
    [
      conversations,
      getLatestConversationForLearner,
      markConversationReviewed,
      setConversationFlagged,
      addNote,
      deleteNote
    ]
  );

  return <ConversationsContext.Provider value={value}>{children}</ConversationsContext.Provider>;
}

export function useConversations() {
  const ctx = useContext(ConversationsContext);
  if (!ctx) {
    throw new Error("useConversations must be used within ConversationsProvider");
  }
  return ctx;
}
