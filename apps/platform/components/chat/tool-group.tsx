'use client';

import { useState } from 'react';
import { CaretRightIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

export interface ToolInfo {
  name: string;
  input?: unknown;
  output?: unknown;
  state: string;
  errorText?: string | undefined;
}

type Category = 'edit' | 'read' | 'search' | 'run' | 'other';

interface Described {
  category: Category;
  action: string;
  detail: string;
}

function field(input: unknown, key: string): string {
  if (input && typeof input === 'object' && key in input) {
    const v = (input as Record<string, unknown>)[key];
    if (typeof v === 'string') return v;
  }
  return '';
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

/** 툴 이름 + 인자를 자연어 행동으로 매핑한다. */
function describe(name: string, input: unknown): Described {
  switch (name) {
    case 'sandbox_read':
      return { category: 'read', action: '읽기', detail: field(input, 'path') };
    case 'sandbox_write':
      return { category: 'edit', action: '작성', detail: field(input, 'path') };
    case 'sandbox_str_replace':
      return { category: 'edit', action: '수정', detail: field(input, 'path') };
    case 'sandbox_delete':
      return { category: 'edit', action: '삭제', detail: field(input, 'path') };
    case 'sandbox_shell':
      return { category: 'run', action: '실행', detail: truncate(field(input, 'cmd'), 64) };
    case 'sandbox_glob':
      return { category: 'search', action: '탐색', detail: field(input, 'pattern') };
    case 'sandbox_grep':
      return { category: 'search', action: '검색', detail: field(input, 'pattern') };
    case 'mirror_info':
      return { category: 'other', action: '구조 확인', detail: '' };
    case 'mirror_dev':
      return { category: 'other', action: 'dev 서버', detail: '' };
    case 'mirror_build':
      return { category: 'other', action: '빌드', detail: '' };
    case 'mirror_pack':
      return { category: 'other', action: '패키징', detail: '' };
    case 'mirror_deploy':
      return { category: 'other', action: '배포', detail: '' };
    case 'open_skill':
      return {
        category: 'other',
        action: '스킬',
        detail: field(input, 'name') || field(input, 'skill') || field(input, 'id'),
      };
    default:
      if (name.startsWith('mirror_')) {
        return { category: 'other', action: `mirror ${name.slice(7).replace(/_/g, ' ')}`, detail: '' };
      }
      if (name.startsWith('sandbox_')) {
        return { category: 'other', action: name.slice(8).replace(/_/g, ' '), detail: '' };
      }
      return { category: 'other', action: name.replace(/_/g, ' '), detail: '' };
  }
}

/** 카테고리별 카운트를 Cursor 형 요약 문장으로. */
function summarize(items: Described[]): string {
  const c: Record<Category, number> = { edit: 0, read: 0, search: 0, run: 0, other: 0 };
  for (const it of items) c[it.category] += 1;
  const parts: string[] = [];
  if (c.edit) parts.push(`파일 ${c.edit}개 수정`);
  if (c.read) parts.push(`${c.read}개 읽기`);
  if (c.search) parts.push(`검색 ${c.search}회`);
  if (c.run) parts.push(`명령 ${c.run}회`);
  if (c.other) parts.push(`작업 ${c.other}개`);
  return parts.join(', ') || `도구 ${items.length}개`;
}

function stringify(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

/**
 * 연속된 도구 호출을 접히는 그룹으로 묶는다 (Cursor 형 요약).
 * 헤더: 행동별 요약 + 우측 끝 캐럿. 펼치면 항목 목록 — 각 항목도 개별 아코디언(출력 표시).
 * 기본 접힘 + 실행 중 스피너, 에러 시 자동 펼침.
 */
export function ToolGroup({ tools }: { tools: ToolInfo[] }) {
  const items = tools.map((t) => ({ ...describe(t.name, t.input), tool: t }));
  const inProgress = tools.some(
    (t) => t.state === 'input-streaming' || t.state === 'input-available',
  );
  const erroredCount = tools.filter((t) => t.state === 'output-error' || t.errorText).length;
  const summary = summarize(items);

  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const open = manualOpen ?? erroredCount > 0;

  return (
    <div className="text-xs">
      <button
        type="button"
        onClick={() => setManualOpen(!open)}
        className="group flex w-full items-center gap-1.5 py-0.5 text-left text-muted-foreground outline-none"
      >
        <span className="min-w-0 truncate">{summary}</span>
        {inProgress ? (
          <Spinner className="size-3 shrink-0" />
        ) : erroredCount > 0 ? (
          <span className="shrink-0 text-destructive">오류 {erroredCount}</span>
        ) : null}
        <CaretRightIcon
          className={cn(
            'size-3 shrink-0 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100',
            open && 'rotate-90 opacity-100',
          )}
        />
      </button>

      {open ? (
        <div className="mt-0.5 space-y-px pl-1">
          {items.map((item, i) => (
            <ToolItem key={i} action={item.action} detail={item.detail} tool={item.tool} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** 그룹 안의 단일 도구 — 헤더(행동+제목) + 펼치면 출력. 에이전트 제목(input.title) 우선. */
function ToolItem({
  action,
  detail,
  tool,
}: {
  action: string;
  detail: string;
  tool: ToolInfo;
}) {
  const [open, setOpen] = useState(false);
  const errored = tool.state === 'output-error' || !!tool.errorText;
  const title = field(tool.input, 'title');
  const primary = title || detail;
  const body = errored ? tool.errorText ?? stringify(tool.output) : stringify(tool.output);
  const hasBody = body.trim().length > 0;

  return (
    <div>
      <button
        type="button"
        disabled={!hasBody}
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center gap-1 py-0.5 text-left outline-none"
      >
        <span className="min-w-0 truncate text-muted-foreground">
          <span>{action}</span>
          {primary ? <span className="ml-1 text-foreground/80">{primary}</span> : null}
          {errored ? <span className="ml-1 text-destructive">— 오류</span> : null}
        </span>
        {hasBody ? (
          <CaretRightIcon
            className={cn(
              'size-3 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100',
              open && 'rotate-90 opacity-100',
            )}
          />
        ) : null}
      </button>
      {open && hasBody ? (
        <pre
          className={cn(
            'mt-0.5 ml-2 max-h-64 overflow-auto rounded bg-muted/50 p-2 text-[0.7rem] leading-relaxed whitespace-pre-wrap break-words',
            errored ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {truncate(body, 4000)}
        </pre>
      ) : null}
    </div>
  );
}
