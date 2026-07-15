'use client';

import { useState, type ReactNode } from 'react';
import {
  BrainIcon,
  CaretRightIcon,
  CheckCircleIcon,
  FlagBannerIcon,
  GitBranchIcon,
  NotePencilIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { getToolName, isToolUIPart } from 'ai';
import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from '@faraday-academy/ui/components/ui/marker';
import {
  Message,
  MessageContent,
} from '@faraday-academy/ui/components/ui/message';
import {
  Bubble,
  BubbleContent,
} from '@faraday-academy/ui/components/ui/bubble';
import type { StudioUIMessage } from '@/lib/bridge/session-events';
import { cn } from '@faraday-academy/ui/lib/utils';
import { ToolGroup, type ToolInfo } from './tool-group';
import { AssistantMarkdown } from './assistant-markdown';

interface ChatMessageProps {
  message: StudioUIMessage;
}

/**
 * 단일 대화 턴 렌더 — shadcn base Message/Bubble/Marker 프리미티브.
 * - user: 우측 정렬 primary 버블 (+ 이미지 첨부)
 * - assistant: 텍스트→ghost 버블, milestone 이벤트(md-*)→Marker, 연속 tool 호출→ToolGroup(접힘)
 * 색은 토큰만 사용한다.
 */
export function ChatMessage({ message }: ChatMessageProps) {
  if (message.role === 'user') {
    const text = textOf(message);
    const images = message.parts.filter(
      (p): p is { type: 'file'; url: string; mediaType: string; filename?: string } =>
        p.type === 'file' &&
        typeof (p as { mediaType?: string }).mediaType === 'string' &&
        (p as { mediaType: string }).mediaType.startsWith('image/'),
    );
    return (
      <Message align="end">
        <MessageContent>
          {images.length > 0 ? (
            <div className="flex flex-wrap justify-end gap-2">
              {images.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={img.url}
                  alt={img.filename ?? '첨부 이미지'}
                  className="max-h-48 max-w-full rounded-lg border object-cover"
                />
              ))}
            </div>
          ) : null}
          {text ? (
            <Bubble align="end" variant="default">
              <BubbleContent className="whitespace-pre-wrap">{text}</BubbleContent>
            </Bubble>
          ) : null}
        </MessageContent>
      </Message>
    );
  }

  return (
    <Message align="start">
      {/* 간격은 컨테이너 gap 이 아니라 파트 전이별 상단 마진으로 준다 (renderAssistantParts). */}
      <MessageContent className="gap-0">{renderAssistantParts(message.parts)}</MessageContent>
    </Message>
  );
}

/**
 * 어시스턴트 파트를 순서대로 그린다. 연속된 tool 호출은 하나의 ToolGroup 으로 접고,
 * 텍스트·milestone 이벤트를 만나면 진행 중이던 tool 런을 flush 한다.
 */
type AssistantNodeKind = 'tool' | 'text' | 'marker' | 'reasoning';

