"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { learners as seedLearners } from "@/lib/mock-data";
import type { Learner } from "@/lib/types";

type LearnersContextValue = {
  learners: Learner[];
  updateLearner: (id: string, next: Learner) => void;
};

const LearnersContext = createContext<LearnersContextValue | null>(null);

export function LearnersProvider({ children }: { children: ReactNode }) {
  const [learners, setLearners] = useState<Learner[]>(() => seedLearners.map((l) => ({ ...l })));

  const updateLearner = useCallback((id: string, next: Learner) => {
    setLearners((prev) => prev.map((l) => (l.id === id ? next : l)));
  }, []);

  const value = useMemo(() => ({ learners, updateLearner }), [learners, updateLearner]);

  return <LearnersContext.Provider value={value}>{children}</LearnersContext.Provider>;
}

export function useLearners() {
  const ctx = useContext(LearnersContext);
  if (!ctx) {
    throw new Error("useLearners must be used within LearnersProvider");
  }
  return ctx;
}
