// Render one AI SDK UIMessage as a Message + Bubble. The assistant's answer is
// rendered as markdown (+ math + code) via Streamdown, which is streaming-safe.
// Reasoning ("thinking") is only surfaced as a static, non-expandable indicator —
// the raw chain-of-thought is never shown. User turns align end; the tutor aligns
// start, muted. (Tool parts are still dropped for now.)
import type { UIMessage } from "ai";
import { Streamdown } from "streamdown";
import { createMathPlugin } from "@streamdown/math";
// Tutor-scoped styles (kept here, not in the core entry, so non-tutor lessons
// never pull them in): Streamdown's markdown CSS + KaTeX's math CSS.
import "streamdown/styles.css";
import "katex/dist/katex.min.css";
import { Message, MessageContent } from "./message";
import { BubbleGroup, Bubble, BubbleContent } from "./bubble";

// Enable single-dollar inline math ($...$) in addition to $$...$$ display math —
// the default @streamdown/math plugin only parses the display form.
const mathPlugin = createMathPlugin({ singleDollarTextMath: true });

// Models drift between $-delimiters and TeX's \(...\) / \[...\] even when told to
// use dollars, and remark-math only understands dollars. Normalize the brackets to
// dollars before rendering so math renders whichever style the model emitted.
function normalizeMathDelimiters(md: string): string {
  return md
    .replace(/\\\[([\s\S]+?)\\\]/g, (_m, body) => `$$${body}$$`)
    .replace(/\\\(([\s\S]+?)\\\)/g, (_m, body) => `$${body}$`);
}

export function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
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
            // Static indicator only — the reasoning content is intentionally
            // hidden and not expandable.
            <span className="w-fit cursor-default select-none rounded-full border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              Thinking
            </span>
          ) : null}
          {text ? (
            <Bubble variant={isUser ? "default" : "muted"} align={isUser ? "end" : "start"}>
              <BubbleContent className={isUser ? undefined : "whitespace-normal"}>
                {isUser ? (
                  text
                ) : (
                  <Streamdown plugins={{ math: mathPlugin }} className="fd-tutor-md text-sm/relaxed [&_p]:my-0 [&_p+p]:mt-2">
                    {normalizeMathDelimiters(text)}
                  </Streamdown>
                )}
              </BubbleContent>
            </Bubble>
          ) : null}
        </BubbleGroup>
      </MessageContent>
    </Message>
  );
}
