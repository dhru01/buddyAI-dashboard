"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { emailLearnerReportPdf } from "@/lib/learner-report-email";
import type { LearnerReport } from "@/lib/learner-report";
import { toast } from "sonner";

type EmailReportDialogProps = {
  report: LearnerReport;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function EmailReportDialog({ report, open, onOpenChange }: EmailReportDialogProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next && !sending) {
      setEmail("");
      setMessage("");
    }
    onOpenChange(next);
  };

  const send = async () => {
    const to = email.trim();
    if (!isValidEmail(to)) {
      toast.error("Enter a valid email address.");
      return;
    }
    setSending(true);
    try {
      await emailLearnerReportPdf({
        to,
        report,
        message: message.trim() || undefined
      });
      toast.success(`PDF report sent to ${to}`);
      handleOpenChange(false);
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : "Could not send the report email. Please try again.";
      toast.error(messageText);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Email PDF report</DialogTitle>
          <DialogDescription>
            Send the formatted progress report for {report.learner.name} as a PDF attachment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="report-email-to" className="text-sm font-medium">
              Recipient email
            </label>
            <Input
              id="report-email-to"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="parent@example.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="report-email-message" className="text-sm font-medium">
              Message (optional)
            </label>
            <textarea
              id="report-email-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a short note to include in the email…"
              rows={3}
              className="w-full resize-y rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button type="button" onClick={send} disabled={sending || !email.trim()}>
            {sending ? "Sending…" : "Send PDF"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
