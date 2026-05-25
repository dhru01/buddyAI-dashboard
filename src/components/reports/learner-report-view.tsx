"use client";

import { format, parseISO } from "date-fns";
import { LearnerAvatar } from "@/components/learners/learner-avatar";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import type { LearnerReport } from "@/lib/learner-report";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-foreground/60">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm">
      <span className="font-medium">{label}:</span> {value}
    </p>
  );
}

export function LearnerReportView({ report }: { report: LearnerReport }) {
  const { learner, analytics } = report;
  const generatedLabel = (() => {
    try {
      return format(parseISO(report.generatedAt), "d MMM yyyy 'at' h:mm a");
    } catch {
      return report.generatedAt;
    }
  })();

  return (
    <Card id="learner-report" className="overflow-hidden p-0">
      <div className="border-b border-border bg-muted/20 px-6 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-foreground/60">
          Learner progress report
        </p>
        <p className="text-sm text-foreground/70">Generated {generatedLabel}</p>
      </div>

      <div className="flex flex-col gap-6 p-6 md:flex-row md:items-start">
        <LearnerAvatar
          name={learner.name}
          learnerId={learner.id}
          avatarUrl={learner.avatarUrl}
          size={140}
          className="shrink-0"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-2xl font-semibold">{learner.name}</h3>
          <p className="text-sm text-foreground/70">
            {learner.grade} · {learner.school}
          </p>
          <StatusBadge status={learner.status} layout="inline" />
        </div>
      </div>

      <div className="space-y-6 border-t border-border px-6 py-6">
        <section>
          <h4 className="mb-3 text-base font-semibold">Profile details</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            <DetailRow label="Curriculum" value={learner.curriculum} />
            <DetailRow label="Preferred language" value={learner.preferredLanguage} />
            <DetailRow label="Subjects" value={report.subjectsDisplay} />
            <DetailRow label="Last active" value={report.lastActiveDisplay} />
            <DetailRow label="Buddy badge" value={report.badgeTier} />
            <DetailRow label="Buddy points" value={String(learner.buddyPoints)} />
          </div>
        </section>

        <section>
          <h4 className="mb-3 text-base font-semibold">Analytics</h4>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Questions asked" value={learner.totalQuestionsAsked} />
            <StatCard label="Current streak" value={`${learner.currentStreak} days`} />
            <StatCard label="Conversations" value={analytics.totalConversations} />
            <StatCard label="Reviewed chats" value={analytics.reviewedConversations} />
            <StatCard label="Flagged chats" value={analytics.flaggedConversations} />
            <StatCard label="Fallback responses" value={analytics.fallbackConversations} />
            <StatCard label="Buddy points" value={learner.buddyPoints} />
            <StatCard label="Support notes" value={learner.supportNotes?.length ?? 0} />
          </div>
          {analytics.topSubjects.length > 0 ? (
            <p className="mt-3 text-sm text-foreground/70">
              Most discussed subjects:{" "}
              {analytics.topSubjects.map((s) => `${s.subject} (${s.count})`).join(", ")}
            </p>
          ) : null}
        </section>

        <section>
          <h4 className="mb-3 text-base font-semibold">Strengths & weaknesses</h4>
          <p className="text-sm leading-relaxed text-foreground/90">
            {report.strengthsWeaknesses}
          </p>
        </section>
      </div>
    </Card>
  );
}
