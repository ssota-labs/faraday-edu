/**
 * 세션 이벤트 — 타입 있는 커스텀 데이터 파트 (스펙 05 FR-19).
 *
 * AI SDK v7 UI 메시지 스트림의 data part 규약을 따른다:
 * `UIMessage<METADATA, DATA_PARTS>` 의 DATA_PARTS 레코드 키가 파트 이름이 되고,
 * 스트림 청크·메시지 파트에서는 `data-<이름>` 타입으로 나타난다.
 *
 * 파트 이름은 플랫폼 네임스페이스(`md-`)로 명명한다 (FR-19 마지막 문장).
 * 이벤트 의미론은 스펙 05 소유 — 스펙 06 은 저장만 담당한다 (D-34).
 *
 * 주의: 병렬 작업 중인 Atelier(`lib/atelier/`)가 이 모듈을 임포트해 이벤트를
 * 발행한다 — 여기서 Atelier 쪽을 임포트하지 않는다 (단방향 의존).
 */

import type { UIMessage } from 'ai';

// ---------------------------------------------------------------------------
// 공용 어휘 (스펙 05 FR-3 상태 머신 · FR-10 단계)
// ---------------------------------------------------------------------------

export const SESSION_STATES = [
  'queued',
  'booting',
  'restoring',
  'active',
  'paused',
  'sealing',
  'ended',
  'failed',
] as const;
export type SessionState = (typeof SESSION_STATES)[number];

export const WORK_PHASES = ['brief', 'underpaint', 'paint', 'varnish', 'frame'] as const;
export type WorkPhase = (typeof WORK_PHASES)[number];

export const GATE_TIERS = ['fast', 'full'] as const;
export type GateTier = (typeof GATE_TIERS)[number];

// ---------------------------------------------------------------------------
// 7종 데이터 파트 페이로드 (FR-19 a~g)
// ---------------------------------------------------------------------------

/** (a) 세션 상태 전이 — FR-3 상태 머신의 전이 기록. */
export interface MdSessionStateData {
  from: SessionState | null;
  to: SessionState;
  at: string;
  reason?: string;
}

/** (b) 작업 단계 전환 — 진입·통과·회귀 (FR-11). */
export interface MdPhaseData {
  phase: WorkPhase;
  move: 'enter' | 'pass' | 'regress';
  at: string;
  reason?: string;
}

/** (c) 게이트 실행 시작·결과 (티어, 통과/실패, 실패 항목 요약). */
export interface MdGateData {
  gateId: string;
  tier: GateTier;
  status: 'started' | 'passed' | 'failed';
  at: string;
  failureSummary?: string;
}

/** (d) Studio Journal 신규 항목 — 정본은 dimension 루트 파일 (D-2), 이것은 타임라인 노출용. */
export interface MdJournalData {
  entryId: string;
  phase: WorkPhase;
  summary: string;
  at: string;
}

/** (e) 라이브 프리뷰 준비/무효화 (FR-24~27). */
export interface MdPreviewData {
  status: 'ready' | 'invalidated';
  at: string;
  /** 세션 스코프 토큰이 포함된 프록시 URL — 준비 시에만. */
  url?: string;
  reason?: string;
}

/** (f) 승인 요청·해소 (FR-15, FR-17, FR-22a). */
export interface MdApprovalData {
  requestId: string;
  status: 'requested' | 'resolved';
  question: string;
  at: string;
  options?: string[];
  response?: string;
}

/** (g) 예산 잔량 경고 (FR-32 — 80% 경고 / 100% 소진). */
export interface MdBudgetData {
  budget: 'tokens' | 'sandbox-minutes';
  usedPct: number;
  level: 'warning' | 'exhausted';
  at: string;
}

/** UIMessage 의 DATA_PARTS 레코드 — 키가 데이터 파트 이름. */
export type MdDataParts = {
  'md-session-state': MdSessionStateData;
  'md-phase': MdPhaseData;
  'md-gate': MdGateData;
  'md-journal': MdJournalData;
  'md-preview': MdPreviewData;
  'md-approval': MdApprovalData;
  'md-budget': MdBudgetData;
};

export type MdEventKind = keyof MdDataParts;

