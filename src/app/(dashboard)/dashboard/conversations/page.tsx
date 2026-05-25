"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Trash2 } from "lucide-react";
import { DatePeriodSelect } from "@/components/conversations/date-period-select";
import { useConversations } from "@/context/conversations-store";
import { useErrorLogs } from "@/context/error-logs-store";
import { messages } from "@/lib/mock-data";
import { filterConversations, type ConversationDatePeriod } from "@/lib/conversation-filters";
import { formatLastActiveDisplay, formatNoteTimestamp } from "@/lib/date-display";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/types";

function ConversationsPageContent() {
  const searchParams = useSearchParams();
  const conversationFromQuery = searchParams.get("conversation");
  const { conversations, addNote, deleteNote } = useConversations();
  const { flagConversation, unflagConversation, isConversationFlagged } = useErrorLogs();
  const [selectedId, setSelectedId] = useState(conversations[0]?.id ?? "");
  const [flagFeedback, setFlagFeedback] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [learnerQuery, setLearnerQuery] = useState("");
  const [datePeriod, setDatePeriod] = useState<ConversationDatePeriod>("");
  const [subjectQuery, setSubjectQuery] = useState("");
  const [languageQuery, setLanguageQuery] = useState("");

  const filteredConversations = useMemo(
    () =>
      filterConversations(conversations, {
        learnerQuery,
        datePeriod,
        subjectQuery,
        languageQuery
      }),
    [conversations, learnerQuery, datePeriod, subjectQuery, languageQuery]
  );

  useEffect(() => {
    if (!conversationFromQuery) return;
    const exists = conversations.some((c) => c.id === conversationFromQuery);
    if (!exists) return;
    setSelectedId(conversationFromQuery);
    setLearnerQuery("");
    setDatePeriod("");
    setSubjectQuery("");
    setLanguageQuery("");
  }, [conversationFromQuery, conversations]);

  useEffect(() => {
    if (filteredConversations.length === 0) {
      setSelectedId("");
      return;
    }
    if (!filteredConversations.some((c) => c.id === selectedId)) {
      setSelectedId(filteredConversations[0].id);
    }
  }, [filteredConversations, selectedId]);

  const activeConversation = useMemo(
    () => filteredConversations.find((c) => c.id === selectedId) ?? filteredConversations[0],
    [filteredConversations, selectedId]
  );

  const thread = useMemo(
    () =>
      activeConversation
        ? messages.filter((m) => m.conversationId === activeConversation.id)
        : [],
    [activeConversation]
  );

  const isFlagged = activeConversation ? isConversationFlagged(activeConversation.id) : false;

  const showFlagFeedback = (message: string) => {
    setFlagFeedback(message);
    window.setTimeout(() => setFlagFeedback(null), 4000);
  };

  const handleToggleFlag = () => {
    if (!activeConversation) return;
    if (isFlagged) {
      const removed = unflagConversation(activeConversation.id);
      showFlagFeedback(
        removed
          ? "Removed from Error and Fallback Monitor."
          : "This conversation is not in the issues queue."
      );
    } else {
      const added = flagConversation(activeConversation);
      showFlagFeedback(
        added
          ? "Added to Error and Fallback Monitor as a new issue."
          : "This conversation is already in the issues queue."
      );
    }
  };

  const saveNote = () => {
    if (!activeConversation) return;
    const body = noteDraft.trim();
    if (!body) return;
    addNote(activeConversation.id, body);
    setNoteDraft("");
    setNoteOpen(false);
  };

  const onNoteDialogOpenChange = (open: boolean) => {
    setNoteOpen(open);
    if (!open) setNoteDraft("");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Conversation Viewer</h2>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        <Input
          aria-label="Search learner"
          placeholder="Search learner"
          value={learnerQuery}
          onChange={(e) => setLearnerQuery(e.target.value)}
        />
        <DatePeriodSelect value={datePeriod} onChange={setDatePeriod} />
        <Input
          aria-label="Filter by subject"
          placeholder="Subject"
          value={subjectQuery}
          onChange={(e) => setSubjectQuery(e.target.value)}
        />
        <Input
          aria-label="Filter by language"
          placeholder="Language"
          value={languageQuery}
          onChange={(e) => setLanguageQuery(e.target.value)}
        />
      </div>
      <div className="grid items-stretch gap-4 xl:grid-cols-3">
        <Card className="space-y-3">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((c) => (
              <ConversationListItem
                key={c.id}
                conversation={c}
                selected={c.id === activeConversation?.id}
                flagged={isConversationFlagged(c.id)}
                onSelect={() => setSelectedId(c.id)}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500">No conversations match your filters.</p>
          )}
        </Card>
        <Card className="flex min-h-[28rem] flex-col xl:col-span-2">
          {activeConversation ? (
            <>
              <div className="flex min-h-0 flex-1 flex-col">
                <p className="mb-4 shrink-0 text-sm text-gray-500">
                  {activeConversation.subject} • {activeConversation.language}
                </p>
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                  {thread.length > 0 ? (
                    thread.map((m) => (
                      <div
                        key={m.id}
                        className={cn(
                          "max-w-xl rounded-2xl p-3 text-sm",
                          m.sender === "learner"
                            ? "mr-auto bg-muted"
                            : "ml-auto bg-primary text-black"
                        )}
                      >
                        <p>{m.content}</p>
                        {m.metadata && (
                          <p className="mt-2 text-xs">
                            Topic: {m.metadata.topic} | Difficulty: {m.metadata.difficulty} |
                            Confidence: {m.metadata.confidence}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No messages in this conversation yet.</p>
                  )}
                </div>
                {(activeConversation.staffNotes?.length ?? 0) > 0 ? (
                  <div className="mt-4 shrink-0 border-t border-border pt-4">
                    <h3 className="mb-3 text-sm font-semibold">Conversation notes</h3>
                    <ul className="max-h-40 space-y-3 overflow-y-auto pr-1">
                      {[...(activeConversation.staffNotes ?? [])]
                        .slice()
                        .reverse()
                        .map((n) => (
                          <li
                            key={n.id}
                            className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-foreground/60">
                                {formatNoteTimestamp(n.createdAt)}
                              </p>
                              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                                {n.body}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteNote(activeConversation.id, n.id)}
                              className="shrink-0 rounded-xl border border-border bg-white p-2 text-foreground/60 transition hover:bg-muted hover:text-foreground"
                              aria-label="Delete note"
                              title="Delete note"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden />
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : null}
              </div>
              <div className="mt-auto shrink-0 border-t border-border pt-4">
                {flagFeedback ? (
                  <p className="mb-3 text-sm text-foreground/70" role="status">
                    {flagFeedback}
                  </p>
                ) : null}
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="outline" onClick={handleToggleFlag}>
                    {isFlagged ? "Unflag" : "Flag Conversation"}
                  </Button>
                  <Button type="button" variant="default" onClick={() => setNoteOpen(true)}>
                    Add Note
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">Select a conversation to view messages.</p>
          )}
        </Card>
      </div>

      <Dialog open={noteOpen} onOpenChange={onNoteDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add note</DialogTitle>
            <DialogDescription>
              This note is stored with this conversation for your team. It is not visible to the
              learner.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="Write your note or comment…"
            rows={5}
            className="min-h-[120px] w-full resize-y rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
            aria-label="Conversation note"
          />
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onNoteDialogOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveNote} disabled={!noteDraft.trim()}>
              Save note
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ConversationListItem({
  conversation,
  selected,
  flagged,
  onSelect
}: {
  conversation: Conversation;
  selected: boolean;
  flagged: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border p-3 text-left transition",
        selected
          ? "border-primary bg-primary/10 ring-1 ring-primary/30"
          : "border-border hover:border-primary/40 hover:bg-muted/50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">{conversation.learnerName}</p>
        {flagged ? (
          <span className="shrink-0 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground/70">
            Flagged
          </span>
        ) : null}
      </div>
      <p className="text-xs text-gray-500">
        {conversation.subject} • {conversation.language} •{" "}
        {formatLastActiveDisplay(conversation.date)}
      </p>
      <p className="mt-2 text-sm">{conversation.snippet}</p>
    </button>
  );
}

export default function ConversationsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Conversation Viewer</h2>
          <p className="text-sm text-gray-500">Loading conversations…</p>
        </div>
      }
    >
      <ConversationsPageContent />
    </Suspense>
  );
}
