import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "BuddyAI Admin",
  description: "Buddy Learning Phase 2 staff dashboard"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
