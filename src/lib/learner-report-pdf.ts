import { format, parseISO } from "date-fns";
import { jsPDF } from "jspdf";
import { BUDDY_BRAND_RGB } from "@/lib/buddy-brand";
import type { LearnerReport } from "@/lib/learner-report";

const MARGIN = 18;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 6;
const PDF_FONT = "times";
const TOP_BAR_HEIGHT = 6;

type PdfFontStyle = "normal" | "bold" | "italic" | "bolditalic";

const DEMO_PORTRAIT_PROMPT =
  "Photorealistic headshot portrait, one teenage learner, natural lighting, neutral background, shoulders up, respectful school photo style, DSLR, sharp eyes, realistic skin texture";

function setPdfFont(doc: jsPDF, style: PdfFontStyle, size: number) {
  doc.setFont(PDF_FONT, style);
  doc.setFontSize(size);
}

function portraitUrl(learnerId: string, avatarUrl?: string): string {
  if (avatarUrl) return avatarUrl;
  const prompt = encodeURIComponent(DEMO_PORTRAIT_PROMPT);
  const seed = encodeURIComponent(learnerId);
  return `https://image.pollinations.ai/prompt/${prompt}?width=256&height=256&seed=${seed}&nologo=true`;
}

function formatGeneratedLabel(iso: string): string {
  try {
    return format(parseISO(iso), "d MMMM yyyy 'at' h:mm a");
  } catch {
    return iso;
  }
}

function statusLabel(status: string): string {
  if (status === "needs support") return "Needs support";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusRgb(status: string): readonly [number, number, number] {
  if (status === "needs support") return BUDDY_BRAND_RGB.needsSupport;
  if (status === "active") return BUDDY_BRAND_RGB.active;
  return BUDDY_BRAND_RGB.label;
}

async function loadImageDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function drawPageChrome(doc: jsPDF) {
  const [pr, pg, pb] = BUDDY_BRAND_RGB.primary;
  doc.setFillColor(pr, pg, pb);
  doc.rect(0, 0, PAGE_WIDTH, TOP_BAR_HEIGHT, "F");
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - MARGIN) {
    doc.addPage();
    drawPageChrome(doc);
    return MARGIN + 4;
  }
  return y;
}

function drawSectionHeading(doc: jsPDF, y: number, title: string): number {
  y = ensureSpace(doc, y, 14);
  const [fr, fg, fb] = BUDDY_BRAND_RGB.primary;
  const [br, bg, bb] = BUDDY_BRAND_RGB.border;
  doc.setFillColor(fr, fg, fb);
  doc.setDrawColor(br, bg, bb);
  doc.roundedRect(MARGIN, y - 4, CONTENT_WIDTH, 10, 1, 1, "FD");
  setPdfFont(doc, "bold", 11);
  doc.setTextColor(...BUDDY_BRAND_RGB.foreground);
  doc.text(title, MARGIN + 4, y + 3);
  return y + 14;
}

function drawKeyValue(
  doc: jsPDF,
  x: number,
  y: number,
  label: string,
  value: string,
  colWidth: number
): number {
  setPdfFont(doc, "bold", 9);
  doc.setTextColor(...BUDDY_BRAND_RGB.label);
  doc.text(label, x, y);
  setPdfFont(doc, "normal", 10);
  doc.setTextColor(...BUDDY_BRAND_RGB.foreground);
  const lines = doc.splitTextToSize(value, colWidth - 2);
  doc.text(lines, x, y + 4.5);
  return y + 4.5 + lines.length * LINE_HEIGHT;
}

function drawParagraph(doc: jsPDF, y: number, text: string): number {
  setPdfFont(doc, "normal", 10);
  doc.setTextColor(...BUDDY_BRAND_RGB.foreground);
  const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
  for (const line of lines) {
    y = ensureSpace(doc, y, LINE_HEIGHT);
    doc.text(line, MARGIN, y);
    y += LINE_HEIGHT;
  }
  return y + 4;
}

export function learnerReportPdfFilename(report: LearnerReport): string {
  const slug = report.learner.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
  const date = format(new Date(report.generatedAt), "yyyy-MM-dd");
  return `BuddyAI-Learner-Report-${slug}-${date}.pdf`;
}

