// <TextbookView> — textbook-view presentation for a lecture. Normal mode: A4-style
// reading column with vertical scroll. Free mode: scaled page overview + margin
// notes (localStorage-persisted per `notesKey`).
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@faraday-academy/runtime/ui/button";
import { cn } from "@faraday-academy/runtime/lib/utils";

export interface TextbookPage {
  id: string;
  title?: string;
  content: ReactNode;
}

type ViewMode = "normal" | "free";

function loadNotes(key: string): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(`faraday.textbook-notes.${key}`) ?? "{}");
  } catch {
    return {};
  }
}

function saveNotes(key: string, notes: Record<string, string>) {
  try {
    localStorage.setItem(`faraday.textbook-notes.${key}`, JSON.stringify(notes));
  } catch {
    /* session-only */
  }
}

export function TextbookView(props: {
  pages: TextbookPage[];
  /** Stable id for persisting margin notes in free mode. */
  notesKey: string;
  className?: string;
}) {
  const { pages, notesKey } = props;
  const [mode, setMode] = useState<ViewMode>("normal");
  const [activeId, setActiveId] = useState(pages[0]?.id ?? "");
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    setNotes(loadNotes(notesKey));
  }, [notesKey]);

  const active = pages.find((p) => p.id === activeId) ?? pages[0];

  function updateNote(pageId: string, text: string) {
    setNotes((prev) => {
      const next = { ...prev, [pageId]: text };
      saveNotes(notesKey, next);
      return next;
    });
  }

  return (
    <section className={cn("flex flex-col gap-3", props.className)} aria-roledescription="textbook view">
      <div className="flex items-center justify-end gap-2">
        <Button
          variant={mode === "normal" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("normal")}
        >
          Read
        </Button>
        <Button
          variant={mode === "free" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("free")}
        >
          Free mode
        </Button>
      </div>

      {mode === "normal" ? (
        <div className="mx-auto flex w-full max-w-[48rem] flex-col gap-8 rounded-xl border bg-card p-6 sm:p-10">
          {pages.map((page) => (
            <article key={page.id} id={page.id} className="flex flex-col gap-4">
              {page.title ? <h2 className="text-xl font-semibold tracking-tight">{page.title}</h2> : null}
              <div className="text-pretty">{page.content}</div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid min-h-[28rem] gap-4 lg:grid-cols-[3fr_2fr]">
          <div className="min-h-0 overflow-auto rounded-xl border bg-muted/30 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {pages.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => setActiveId(page.id)}
                  className={cn(
                    "origin-top-left scale-[0.72] rounded-lg border bg-card p-3 text-left shadow-sm transition ring-offset-background",
                    active?.id === page.id ? "ring-2 ring-primary" : "hover:border-primary/40",
                  )}
                  style={{ width: "138%", height: "auto" }}
                >
                  {page.title ? (
                    <p className="mb-2 text-xs font-medium text-muted-foreground">{page.title}</p>
                  ) : null}
                  <div className="pointer-events-none text-sm opacity-90">{page.content}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex min-h-0 flex-col gap-2 rounded-xl border bg-card p-4">
            <p className="text-sm font-medium">Notes — {active?.title ?? active?.id}</p>
            <textarea
              className="min-h-[12rem] flex-1 resize-y rounded-md border bg-background p-3 text-sm"
              placeholder="Margin notes for this page…"
              value={notes[active?.id ?? ""] ?? ""}
              onChange={(e) => active && updateNote(active.id, e.target.value)}
            />
          </div>
        </div>
      )}
    </section>
  );
}
