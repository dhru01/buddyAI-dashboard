import type { LearnerReport } from "@/lib/learner-report";
import { generateLearnerReportPdf } from "@/lib/learner-report-pdf";

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Could not encode PDF."));
        return;
      }

      const base64 = reader.result.includes(",")
        ? reader.result.split(",")[1] ?? ""
        : reader.result;

      if (!base64) {
        reject(new Error("Could not encode PDF."));
        return;
      }

      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Could not encode PDF."));
    reader.readAsDataURL(blob);
  });
}

export async function emailLearnerReportPdf(input: {
  to: string;
  report: LearnerReport;
  message?: string;
}): Promise<void> {
  const pdfBlob = await generateLearnerReportPdf(input.report);
  const pdfBase64 = await blobToBase64(pdfBlob);

  const response = await fetch("/api/send-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: input.to.trim(),
      pdfBase64,
      message: input.message,
      learnerName: input.report.learner.name
    })
  });

  const data = (await response.json().catch(() => null)) as { error?: string } | null;

  if (!response.ok) {
    throw new Error(data?.error ?? "Failed to send email.");
  }
}
