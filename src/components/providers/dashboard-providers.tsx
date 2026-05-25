"use client";

import { ConversationsProvider } from "@/context/conversations-store";
import { ErrorLogsProvider } from "@/context/error-logs-store";
import { LearnersProvider } from "@/context/learners-store";

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorLogsProvider>
      <ConversationsProvider>
        <LearnersProvider>{children}</LearnersProvider>
      </ConversationsProvider>
    </ErrorLogsProvider>
  );
}