export async function generateLearnerReportPdf(report: LearnerReport): Promise<Blob> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const { learner, analytics } = report;

  drawPageChrome(doc);
  let y = MARGIN + 2;

  setPdfFont(doc, "bold", 18);
  doc.setTextColor(...BUDDY_BRAND_RGB.foreground);
  doc.text("BuddyAI Learner Progress Report", MARGIN, y);
  y += 8;

  const [ar, ag, ab] = BUDDY_BRAND_RGB.accent;
  doc.setDrawColor(ar, ag, ab);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, y, MARGIN + 52, y);
  y += 7;

  setPdfFont(doc, "italic", 10);
  doc.setTextColor(...BUDDY_BRAND_RGB.mutedText);
  doc.text(`Generated ${formatGeneratedLabel(report.generatedAt)}`, MARGIN, y);
  y += 12;

  const imageUrl = portraitUrl(learner.id, learner.avatarUrl);
  const imageData = await loadImageDataUrl(imageUrl);
  const photoSize = 32;
  const photoX = MARGIN;
  const photoY = y;

  const [borderR, borderG, borderB] = BUDDY_BRAND_RGB.primary;
  doc.setDrawColor(borderR, borderG, borderB);
  doc.setLineWidth(0.6);

  if (imageData) {
    try {
      doc.addImage(imageData, "JPEG", photoX, photoY, photoSize, photoSize);
      doc.rect(photoX, photoY, photoSize, photoSize, "S");
    } catch {
      doc.setFillColor(...BUDDY_BRAND_RGB.muted);
      doc.rect(photoX, photoY, photoSize, photoSize, "FD");
    }
  } else {
    doc.setFillColor(...BUDDY_BRAND_RGB.sectionTint);
    doc.rect(photoX, photoY, photoSize, photoSize, "FD");
    setPdfFont(doc, "bold", 14);
    doc.setTextColor(...BUDDY_BRAND_RGB.foreground);
    const initials = learner.name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    doc.text(initials, photoX + photoSize / 2, photoY + photoSize / 2 + 2, {
      align: "center"
    });
  }

  const textX = photoX + photoSize + 8;
  setPdfFont(doc, "bold", 16);
  doc.setTextColor(...BUDDY_BRAND_RGB.foreground);
  doc.text(learner.name, textX, photoY + 10);
  setPdfFont(doc, "normal", 10);
  doc.setTextColor(...BUDDY_BRAND_RGB.mutedText);
  doc.text(`${learner.grade} · ${learner.school}`, textX, photoY + 17);
  setPdfFont(doc, "bold", 9);
  const [sr, sg, sb] = statusRgb(learner.status);
  doc.setTextColor(sr, sg, sb);
  doc.text(`Status: ${statusLabel(learner.status)}`, textX, photoY + 24);

  y = photoY + photoSize + 14;

  y = drawSectionHeading(doc, y, "Profile details");
  const colWidth = CONTENT_WIDTH / 2 - 4;
  const leftX = MARGIN;
  const rightX = MARGIN + colWidth + 8;
  let leftY = y;
  let rightY = y;

  leftY = drawKeyValue(doc, leftX, leftY, "Curriculum", learner.curriculum, colWidth);
  leftY = drawKeyValue(doc, leftX, leftY + 2, "Subjects", report.subjectsDisplay, colWidth);
  leftY = drawKeyValue(
    doc,
    leftX,
    leftY + 2,
    "Buddy badge",
    report.badgeTier,
    colWidth
  );
  rightY = drawKeyValue(
    doc,
    rightX,
    rightY,
    "Preferred language",
    learner.preferredLanguage,
    colWidth
  );
  rightY = drawKeyValue(doc, rightX, rightY + 2, "Last active", report.lastActiveDisplay, colWidth);
  rightY = drawKeyValue(
    doc,
    rightX,
    rightY + 2,
    "Buddy points",
    String(learner.buddyPoints),
    colWidth
  );
  y = Math.max(leftY, rightY) + 8;

  y = drawSectionHeading(doc, y, "Analytics");
  const stats: [string, string][] = [
    ["Questions asked", String(learner.totalQuestionsAsked)],
    ["Current streak", `${learner.currentStreak} days`],
    ["Conversations", String(analytics.totalConversations)],
    ["Reviewed chats", String(analytics.reviewedConversations)],
    ["Flagged chats", String(analytics.flaggedConversations)],
    ["Fallback responses", String(analytics.fallbackConversations)],
    ["Buddy points", String(learner.buddyPoints)],
    ["Support notes", String(learner.supportNotes?.length ?? 0)]
  ];

  const statColW = CONTENT_WIDTH / 2 - 4;
  for (let i = 0; i < stats.length; i += 2) {
    y = ensureSpace(doc, y, 16);
    const rowY = y;
    drawKeyValue(doc, leftX, rowY, stats[i][0], stats[i][1], statColW);
    if (stats[i + 1]) {
      drawKeyValue(doc, rightX, rowY, stats[i + 1][0], stats[i + 1][1], statColW);
    }
    y = rowY + 16;
  }

  if (analytics.topSubjects.length > 0) {
    y = ensureSpace(doc, y, 10);
    setPdfFont(doc, "italic", 9);
    doc.setTextColor(...BUDDY_BRAND_RGB.mutedText);
    const subjectLine = `Most discussed subjects: ${analytics.topSubjects
      .map((s) => `${s.subject} (${s.count})`)
      .join(", ")}`;
    const subjectLines = doc.splitTextToSize(subjectLine, CONTENT_WIDTH);
    doc.text(subjectLines, MARGIN, y);
    y += subjectLines.length * LINE_HEIGHT + 6;
  }

  y = drawSectionHeading(doc, y, "Strengths & weaknesses");
  y = drawParagraph(doc, y + 2, report.strengthsWeaknesses);

  setPdfFont(doc, "normal", 8);
  doc.setTextColor(...BUDDY_BRAND_RGB.mutedText);
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.text("BuddyAI Admin Dashboard · Confidential learner report", MARGIN, footerY);

  return doc.output("blob");
}

export async function downloadLearnerReportPdf(report: LearnerReport): Promise<void> {
  const blob = await generateLearnerReportPdf(report);
  const filename = learnerReportPdfFilename(report);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
