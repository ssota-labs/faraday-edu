"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { Button } from "@faraday-academy/ui/components/ui/button";
import { Textarea } from "@faraday-academy/ui/components/ui/textarea";
import { DEMO_CREATOR_ID } from "@/lib/studio/constants";

/** Prompt → create course + first lecture → open Studio (mirror-dimension HomeComposer). */
export function HomeComposer() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = prompt.trim();
    if (!text || busy) return;
    setBusy(true);
    setError(null);
    try {
      const title =
        text.length > 48 ? `${text.slice(0, 45).trim()}…` : text;
      const res = await fetch("/api/studio/projects", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-faraday-user-id": DEMO_CREATOR_ID,
        },
        body: JSON.stringify({
          title,
          lectureTitle: "Lecture 1",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { courseId: string };
      const q = encodeURIComponent(text);
      router.push(`/studio/${data.courseId}?q=${q}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="예: 고등 물리 — 뉴턴 운동 법칙을 인터랙티브로 설명하는 코스"
        rows={4}
        className="min-h-28 resize-none text-sm"
      />
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
      <div className="flex justify-end">
        <Button type="submit" disabled={busy || !prompt.trim()}>
          {busy ? "만드는 중…" : "코스 만들기"}
          <ArrowRightIcon />
        </Button>
      </div>
    </form>
  );
}