export const MD_EVENT_KINDS = [
  'md-session-state',
  'md-phase',
  'md-gate',
  'md-journal',
  'md-preview',
  'md-approval',
  'md-budget',
] as const satisfies readonly MdEventKind[];

/** 브릿지가 스트리밍하는 UI 메시지 타입 (metadata 없음). */
export type StudioUIMessage = UIMessage<never, MdDataParts>;

// ---------------------------------------------------------------------------
// 이벤트 봉투 — 허브·영속 계층이 나르는 형태
// ---------------------------------------------------------------------------

export type MdSessionEvent = {
  [K in MdEventKind]: { kind: K; data: MdDataParts[K] };
}[MdEventKind];

/** 이벤트별로 상관된(correlated) data 청크 유니언 — UI 메시지 스트림 규약 형태. */
export type MdDataChunk = {
  [K in MdEventKind]: {
    type: `data-${K}`;
    data: MdDataParts[K];
    id?: string;
    transient?: boolean;
  };
}[MdEventKind];

/**
 * 이벤트 → UI 메시지 스트림 data 청크 (writer.write 에 그대로 넘길 수 있는 형태).
 * `id` 를 주면 클라이언트가 같은 id 파트를 갱신(reconcile)한다.
 */
export function toDataChunk(
  event: MdSessionEvent,
  options: { id?: string; transient?: boolean } = {},
): MdDataChunk {
  return {
    type: `data-${event.kind}`,
    data: event.data,
    ...(options.id !== undefined ? { id: options.id } : {}),
    ...(options.transient !== undefined ? { transient: options.transient } : {}),
  } as MdDataChunk;
}

// ---------------------------------------------------------------------------
// 파싱·검증 (라운드트립 — 영속 저장분 복원, 신뢰 불가 입력 방어)
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function optionalString(value: unknown): boolean {
  return value === undefined || typeof value === 'string';
}

const DATA_VALIDATORS: { [K in MdEventKind]: (d: Record<string, unknown>) => boolean } = {
  'md-session-state': (d) =>
    (d.from === null || SESSION_STATES.includes(d.from as SessionState)) &&
    SESSION_STATES.includes(d.to as SessionState) &&
    isString(d.at) &&
    optionalString(d.reason),
  'md-phase': (d) =>
    WORK_PHASES.includes(d.phase as WorkPhase) &&
    ['enter', 'pass', 'regress'].includes(d.move as string) &&
    isString(d.at) &&
    optionalString(d.reason),
  'md-gate': (d) =>
    isString(d.gateId) &&
    GATE_TIERS.includes(d.tier as GateTier) &&
    ['started', 'passed', 'failed'].includes(d.status as string) &&
    isString(d.at) &&
    optionalString(d.failureSummary),
  'md-journal': (d) =>
    isString(d.entryId) &&
    WORK_PHASES.includes(d.phase as WorkPhase) &&
    isString(d.summary) &&
    isString(d.at),
  'md-preview': (d) =>
    ['ready', 'invalidated'].includes(d.status as string) &&
    isString(d.at) &&
    optionalString(d.url) &&
    optionalString(d.reason),
  'md-approval': (d) =>
    isString(d.requestId) &&
    ['requested', 'resolved'].includes(d.status as string) &&
    isString(d.question) &&
    isString(d.at) &&
    (d.options === undefined || (Array.isArray(d.options) && d.options.every(isString))) &&
    optionalString(d.response),
  'md-budget': (d) =>
    ['tokens', 'sandbox-minutes'].includes(d.budget as string) &&
    typeof d.usedPct === 'number' &&
    ['warning', 'exhausted'].includes(d.level as string) &&
    isString(d.at),
};

/**
 * 신뢰 불가 값(JSON 복원분 등)을 MdSessionEvent 로 파싱한다.
 * 형태가 어긋나면 null — 예외를 던지지 않는다.
 */
export function parseSessionEvent(value: unknown): MdSessionEvent | null {
  if (!isRecord(value)) return null;
  const kind = value.kind;
  if (!isString(kind) || !(MD_EVENT_KINDS as readonly string[]).includes(kind)) return null;
  const data = value.data;
  if (!isRecord(data)) return null;
  if (!DATA_VALIDATORS[kind as MdEventKind](data)) return null;
  return { kind, data } as unknown as MdSessionEvent;
}
