/**
 * 컴포저 모델 선택용 클라이언트-세이프 모델 카탈로그.
 * 순수 데이터만 (서버·`ai` import 없음) — 클라이언트 셀렉터와 /api/chat 검증 양쪽에서 쓴다.
 * id 는 AI Gateway "provider/model" 문자열. DEFAULT_MODEL_ID 는 목록에 포함되어야 한다.
 */

export const DEFAULT_MODEL_ID = 'anthropic/claude-sonnet-5';

export type ProviderKey = 'anthropic' | 'openai' | 'google';

export interface ModelOption {
  /** AI Gateway "provider/model" id. */
  id: string;
  /** 표시 이름. */
  label: string;
  /** 프로바이더 그룹 (아이콘·라벨). */
  provider: ProviderKey;
  providerLabel: string;
}

export const MODEL_OPTIONS: ModelOption[] = [
  { id: 'anthropic/claude-opus-4.8', label: 'Claude Opus 4.8', provider: 'anthropic', providerLabel: 'Anthropic' },
  { id: 'anthropic/claude-sonnet-5', label: 'Claude Sonnet 5', provider: 'anthropic', providerLabel: 'Anthropic' },
  { id: 'anthropic/claude-haiku-4.5', label: 'Claude Haiku 4.5', provider: 'anthropic', providerLabel: 'Anthropic' },
  { id: 'openai/gpt-5.1', label: 'GPT-5.1', provider: 'openai', providerLabel: 'OpenAI' },
  { id: 'openai/gpt-5-mini', label: 'GPT-5 mini', provider: 'openai', providerLabel: 'OpenAI' },
  { id: 'google/gemini-3-pro', label: 'Gemini 3 Pro', provider: 'google', providerLabel: 'Google' },
];

const MODEL_IDS = new Set(MODEL_OPTIONS.map((m) => m.id));

/** 임의 id 를 안전한 모델 id 로 강제 (미지의 값이면 기본값). */
export function resolveModelId(id: string | undefined | null): string {
  return id && MODEL_IDS.has(id) ? id : DEFAULT_MODEL_ID;
}

/** 프로바이더별 그룹 (선언 순서 보존). */
export function modelsByProvider(): { provider: ProviderKey; providerLabel: string; models: ModelOption[] }[] {
  const groups: { provider: ProviderKey; providerLabel: string; models: ModelOption[] }[] = [];
  for (const model of MODEL_OPTIONS) {
    let group = groups.find((g) => g.provider === model.provider);
    if (!group) {
      group = { provider: model.provider, providerLabel: model.providerLabel, models: [] };
      groups.push(group);
    }
    group.models.push(model);
  }
  return groups;
}
