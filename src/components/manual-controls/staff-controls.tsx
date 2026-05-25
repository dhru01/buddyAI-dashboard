"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { LearnerProfileEditDialog } from "@/components/learners/learner-profile-edit-dialog";
import { LearnerSearchDialog } from "@/components/manual-controls/learner-search-dialog";
import { useConversations } from "@/context/conversations-store";
import { useErrorLogs } from "@/context/error-logs-store";
import { useLearners } from "@/context/learners-store";
import type { Learner, LearnerSupportNote } from "@/lib/types";
import { toast } from "sonner";

type StaffControlsProps = {
  selectedLearnerId: string;
  onSelectLearner: (id: string) => void;
};

function newNoteId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `note-${Date.now()}`;
}

export function StaffControls({ selectedLearnerId, onSelectLearner }: StaffControlsProps) {
  const { learners, updateLearner } = useLearners();
  const { getLatestConversationForLearner, setConversationFlagged } = useConversations();
  const { isConversationFlagged, flagConversation, unflagConversation } = useErrorLogs();

  const [searchOpen, setSearchOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [supportNoteOpen, setSupportNoteOpen] = useState(false);
  const [supportNoteDraft, setSupportNoteDraft] = useState("");

  const learner = useMemo(
    () => learners.find((l) => l.id === selectedLearnerId),
    [learners, selectedLearnerId]
  );

  const latestConversation = useMemo(
    () => (selectedLearnerId ? getLatestConversationForLearner(selectedLearnerId) : undefined),
    [getLatestConversationForLearner, selectedLearnerId]
  );

  const requireLearner = (): Learner | null => {
    if (!learner) {
      toast.error("Select a learner first.");
      return null;
    }
    return learner;
  };

  const handleSelectLearner = (next: Learner) => {
    onSelectLearner(next.id);
    toast.success(`Selected ${next.name}.`);
  };

  const saveSupportNote = () => {
    const current = requireLearner();
    if (!current) return;
    const trimmed = supportNoteDraft.trim();
    if (!trimmed) return;
    const note: LearnerSupportNote = {
      id: newNoteId(),
      body: trimmed,
      createdAt: new Date().toISOString()
    };
    updateLearner(current.id, {
      ...current,
      supportNotes: [...(current.supportNotes ?? []), note]
    });
    setSupportNoteDraft("");
    setSupportNoteOpen(false);
    toast.success("Support note saved.");
  };

  const toggleFlag = () => {
    const current = requireLearner();
    if (!current) return;
    const conversation = latestConversation;
    if (!conversation) {
      toast.error("No conversation found for this learner.");
      return;
    }
    const flagged = isConversationFlagged(conversation.id);
    if (flagged) {
      const removed = unflagConversation(conversation.id);
      if (removed) {
        setConversationFlagged(conversation.id, false);
        toast.success("Learner unflagged.");
      }
    } else {
      const added = flagConversation(conversation);
      if (added) {
        setConversationFlagged(conversation.id, true);
        toast.success("Learner flagged for review.");
      } else {
        toast.message("This conversation is already in the issues queue.");
      }
    }
  };

  const openProfileEdit = () => {
    if (!requireLearner()) return;
    setProfileEditOpen(true);
  };

  return (
    <>
      <Card className="space-y-3">
        <p className="text-sm">
          Staff controls for learner updates, notes, and profile changes.
        </p>
        {learner ? (
          <p className="text-sm text-foreground/70">
            Selected learner: <span className="font-medium text-foreground">{learner.name}</span>
          </p>
        ) : (
          <p className="text-sm text-foreground/60">No learner selected.</p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setSearchOpen(true)}>
            Search learner
          </Button>
          <Button type="button" variant="outline" onClick={openProfileEdit}>
            Edit learner profile
          </Button>
          <Button type="button" variant="outline" onClick={() => setSupportNoteOpen(true)}>
            Add support note
          </Button>
          <Button type="button" variant="outline" onClick={toggleFlag}>
            Flag / unflag learner
          </Button>
        </div>
      </Card>

      <LearnerSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelect={handleSelectLearner}
      />

      <LearnerProfileEditDialog
        learner={learner ?? null}
        open={profileEditOpen}
        onOpenChange={setProfileEditOpen}
      />

      <Dialog open={supportNoteOpen} onOpenChange={setSupportNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add support note</DialogTitle>
            <DialogDescription>
              {learner
                ? `Note for ${learner.name}. Stored on the learner profile; not visible to the learner.`
                : "Select a learner first."}
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={supportNoteDraft}
            onChange={(e) => setSupportNoteDraft(e.target.value)}
            placeholder="Write your note or comment…"
            rows={5}
            className="min-h-[120px] w-full resize-y rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
            aria-label="Support note"
          />
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setSupportNoteOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveSupportNote} disabled={!supportNoteDraft.trim()}>
              Save note
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
