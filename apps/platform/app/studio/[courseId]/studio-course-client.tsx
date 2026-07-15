"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PlusIcon } from "@phosphor-icons/react";
import type { CourseLecture } from "@faraday-academy/platform-contracts";
import { Button } from "@faraday-academy/ui/components/ui/button";
import { StudioSession } from "@/components/studio/studio-session";
import { DEMO_CREATOR_ID } from "@/lib/studio/constants";

type BootState = {
  courseId: string;
  draftId: string;
  title: string;
  lectures: CourseLecture[];
};

export default function StudioCourseClient({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [boot, setBoot] = useState<BootState | null>(null);
  const [sessionId, setSessionId] = useState(
    () => `sess_${Date.now().toString(36)}`,
  );
  const [bootError, setBootError] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);
  const [addingLecture, setAddingLecture] = useState(false);

  useEffect(() => {
    void params.then((p) => setCourseId(p.courseId));
  }, [params]);

  const activeLectureId = searchParams.get("lecture");
  const initialPrompt = searchParams.get("q") ?? undefined;

  const load = useCallback(
    async (id: string) => {
      setBooting(true);
      setBootError(null);
      try {
        const res = await fetch(`/api/studio/projects/${id}`, {
          headers: { "x-faraday-user-id": DEMO_CREATOR_ID },
          cache: "no-store",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
        }
        const data = await res.json();
        setBoot({
          courseId: data.course.id,
          draftId: data.draftId,
          title: data.course.title,
          lectures: data.lectures ?? [],
        });
        if (!searchParams.get("lecture") && data.lectures?.[0]?.id) {
          const q = searchParams.get("q");
          router.replace(
            `/studio/${id}?lecture=${data.lectures[0].id}${
              q ? `&q=${encodeURIComponent(q)}` : ""
            }`,
          );
        }
      } catch (err) {
        setBootError(err instanceof Error ? err.message : "boot failed");
      } finally {
        setBooting(false);
      }
    },
    [router, searchParams],
  );

  useEffect(() => {
    if (courseId) void load(courseId);
  }, [courseId, load]);

  const activeLecture = useMemo(() => {
    if (!boot) return null;
    return (
      boot.lectures.find((l) => l.id === activeLectureId) ??
      boot.lectures[0] ??
      null
    );
  }, [boot, activeLectureId]);

  async function addLecture() {
    if (!boot || addingLecture) return;
    setAddingLecture(true);
    try {
      const res = await fetch(
        `/api/studio/projects/${boot.courseId}/lectures`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-faraday-user-id": DEMO_CREATOR_ID,
          },
          body: JSON.stringify({}),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setBoot((prev) =>
        prev ? { ...prev, lectures: data.lectures as CourseLecture[] } : prev,
      );
      const created = data.lecture as CourseLecture;
      router.push(`/studio/${boot.courseId}?lecture=${created.id}`);
    } catch (err) {
      setBootError(err instanceof Error ? err.message : "add lecture failed");
    } finally {
      setAddingLecture(false);
    }
  }

  if (booting || !courseId) {
    return (
      <div className="flex h-svh items-center justify-center bg-background text-sm text-muted-foreground">
        Studio 준비 중…
      </div>
    );
  }

  if (bootError || !boot) {
    return (
      <div className="flex h-svh flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <p className="text-sm text-destructive">
          {bootError ?? "코스를 열지 못했습니다"}
        </p>
        <Button
          variant="outline"
          render={<Link href="/home" />}
          nativeButton={false}
        >
          홈으로
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-svh bg-background">
      <aside className="flex w-56 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div className="border-b px-3 py-3">
          <Link
            href="/home"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ← 홈
          </Link>
          <p className="mt-2 truncate text-sm font-medium">{boot.title}</p>
          <p className="text-xs text-muted-foreground">코스 · 렉처</p>
        </div>
        <div className="flex-1 overflow-auto p-2">
          <ul className="grid gap-1">
            {boot.lectures
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((lecture) => {
                const active = lecture.id === activeLecture?.id;
                return (
                  <li key={lecture.id}>
                    <Link
                      href={`/studio/${boot.courseId}?lecture=${lecture.id}`}
                      className={
                        active
                          ? "block rounded-md bg-sidebar-accent px-2 py-1.5 text-xs font-medium"
                          : "block rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }
                    >
                      {lecture.title}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            disabled={addingLecture}
            onClick={() => void addLecture()}
          >
            <PlusIcon />
            렉처 추가
          </Button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <StudioSession
          key={`${sessionId}:${activeLecture?.id ?? "none"}`}
          courseId={boot.courseId}
          draftId={boot.draftId}
          courseTitle={
            activeLecture
              ? `${boot.title} · ${activeLecture.title}`
              : boot.title
          }
          sessionId={sessionId}
          userId={DEMO_CREATOR_ID}
          initialPrompt={initialPrompt}
          onNewChat={() => setSessionId(`sess_${Date.now().toString(36)}`)}
        />
      </div>
    </div>
  );
}
