"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { LearnerAvatar } from "@/components/learners/learner-avatar";
import { useLearners } from "@/context/learners-store";
import { formatSubjectsAbbreviated } from "@/lib/subject-abbrev";
import { getBuddyTierLabel } from "@/lib/buddy-badges";
import { buildProfileDraft, LEARNER_STATUS_OPTIONS } from "@/lib/learner-profile-draft";
import { mergeProfileDraftIntoLearner, type ProfileDraft } from "@/lib/learner-profile-merge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/badge";
import type { Learner, LearnerStatus, LearnerSupportNote } from "@/lib/types";
import { Trash2 } from "lucide-react";

function newNoteId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `note-${Date.now()}`;
}

function formatNoteWhen(iso: string): string {
  try {
    return format(parseISO(iso), "d MMM yyyy 'at' h:mm a");
  } catch {
    return iso;
  }
}

function subjectsDisplay(line: string): string {
  const parts = line
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return line;
  return formatSubjectsAbbreviated(parts);
}

function FieldRow({
  label,
  editing,
  value,
  onChange,
  displayValue
}: {
  label: string;
  editing: boolean;
  value: string;
  onChange: (v: string) => void;
  /** Shown when not editing (e.g. formatted subjects). */
  displayValue: string;
}) {
  return (
    <p className="grid min-w-0 grid-cols-[max-content_minmax(0,1fr)] items-center gap-x-1.5 md:min-h-0">
      <strong className="shrink-0">{label}:</strong>
      {editing ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full min-w-0 font-normal"
        />
      ) : (
        <span className="min-w-0 break-words font-normal">{displayValue}</span>
      )}
    </p>
  );
}

