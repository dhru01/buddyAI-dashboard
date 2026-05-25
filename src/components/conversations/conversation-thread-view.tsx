"use client";

import { useMemo } from "react";
import { useConversations } from "@/context/conversations-store";
import { messages } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function ConversationThreadView({ conversationId }: { conversationId: string }) {
  const { conversations } = useConversations();

  const conversation = useMemo(
    () => conversations.find((c) => c.id === conversationId),
    [conversations, conversationId]
  );

  const thread = useMemo(
    () => messages.filter((m) => m.conversationId === conversationId),
    [conversationId]
  );

  if (!conversation) {
    return <p className="text-sm text-gray-500">Conversation not found.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        {conversation.subject} • {conversation.language}
      </p>
      <div className="max-h-[min(24rem,50vh)] space-y-3 overflow-y-auto pr-1">
        {thread.length > 0 ? (
          thread.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-xl rounded-2xl p-3 text-sm",
                m.sender === "learner"
                  ? "mr-auto bg-muted"
                  : "ml-auto bg-primary text-black"
              )}
            >
              <p>{m.content}</p>
              {m.metadata && (
                <p className="mt-2 text-xs">
                  Topic: {m.metadata.topic} | Difficulty: {m.metadata.difficulty} | Confidence:{" "}
                  {m.metadata.confidence}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No messages in this conversation yet.</p>
        )}
      </div>
    </div>
  );
}
