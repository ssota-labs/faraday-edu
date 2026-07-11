// The composer — a rounded card with an auto-growing textarea. Enter sends,
// Shift+Enter newlines, and IME composition is respected (no premature send while
// composing Korean/Japanese/etc.). While the tutor is streaming, the send button
// becomes a stop button. Trimmed from mirror-dimension's ChatInput (no image
// upload / model selector in v0).
import { useRef, useState } from "react";
import { ArrowUpIcon, StopIcon } from "@phosphor-icons/react";
import { Button } from "@/faraday/ui/button";

export function ChatInput({
  onSend,
  onStop,
  busy,
}: {
  onSend: (text: string) => void;
  onStop: () => void;
  busy: boolean;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const composing = useRef(false);
  const canSend = value.trim().length > 0 && !busy;

  function resize() {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  function submit() {
    const text = value.trim();
    if (!text || busy) return;
    onSend(text);
    setValue("");
    requestAnimationFrame(() => {
      if (ref.current) ref.current.style.height = "auto";
    });
  }

  return (
    <form
      className="flex items-end gap-2 rounded-xl border bg-background p-1.5 transition-colors focus-within:border-ring"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <textarea
        ref={ref}
        rows={1}
        value={value}
        placeholder="Ask the tutor…"
        className="max-h-40 min-h-8 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
        onChange={(e) => {
          setValue(e.target.value);
          resize();
        }}
        onCompositionStart={() => (composing.current = true)}
        onCompositionEnd={() => (composing.current = false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !composing.current) {
            e.preventDefault();
            submit();
          }
        }}
      />
      {busy ? (
        <Button type="button" size="icon-sm" variant="secondary" onClick={onStop} aria-label="Stop">
          <StopIcon />
        </Button>
      ) : (
        <Button type="submit" size="icon-sm" disabled={!canSend} aria-label="Send">
          <ArrowUpIcon />
        </Button>
      )}
    </form>
  );
}