export function LearnerProfileClient({ learner }: { learner: Learner }) {
  const { updateLearner } = useLearners();
  const [committed, setCommitted] = useState<ProfileDraft>(() => buildProfileDraft(learner));
  const [draft, setDraft] = useState<ProfileDraft>(() => buildProfileDraft(learner));
  const [editing, setEditing] = useState(false);
  const [supportNoteOpen, setSupportNoteOpen] = useState(false);
  const [supportNoteDraft, setSupportNoteDraft] = useState("");

  useEffect(() => {
    const d = buildProfileDraft(learner);
    setCommitted(d);
    setDraft(d);
    setEditing(false);
  }, [learner]);

  const profilePhotoPx = 200;
  const displayName = editing ? draft.name : committed.name;

  const patch = (key: keyof ProfileDraft, v: string) =>
    setDraft((prev) => ({ ...prev, [key]: v }));

  const startEdit = () => {
    setDraft(committed);
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(committed);
    setEditing(false);
  };

  const saveEdit = () => {
    const next = mergeProfileDraftIntoLearner(learner, draft);
    updateLearner(learner.id, next);
    setCommitted(buildProfileDraft(next));
    setDraft(buildProfileDraft(next));
    setEditing(false);
  };

  const saveSupportNote = () => {
    const body = supportNoteDraft.trim();
    if (!body) return;
    const note: LearnerSupportNote = {
      id: newNoteId(),
      body,
      createdAt: new Date().toISOString()
    };
    updateLearner(learner.id, {
      ...learner,
      supportNotes: [...(learner.supportNotes ?? []), note]
    });
    setSupportNoteDraft("");
    setSupportNoteOpen(false);
  };

  const deleteSupportNote = (noteId: string) => {
    const next = (learner.supportNotes ?? []).filter((x) => x.id !== noteId);
    updateLearner(learner.id, {
      ...learner,
      supportNotes: next.length > 0 ? next : undefined
    });
  };

  const onSupportDialogOpenChange = (open: boolean) => {
    setSupportNoteOpen(open);
    if (!open) setSupportNoteDraft("");
  };

  const parseBuddyPoints = (s: string) => {
    const n = Number.parseInt(s, 10);
    return Number.isFinite(n) ? n : 0;
  };

  return (
    <div className="space-y-4">
      {editing ? (
        <Input
          value={draft.name}
          onChange={(e) => patch("name", e.target.value)}
          className="ml-6 h-11 w-full max-w-2xl text-2xl font-semibold"
          aria-label="Learner name"
        />
      ) : (
        <h2 className="pl-6 text-2xl font-semibold">{committed.name}</h2>
      )}

      <Card className="flex flex-col gap-8 p-6 md:flex-row md:items-stretch md:gap-10">
        <div className="flex shrink-0 items-start justify-center md:justify-start">
          <LearnerAvatar
            name={displayName}
            learnerId={learner.id}
            avatarUrl={learner.avatarUrl}
            size={profilePhotoPx}
            className="justify-center md:justify-start"
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-6 text-sm leading-snug md:grid md:h-full md:min-h-[200px] md:grid-cols-2 md:grid-rows-[repeat(7,minmax(0,1fr))] md:gap-x-10 md:gap-y-0">
          <div className="flex min-w-0 flex-col gap-1.5 md:row-span-7 md:grid md:grid-rows-subgrid md:gap-0">
            <FieldRow
              label="Grade"
              editing={editing}
              value={draft.grade}
              onChange={(v) => patch("grade", v)}
              displayValue={committed.grade}
            />
            <FieldRow
              label="School"
              editing={editing}
              value={draft.school}
              onChange={(v) => patch("school", v)}
              displayValue={committed.school}
            />
            <FieldRow
              label="Curriculum"
              editing={editing}
              value={draft.curriculum}
              onChange={(v) => patch("curriculum", v)}
              displayValue={committed.curriculum}
            />
            <FieldRow
              label="Language"
              editing={editing}
              value={draft.preferredLanguage}
              onChange={(v) => patch("preferredLanguage", v)}
              displayValue={committed.preferredLanguage}
            />
            <FieldRow
              label="Subjects"
              editing={editing}
              value={draft.subjectsLine}
              onChange={(v) => patch("subjectsLine", v)}
              displayValue={subjectsDisplay(committed.subjectsLine)}
            />
            <FieldRow
              label="Consent"
              editing={editing}
              value={draft.consent}
              onChange={(v) => patch("consent", v)}
              displayValue={committed.consent}
            />
            <p className="grid min-w-0 grid-cols-[max-content_minmax(0,1fr)] items-center gap-x-1.5 md:min-h-0">
              <strong className="shrink-0">Status:</strong>
              {editing ? (
                <select
                  value={draft.status}
                  onChange={(e) => patch("status", e.target.value as LearnerStatus)}
                  className="h-9 w-full min-w-0 rounded-xl border border-border bg-card px-3 text-sm font-normal text-foreground outline-none focus:border-primary"
                >
                  {LEARNER_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s === "needs support" ? "Needs support" : s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="min-w-0">
                  <StatusBadge status={committed.status} layout="inline" />
                </span>
              )}
            </p>
          </div>
          <div className="flex min-w-0 flex-col gap-1.5 md:row-span-7 md:grid md:grid-rows-subgrid md:gap-0">
            <FieldRow
              label="Buddy Points"
              editing={editing}
              value={draft.buddyPoints}
              onChange={(v) => patch("buddyPoints", v.replace(/[^\d]/g, ""))}
              displayValue={committed.buddyPoints}
            />
            <p className="grid min-w-0 grid-cols-[max-content_minmax(0,1fr)] items-center gap-x-1.5 md:min-h-0">
              <strong className="shrink-0">Badges:</strong>
              <span className="min-w-0 break-words font-normal">
                {getBuddyTierLabel(parseBuddyPoints(editing ? draft.buddyPoints : committed.buddyPoints))}
              </span>
            </p>
            <FieldRow
              label="Current Streak"
              editing={editing}
              value={draft.streakLabel}
              onChange={(v) => patch("streakLabel", v)}
              displayValue={committed.streakLabel}
            />
            <FieldRow
              label="Strong Topics"
              editing={editing}
              value={draft.strongTopics}
              onChange={(v) => patch("strongTopics", v)}
              displayValue={committed.strongTopics}
            />
            <FieldRow
              label="Weak Topics"
              editing={editing}
              value={draft.weakTopics}
              onChange={(v) => patch("weakTopics", v)}
              displayValue={committed.weakTopics}
            />
          </div>
        </div>
      </Card>

      <Card className="flex flex-wrap gap-2">
        {editing ? (
          <>
            <Button type="button" onClick={saveEdit}>
              Save
            </Button>
            <Button type="button" variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
          </>
        ) : (
          <Button type="button" onClick={startEdit}>
            Edit Profile
          </Button>
        )}
        <Button type="button" variant="default" onClick={() => setSupportNoteOpen(true)}>
          Add Note
        </Button>
      </Card>

      <Dialog open={supportNoteOpen} onOpenChange={onSupportDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add support note</DialogTitle>
            <DialogDescription>
              This note is stored with the learner profile for your team. It is not visible to the learner.
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
            <Button type="button" variant="outline" onClick={() => onSupportDialogOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveSupportNote} disabled={!supportNoteDraft.trim()}>
              Save note
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {(learner.supportNotes?.length ?? 0) > 0 ? (
        <Card className="space-y-3 p-6">
          <h3 className="text-base font-semibold">Support notes</h3>
          <ul className="space-y-4">
            {[...(learner.supportNotes ?? [])]
              .slice()
              .reverse()
              .map((n) => (
                <li key={n.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-foreground/60">{formatNoteWhen(n.createdAt)}</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{n.body}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteSupportNote(n.id)}
                      className="shrink-0 rounded-xl border border-border bg-white p-2 text-foreground/60 transition hover:bg-muted hover:text-foreground"
                      aria-label="Delete note"
                      title="Delete note"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
