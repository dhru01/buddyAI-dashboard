import type { LearnerReport } from "@/lib/learner-report";
import { generateLearnerReportPdf, learnerReportPdfFilename } from "@/lib/learner-report-pdf";

export async function emailLearnerReportPdf(input: {
  to: string;
  report: LearnerReport;
  message?: string;
}): Promise<{ status: string; filename: string }> {
  const pdfBlob = await generateLearnerReportPdf(input.report);
  const filename = learnerReportPdfFilename(input.report);

  // Phase 2 placeholder — wire to backend email service (e.g. Resend, SendGrid) with PDF attachment.
  // 1) Validate admin permissions and recipient.
  // 2) Upload PDF to secure storage or attach via provider API.
  // 3) Audit-log delivery for POPIA traceability.
  await Promise.resolve({
    status: "queued-placeholder",
    to: input.to,
    learnerId: input.report.learner.id,
    filename,
    message: input.message?.trim() || undefined,
    sizeBytes: pdfBlob.size
  });

  return { status: "queued-placeholder", filename };
}