function renderAssistantParts(parts: StudioUIMessage['parts']): ReactNode[] {
  const entries: { kind: AssistantNodeKind; node: ReactNode }[] = [];
  let run: ToolInfo[] = [];
  let groupSeq = 0;

  const flush = () => {
    if (run.length > 0) {
      entries.push({ kind: 'tool', node: <ToolGroup key={`tools-${groupSeq++}`} tools={run} /> });
      run = [];
    }
  };

  parts.forEach((part, index) => {
    // 모델 추론(reasoning) — 접히는 "추론" 블록으로. 스트리밍 중엔 자동 펼침.
    if (part.type === 'reasoning') {
      const text = part.text ?? '';
      if (text.trim().length === 0) return;
      flush();
      const streaming = (part as { state?: string }).state === 'streaming';
      entries.push({
        kind: 'reasoning',
        node: <ReasoningBlock key={index} text={text} streaming={streaming} />,
      });
      return;
    }

    if (part.type === 'text') {
      // 공백만 있는 텍스트 파트는 완전히 무시한다: (1) 빈 버블을 만들지 않고,
      // (2) flush 하지 않으므로 그 앞뒤 도구 호출이 하나의 ToolGroup 으로 병합돼
      // 연속 도구 행이 촘촘해진다. 실제 내용이 있는 텍스트만 run 을 끊는다.
      if (!part.text || part.text.trim().length === 0) return;
      flush();
      entries.push({
        kind: 'text',
        node: (
          <Bubble key={index} variant="ghost">
            <BubbleContent>
              <AssistantMarkdown text={part.text} />
            </BubbleContent>
          </Bubble>
        ),
      });
      return;
    }

    if (part.type === 'data-md-phase') {
      flush();
      entries.push({
        kind: 'marker',
        node: (
          <EventMarker key={index} icon={<GitBranchIcon />}>
            단계 {phaseMoveLabel(part.data.move)} — {part.data.phase}
          </EventMarker>
        ),
      });
      return;
    }
    if (part.type === 'data-md-gate') {
      flush();
      const failed = part.data.status === 'failed';
      entries.push({
        kind: 'marker',
        node: (
          <EventMarker key={index} icon={failed ? <XCircleIcon /> : <CheckCircleIcon />}>
            게이트 {part.data.tier} · {gateStatusLabel(part.data.status)}
            {part.data.failureSummary ? ` — ${part.data.failureSummary}` : ''}
          </EventMarker>
        ),
      });
      return;
    }
    if (part.type === 'data-md-journal') {
      flush();
      entries.push({
        kind: 'marker',
        node: (
          <EventMarker key={index} icon={<NotePencilIcon />}>
            {part.data.summary}
          </EventMarker>
        ),
      });
      return;
    }
    if (part.type === 'data-md-approval' && part.data.status === 'requested') {
      flush();
      entries.push({
        kind: 'marker',
        node: (
          <EventMarker key={index} icon={<FlagBannerIcon />}>
            승인 요청: {part.data.question}
          </EventMarker>
        ),
      });
      return;
    }

    if (isToolUIPart(part)) {
      run.push({
        name: getToolName(part),
        input: 'input' in part ? part.input : undefined,
        output: 'output' in part ? part.output : undefined,
        state: part.state,
        errorText: 'errorText' in part ? part.errorText : undefined,
      });
    }
  });

  flush();

  // 세로 간격은 컨테이너 gap 이 아니라 **전이별 상단 마진**으로 준다:
  // 연속 ToolGroup(도구 요약)끼리는 촘촘하게(mt-0.5), 텍스트·마일스톤이 끼면 넉넉하게(mt-2).
  return entries.map((entry, i) => {
    const prev = i > 0 ? entries[i - 1] : undefined;
    const tight = entry.kind === 'tool' && prev?.kind === 'tool';
    const mt = prev === undefined ? undefined : tight ? 'mt-0.5' : 'mt-2';
    return (
      <div key={i} className={mt}>
        {entry.node}
      </div>
    );
  });
}

function EventMarker({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <Marker>
      <MarkerIcon>{icon}</MarkerIcon>
      <MarkerContent>{children}</MarkerContent>
    </Marker>
  );
}

/**
 * 모델 추론(reasoning) 블록 — 접히는 muted 섹션. 스트리밍 중엔 기본 펼침(라이브로 보임),
 * 끝나면 접힌다. 사용자가 헤더로 토글 가능. 답변 텍스트와 시각적으로 구분된다.
 */
function ReasoningBlock({ text, streaming }: { text: string; streaming: boolean }) {
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const open = manualOpen ?? streaming;
  return (
    <div className="text-xs">
      <button
        type="button"
        onClick={() => setManualOpen(!open)}
        className="group flex w-full items-center gap-1.5 py-0.5 text-left text-muted-foreground outline-none"
      >
        <BrainIcon className="size-3 shrink-0" />
        <span className="min-w-0 truncate">{streaming ? '추론 중…' : '추론'}</span>
        <CaretRightIcon
          className={cn(
            'size-3 shrink-0 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100',
            open && 'rotate-90 opacity-100',
          )}
        />
      </button>
      {open ? (
        <div className="mt-0.5 ml-1 max-h-72 overflow-auto border-l-2 border-border pl-2 text-[0.7rem] leading-relaxed whitespace-pre-wrap break-words text-muted-foreground/90">
          {text}
        </div>
      ) : null}
    </div>
  );
}

function phaseMoveLabel(move: 'enter' | 'pass' | 'regress'): string {
  return move === 'enter' ? '진입' : move === 'pass' ? '통과' : '회귀';
}

function gateStatusLabel(status: 'started' | 'passed' | 'failed'): string {
  return status === 'started' ? '실행 중' : status === 'passed' ? '통과' : '실패';
}

function textOf(message: StudioUIMessage): string {
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}
