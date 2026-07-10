// ChatScroller — the tutor's message viewport, now on the canonical
// @shadcn/react MessageScroller primitive (via message-scroller.tsx): auto-sticks
// to the bottom as tokens stream, and reveals a scroll-to-end button when the
// learner scrolls up to read earlier turns. Each message is wrapped in a
// <MessageScrollerItem> in tutor.tsx so the primitive can anchor on the last turn.
import type { ReactNode } from "react";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "./message-scroller";

export function ChatScroller({ children }: { children: ReactNode }) {
  return (
    <MessageScrollerProvider autoScroll scrollPreviousItemPeek={64}>
      <MessageScroller className="min-h-0 flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent className="px-3 py-3">{children}</MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}

export { MessageScrollerItem } from "./message-scroller";
