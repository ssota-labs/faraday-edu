"use client";

import { useCallback, useEffect, useState } from "react";
import { StudioSession } from "@/components/studio/studio-session";

const USER_ID = "creator_demo";

export default function StudioPage() {
  const [courseId, setCourseId] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState(() => `sess_${Date.now().toString(36)}`);
  const [bootError, setBootError] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);

  const ensureProject = useCallback(async () => {
    setBooting(true);
    setBootError(null);
    try {
      const res = await fetch("/api/studio/projects", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-faraday-user-id": USER_ID,
        },
        body: JSON.stringify({
          slug: `draft-${Date.now().toString(36)}`,
          title: "Untitled course",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setCourseId(data.courseId);
      setDraftId(data.draftId);
      setSessionId(`sess_${Date.now().toString(36)}`);
    } catch (err) {
      setBootError(err instanceof Error ? err.message : "boot failed");
    } finally {
      setBooting(false);
    }
  }, []);

  useEffect(() => {
    void ensureProject();
  }, [ensureProject]);

  if (booting) {
    return (
      <div className="flex h-svh items-center justify-center bg-background text-sm text-muted-foreground">
        Studio 준비 중…
      </div>
    );
  }

  if (bootError || !courseId || !draftId) {
    return (
      <div className="flex h-svh flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <p className="text-sm text-destructive">{bootError ?? "프로젝트를 만들지 못했습니다"}</p>
        <button
          type="button"
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          onClick={() => void ensureProject()}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="h-svh">
      <StudioSession
        key={sessionId}
        courseId={courseId}
        draftId={draftId}
        courseTitle="Untitled course"
        sessionId={sessionId}
        userId={USER_ID}
        onNewChat={() => setSessionId(`sess_${Date.now().toString(36)}`)}
      />
    </div>
  );
}
