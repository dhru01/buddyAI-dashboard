"use client";

import { useMemo, useState } from "react";
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
import type { Learner } from "@/lib/types";

type LearnerSearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (learner: Learner) => void;
};

export function LearnerSearchDialog({ open, onOpenChange, onSelect }: LearnerSearchDialogProps) {
  const { learners } = useLearners();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return learners;
    return learners.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q) ||
        l.school.toLowerCase().includes(q)
    );
  }, [learners, query]);

  const handleSelect = (learner: Learner) => {
    onSelect(learner);
    setQuery("");
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setQuery("");
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Search learner</DialogTitle>
          <DialogDescription>Find a learner by name, ID, or school.</DialogDescription>
        </DialogHeader>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name…"
          autoFocus
          aria-label="Search learners"
        />
        <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="px-2 py-3 text-sm text-foreground/60">No learners match your search.</li>
          ) : (
            filtered.map((learner) => (
              <li key={learner.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(learner)}
                  className="flex w-full flex-col rounded-xl px-3 py-2 text-left text-sm transition hover:bg-muted"
                >
                  <span className="font-medium">{learner.name}</span>
                  <span className="text-xs text-foreground/60">
                    {learner.grade} · {learner.school}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="mt-4 flex justify-end">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
