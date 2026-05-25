"use client";

import { useMemo, useState } from "react";
import { LearnerSearchDialog } from "@/components/manual-controls/learner-search-dialog";
import { EmailReportDialog } from "@/components/reports/email-report-dialog";
import { LearnerReportView } from "@/components/reports/learner-report-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useConversations } from "@/context/conversations-store";
import { useLearners } from "@/context/learners-store";
import { buildLearnerReport, type LearnerReport } from "@/lib/learner-report";
import { downloadLearnerReportPdf } from "@/lib/learner-report-pdf";
import type { Learner } from "@/lib/types";
import { toast } from "sonner";

export default function GenerateReportPage() {
  const { learners } = useLearners();
  const { conversations } = useConversations();
  const [selectedLearnerId, setSelectedLearnerId] = useState(() => learners[0]?.id ?? "");
  const [searchOpen, setSearchOpen] = useState(false);
  const [report, setReport] = useState<LearnerReport | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const selectedLearner = useMemo(
    () => learners.find((l) => l.id === selectedLearnerId),
    [learners, selectedLearnerId]
  );

  const handleSelectLearner = (learner: Learner) => {
    setSelectedLearnerId(learner.id);
    setReport(null);
    toast.success(`Selected ${learner.name}.`);
  };

  const generateReport = () => {
    if (!selectedLearner) {
      toast.error("Select a learner first.");
      return;
    }
    setReport(buildLearnerReport(selectedLearner, conversations));
    toast.success("Report generated.");
  };

  const downloadReport = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      await downloadLearnerReportPdf(report);
      toast.success("Report downloaded.");
    } catch {
      toast.error("Could not download the report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Generate Report</h2>

      <Card className="space-y-3">
        <p className="text-sm text-foreground/80">
          Choose a learner to build a progress report with their profile, usage analytics, and a
          summary of strengths and weaknesses.
        </p>
        {selectedLearner ? (
          <p className="text-sm text-foreground/70">
            Selected learner:{" "}
            <span className="font-medium text-foreground">{selectedLearner.name}</span>
          </p>
        ) : (
          <p className="text-sm text-foreground/60">No learner selected.</p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setSearchOpen(true)}>
            Choose learner
          </Button>
          <Button type="button" onClick={generateReport} disabled={!selectedLearner}>
            Generate report
          </Button>
          {report ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={downloadReport}
                disabled={downloading}
              >
                {downloading ? "Downloading…" : "Download report"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEmailOpen(true)}>
                Email PDF report
              </Button>
            </>
          ) : null}
        </div>
      </Card>

      <LearnerSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelect={handleSelectLearner}
      />

      {report ? (
        <>
          <LearnerReportView report={report} />
          <EmailReportDialog report={report} open={emailOpen} onOpenChange={setEmailOpen} />
        </>
      ) : null}
    </div>
  );
}
