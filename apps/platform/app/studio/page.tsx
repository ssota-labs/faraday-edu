"use client";

import { useState } from "react";
import { Button } from "@faraday-academy/ui/components/ui/button";
import { Card, CardContent } from "@faraday-academy/ui/components/ui/card";
import { Textarea } from "@faraday-academy/ui/components/ui/textarea";
import { ScrollArea } from "@faraday-academy/ui/components/ui/scroll-area";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@faraday-academy/ui/components/ui/empty";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@faraday-academy/ui/components/ui/resizable";
import { toast } from "@faraday-academy/ui/components/ui/sonner";

export default function StudioPage() {
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function ensureProject() {
    if (courseId && draftId) return { courseId, draftId };
    const res = await fetch("/api/studio/projects", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-faraday-user-id": "creator_demo",
      },
      body: JSON.stringify({
        slug: `draft-${Date.now().toString(36)}`,
        title: "Untitled course",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message ?? "Could not create project");
    }
    setCourseId(data.courseId);
    setDraftId(data.draftId);
    return { courseId: data.courseId as string, draftId: data.draftId as string };
  }

  async function send() {
    if (!input.trim() || busy) return;
    setBusy(true);
    const text = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    try {
      const proj = await ensureProject();
      const res = await fetch("/api/studio/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-faraday-user-id": "creator_demo",
        },
        body: JSON.stringify({
          courseId: proj.courseId,
          draftId: proj.draftId,
          messages: [{ role: "user", content: text }],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.message ?? "Studio chat failed");
        return;
      }
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply ?? "…" },
      ]);
      if (data.previewUrl) setPreviewUrl(data.previewUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Studio chat failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-svh bg-background"
    >
      <ResizablePanel defaultSize={42} minSize={28}>
        <section className="flex h-full flex-col border-r border-border p-4">
          <h1 className="mb-4 font-[family-name:var(--font-heading-family,Fraunces,Georgia,serif)] text-2xl tracking-tight">
            Faraday Studio
          </h1>
          <ScrollArea className="min-h-0 flex-1 pr-2">
            <div className="grid gap-3 pb-4">
              {messages.length === 0 ? (
                <Empty className="border border-dashed border-border py-10">
                  <EmptyHeader>
                    <EmptyTitle>Start a course</EmptyTitle>
                    <EmptyDescription>
                      Describe a lesson and the agent will draft a preview.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                messages.map((m, i) => (
                  <Card
                    key={i}
                    size="sm"
                    className={
                      m.role === "user"
                        ? "bg-card"
                        : "bg-accent text-accent-foreground"
                    }
                  >
                    <CardContent className="pt-3">
                      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {m.role}
                      </div>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {m.content}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
          <div className="mt-3 flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder="Describe a lesson…"
              className="min-h-12 flex-1 resize-none"
              rows={2}
            />
            <Button type="button" onClick={() => void send()} disabled={busy}>
              Send
            </Button>
          </div>
        </section>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={58} minSize={30}>
        <section className="flex h-full flex-col bg-foreground/95 p-4 text-background">
          <div className="mb-2 text-xs uppercase tracking-wide opacity-70">
            Preview
          </div>
          {previewUrl ? (
            <iframe
              title="preview"
              src={previewUrl}
              className="h-full w-full flex-1 rounded-md border-0 bg-background"
              sandbox="allow-scripts"
            />
          ) : (
            <Empty className="flex-1 text-background/70">
              <EmptyHeader>
                <EmptyTitle className="text-background">No preview yet</EmptyTitle>
                <EmptyDescription className="text-background/60">
                  Preview appears after the agent has an index.html.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </section>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
