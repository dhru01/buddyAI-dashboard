import { NextResponse } from "next/server";
import { Resend } from "resend";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FROM_ADDRESS = "BuddyAI <onboarding@resend.dev>";
const ATTACHMENT_FILENAME = "buddyai-report.pdf";

type SendReportBody = {
  email?: string;
  pdfBase64?: string;
  message?: string;
  learnerName?: string;
};

function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export async function POST(req: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 }
    );
  }

  try {
    const body = (await req.json()) as SendReportBody;
    const email = body.email?.trim() ?? "";
    const pdfBase64 = body.pdfBase64?.trim() ?? "";
    const message = body.message?.trim();
    const learnerName = body.learnerName?.trim();

    if (!email) {
      return NextResponse.json({ error: "Recipient email is required." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (!pdfBase64) {
      return NextResponse.json({ error: "PDF attachment is required." }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const reportLabel = learnerName ? `${learnerName}'s progress report` : "BuddyAI learner progress report";

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #141414;">
        <h2 style="margin: 0 0 12px;">BuddyAI Report</h2>
        <p style="margin: 0 0 12px;">Please find ${reportLabel} attached as a PDF.</p>
        ${message ? `<p style="margin: 0 0 12px; padding: 12px; background: #f7f7f5; border-radius: 8px;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>` : ""}
        <p style="margin: 0; color: #666;">Sent from the BuddyAI Admin Dashboard.</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [email],
      subject: learnerName ? `BuddyAI Report — ${learnerName}` : "BuddyAI Report",
      html,
      attachments: [
        {
          filename: ATTACHMENT_FILENAME,
          content: pdfBase64
        }
      ]
    });

    if (error) {
      console.error("send-report resend error:", error);

      if (error.statusCode === 401 || error.message.toLowerCase().includes("api key")) {
        return NextResponse.json(
          { error: "Email service is misconfigured. Check RESEND_API_KEY." },
          { status: 500 }
        );
      }

      if (error.message.toLowerCase().includes("only send testing emails to your own email")) {
        return NextResponse.json(
          {
            error:
              "Resend demo mode only allows sending to your Resend account email. Use dhrum85@gmail.com or verify a domain."
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: error.message || "Failed to send email." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error("send-report:", error);

    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}
