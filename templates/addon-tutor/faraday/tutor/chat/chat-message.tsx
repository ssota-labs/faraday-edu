// Render one AI SDK UIMessage as a Message + Bubble. v0 shows text parts only
// (reasoning/tool parts are dropped for now — see specs/tutor-ai.md §6). User
// turns align end with the primary bubble; the tutor aligns start, muted.
import type { UIMessage } from "ai";
import { Message, MessageContent } from "./message";
import { BubbleGroup, Bubble, BubbleContent } from "./bubble";

export function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");

  if (!text) return null;

  return (
    <Message align={isUser ? "end" : "start"}>
      <MessageContent>
        <BubbleGroup>
          <Bubble variant={isUser ? "default" : "muted"} align={isUser ? "end" : "start"}>
            <BubbleContent>{text}</BubbleContent>
          </Bubble>
        </BubbleGroup>
      </MessageContent>
    </Message>
  );
}
