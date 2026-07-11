// A lean auto-scrolling viewport. mirror-dimension's MessageScroller rides on a
// shadcn primitive we don't vendor; for the tutor v0 a scroll container that
// sticks to the bottom on new content is enough and keeps the dependency surface
// small. (Swap in the full primitive later if we need scroll-to-bottom buttons.)
import { useEffect, useRef, type ReactNode } from "react";

export function ChatScroller({ children }: { children: ReactNode }) {
  const endRef = useRef<HTMLDivElement>(null);
  // Runs after every render (incl. streaming token updates) — keep the tail in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  });
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
      <div className="flex flex-col gap-3">
        {children}
        <div ref={endRef} />
      </div>
    </div>
  );
}
