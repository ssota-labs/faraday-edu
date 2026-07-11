// <Tutor> — the durable tutor chat, embeddable mid-textbook as a floating card.
//
// Follows mirror-dimension's client exactly: `useChat` (@ai-sdk/react) driven by
// `WorkflowChatTransport` (@ai-sdk/workflow). The transport POSTs to /api/chat,
// stores the returned run id, and auto-reconnects to /api/chat/:runId/stream if
// the connection drops — so a refresh mid-answer resumes the same durable run.
//
// Grounding: the lesson `context` + `title` ride along on every request
// (prepareSendMessagesRequest -> body) and the workflow folds them into the
// system prompt (grounding lives in workflows/tutor-agent.ts).
import { useChat } from "@ai-sdk/react";
import { WorkflowChatTransport } from "@ai-sdk/workflow";
import { useMemo } from "react";
import { cn } from "@/faraday/lib/utils";
import { ChatMessage } from "./chat/chat-message";
import { ChatScroller } from "./chat/scroller";
import { ChatInput } from "./chat/chat-input";

export interface TutorProps {
  /** Lesson/curriculum text to ground the tutor in. */
  context?: string;
  /** Lesson title — shown in the header and sent for framing. */
  title?: string;
  /** Optional opening line shown before the learner's first message. */
  greeting?: string;
  className?: string;
}

export function Tutor({ context, title = "Tutor", greeting, className }: TutorProps) {
  const transport = useMemo(
    () =>
      new WorkflowChatTransport({
        api: "/api/chat",
        // Attach grounding to every turn; the workflow reads it off the body.
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: { ...body, messages, context, title },
        }),
      }),
    [context, title],
  );

  const { messages, sendMessage, status, stop } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";

  return (
    <div
      className={cn(
        "flex h-[28rem] flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b px-3 py-2 text-sm font-medium">
        <span
          className={cn(
            "size-2 rounded-full",
            busy ? "animate-pulse bg-[var(--chart-4)]" : "bg-[var(--chart-3)]",
          )}
          aria-hidden
        />
        {title}
      </div>

      <ChatScroller>
        {greeting && messages.length === 0 ? (
          <ChatMessage
            message={{ id: "greeting", role: "assistant", parts: [{ type: "text", text: greeting }] }}
          />
        ) : null}
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
      </ChatScroller>

      <div className="border-t p-2">
        <ChatInput onSend={(text) => sendMessage({ text })} onStop={stop} busy={busy} />
      </div>
    </div>
  );
}
