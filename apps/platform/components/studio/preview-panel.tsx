'use client';

import { useState } from 'react';
import {
  ArrowSquareOutIcon,
  CheckIcon,
  LinkIcon,
  MonitorIcon,
  SparkleIcon,
} from '@phosphor-icons/react';

interface PreviewPanelProps {
  /** 세션 스코프 토큰이 포함된 프록시 프리뷰 URL (준비 시에만). null 이면 미준비. */
  url: string | null;
  /** 에이전트가 작업 중인지 — 미준비 상태 문구를 "준비 중"으로 바꾼다. */
  isBuilding: boolean;
  /** 대화가 하나라도 시작됐는지 — 최초 진입 안내와 준비 중 구분. */
  hasStarted: boolean;
}

/**
 * 스튜디오 우측 라이브 프리뷰 (FR-24~27).
 * `data-md-preview` 이벤트로 받은 프록시 URL 을 iframe 으로 띄운다.
 * URL 이 없으면 상태에 따라 "시작 안내" 또는 "준비 중"을 보여준다.
 */
export function PreviewPanel({ url, isBuilding, hasStarted }: PreviewPanelProps) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    if (!url) return;
    void navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
      <header className="flex h-11 shrink-0 items-center justify-between gap-2 border-b px-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MonitorIcon className="size-4 text-muted-foreground" />
          라이브 프리뷰
        </div>
        {url ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={copyLink}
              className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground"
              title="접속 가능한 프리뷰 링크 복사"
            >
              {copied ? <CheckIcon className="size-3.5" /> : <LinkIcon className="size-3.5" />}
              {copied ? '복사됨' : '공유'}
            </button>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground"
            >
              새 탭
              <ArrowSquareOutIcon className="size-3.5" />
            </a>
          </div>
        ) : null}
      </header>

      <div className="relative min-h-0 flex-1 bg-muted/30">
        {url ? (
          <iframe
            key={url}
            src={url}
            title="course live preview"
            className="h-full w-full border-0 bg-background"
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
          />
        ) : (
          <EmptyState isBuilding={isBuilding} hasStarted={hasStarted} />
        )}
      </div>
    </section>
  );
}

function EmptyState({ isBuilding, hasStarted }: { isBuilding: boolean; hasStarted: boolean }) {
  const building = isBuilding || hasStarted;
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <SparkleIcon className="size-5" />
      </div>
      {building ? (
        <p className="text-sm text-muted-foreground">
          도구를 만들고 있습니다. 준비되면 여기에 라이브 프리뷰가 나타납니다…
        </p>
      ) : (
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">아직 만들어진 것이 없습니다</p>
          <p className="text-sm text-muted-foreground">
            왼쪽 대화창에 만들고 싶은 도구를 설명하며 시작하세요.
          </p>
        </div>
      )}
    </div>
  );
}
