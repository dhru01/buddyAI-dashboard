"use client";

import { useEffect, useState } from "react";
import { LearnerAvatar } from "@/components/learners/learner-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLearners } from "@/context/learners-store";
import { getBuddyTierLabel } from "@/lib/buddy-badges";
import {
  buildProfileDraft,
  LEARNER_STATUS_OPTIONS
} from "@/lib/learner-profile-draft";
import { mergeProfileDraftIntoLearner, type ProfileDraft } from "@/lib/learner-profile-merge";
import type { Learner, LearnerStatus } from "@/lib/types";
import { toast } from "sonner";

type LearnerProfileEditDialogProps = {
  learner: Learner | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function FormField({
  label,
  id,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function LearnerProfileEditDialog({
  learner,
  open,
  onOpenChange
}: LearnerProfileEditDialogProps) {
  const { updateLearner } = useLearners();
  const [draft, setDraft] = useState<ProfileDraft | null>(null);

  useEffect(() => {
    if (open && learner) {
      setDraft(buildProfileDraft(learner));
    }
    if (!open) {
      setDraft(null);
    }
  }, [open, learner]);

  if (!learner) return null;

  const patch = (key: keyof ProfileDraft, value: string) =>
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleOpenChange = (next: boolean) => {
    if (!next) setDraft(null);
    onOpenChange(next);
  };

  const cancel = () => handleOpenChange(false);

  const save = () => {
    if (!draft) return;
    const next = mergeProfileDraftIntoLearner(learner, draft);
    updateLearner(learner.id, next);
    toast.success("Learner profile updated.");
    handleOpenChange(false);
  };

  const buddyPoints = Number.parseInt(draft?.buddyPoints.replace(/\D/g, "") ?? "0", 10) || 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] max-w-2xl flex-col overflow-hidden p-0">
        <div className="shrink-0 border-b border-border px-6 py-4">
          <DialogHeader className="mb-0">
            <DialogTitle>Edit learner profile</DialogTitle>
            <DialogDescription>
              Update profile details for {learner.name}. Changes apply across the dashboard.
            </DialogDescription>
          </DialogHeader>
        </div>

        {draft ? (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
              <div className="flex items-center gap-4">
                <LearnerAvatar
                  name={draft.name}
                  learnerId={learner.id}
                  avatarUrl={learner.avatarUrl}
                  size={72}
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <label htmlFor="profile-name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="profile-name"
                    value={draft.name}
                    onChange={(e) => patch("name", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  label="Grade"
                  id="profile-grade"
                  value={draft.grade}
                  onChange={(v) => patch("grade", v)}
                />
                <FormField
                  label="School"
                  id="profile-school"
                  value={draft.school}
                  onChange={(v) => patch("school", v)}
                />
                <FormField
                  label="Curriculum"
                  id="profile-curriculum"
                  value={draft.curriculum}
                  onChange={(v) => patch("curriculum", v)}
                />
                <FormField
                  label="Language"
                  id="profile-language"
                  value={draft.preferredLanguage}
                  onChange={(v) => patch("preferredLanguage", v)}
                />
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="profile-subjects" className="text-sm font-medium">
                    Subjects
                  </label>
                  <Input
                    id="profile-subjects"
                    value={draft.subjectsLine}
                    onChange={(e) => patch("subjectsLine", e.target.value)}
                    placeholder="Comma-separated, e.g. Maths, Science"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="profile-consent" className="text-sm font-medium">
                    Consent
                  </label>
                  <Input
                    id="profile-consent"
                    value={draft.consent}
                    onChange={(e) => patch("consent", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="profile-status" className="text-sm font-medium">
                    Status
                  </label>
                  <select
                    id="profile-status"
                    value={draft.status}
                    onChange={(e) => patch("status", e.target.value as LearnerStatus)}
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
                  >
                    {LEARNER_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s === "needs support"
                          ? "Needs support"
                          : s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <FormField
                  label="Buddy points"
                  id="profile-points"
                  value={draft.buddyPoints}
                  onChange={(v) => patch("buddyPoints", v.replace(/[^\d]/g, ""))}
                />
                <p className="text-sm text-foreground/70 sm:col-span-2">
                  Badge tier: <span className="font-medium">{getBuddyTierLabel(buddyPoints)}</span>
                </p>
                <FormField
                  label="Current streak"
                  id="profile-streak"
                  value={draft.streakLabel}
                  onChange={(v) => patch("streakLabel", v)}
                />
                <FormField
                  label="Strong topics"
                  id="profile-strong"
                  value={draft.strongTopics}
                  onChange={(v) => patch("strongTopics", v)}
                />
                <FormField
                  label="Weak topics"
                  id="profile-weak"
                  value={draft.weakTopics}
                  onChange={(v) => patch("weakTopics", v)}
                />
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-border px-6 py-4">
              <Button type="button" variant="outline" onClick={cancel}>
                Cancel
              </Button>
              <Button type="button" onClick={save}>
                Save profile
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
