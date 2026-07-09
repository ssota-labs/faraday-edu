// Render one AI SDK UIMessage as a Message + Bubble. Shows the assistant's
// reasoning (thinking) in a collapsible block above the answer, then the text.
// (Tool parts are still dropped for now.) User turns align end with the primary
// bubble; the tutor aligns start, muted.
import type { UIMessage } from "ai";
import { Message, MessageContent } from "./message";
import { BubbleGroup, Bubble, BubbleContent } from "./bubble";

export function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
  // Reasoning models (e.g. DeepSeek V4 Pro with `reasoning` on) stream a separate
  // reasoning part; surface it so thinking is visible instead of silently dropped.
  const reasoning = message.parts
    .filter((p): p is { type: "reasoning"; text: string } => p.type === "reasoning")
    .map((p) => p.text)
    .join("");

  if (!text && !reasoning) return null;

  return (
    <Message align={isUser ? "end" : "start"}>
      <MessageContent>
        <BubbleGroup>
          {!isUser && reasoning ? (
            <details className="group/think w-fit max-w-[85%] rounded-lg border bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground">
              <summary className="cursor-pointer list-none select-none font-medium marker:content-none">
                <span className="inline-flex items-center gap-1">
                  <span className="transition-transform group-open/think:rotate-90">▸</span>
                  Thinking
                </span>
              </summary>
              <div className="mt-1.5 whitespace-pre-wrap wrap-break-word opacity-90">{reasoning}</div>
            </details>
          ) : null}
          {text ? (
            <Bubble variant={isUser ? "default" : "muted"} align={isUser ? "end" : "start"}>
              <BubbleContent>{text}</BubbleContent>
            </Bubble>
          ) : null}
        </BubbleGroup>
      </MessageContent>
    </Message>
  );
}
