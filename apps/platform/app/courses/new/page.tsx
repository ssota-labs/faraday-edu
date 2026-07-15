"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@faraday-academy/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@faraday-academy/ui/components/ui/card";
import { Input } from "@faraday-academy/ui/components/ui/input";
import { Label } from "@faraday-academy/ui/components/ui/label";
import { DEMO_CREATOR_ID } from "@/lib/studio/constants";

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [lectureTitle, setLectureTitle] = useState("Lecture 1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/projects", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-faraday-user-id": DEMO_CREATOR_ID,
        },
        body: JSON.stringify({
          title: title.trim() || "Untitled course",
          slug:
            slug.trim() ||
            `course-${Date.now().toString(36)}`,
          lectureTitle: lectureTitle.trim() || "Lecture 1",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { courseId: string };
      router.push(`/studio/${data.courseId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto grid max-w-lg gap-6 px-4 py-10">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        render={<Link href="/home" />}
        nativeButton={false}
      >
        ← 홈
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-heading-family,Fraunces,Georgia,serif)] text-2xl">
            새 코스
          </CardTitle>
          <CardDescription>
            코스를 만들고 첫 렉처를 함께 생성합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="뉴턴 운동 법칙"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="slug">슬러그 (선택)</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="newton-laws"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lecture">첫 렉처 제목</Label>
              <Input
                id="lecture"
                value={lectureTitle}
                onChange={(e) => setLectureTitle(e.target.value)}
              />
            </div>
            {error ? (
              <p className="text-xs text-destructive">{error}</p>
            ) : null}
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "만드는 중…" : "Studio 열기"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
