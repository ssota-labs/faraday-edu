import { cn } from '@/lib/utils';
import type { ProviderKey } from '@/lib/chat/models';

/**
 * 모델 프로바이더 브랜드 마크 (svgl 스타일 모노크롬 인라인 SVG, currentColor).
 * 외부 요청 없이 인라인 — CSP 안전.
 */
export function ProviderIcon({
  provider,
  className,
}: {
  provider: ProviderKey;
  className?: string;
}) {
  const cls = cn('size-4 shrink-0', className);
  switch (provider) {
    case 'anthropic':
      // Claude 선버스트 (4-포인트 스파크).
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden>
          <path d="M12 2l2.6 6.8L21.5 11l-6.9 2.2L12 20l-2.6-6.8L2.5 11l6.9-2.2z" />
        </svg>
      );
    case 'openai':
      // OpenAI 육각 매듭 (단순화 hexagon).
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden>
          <path d="M12 2.6l8.1 4.7v9.4L12 21.4l-8.1-4.7V7.3z" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3.1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'google':
      // Google "G".
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden>
          <path d="M12 4.5a7.5 7.5 0 1 0 7.34 9H12v-3h10.4c.1.6.1 1.1.1 1.7C22.5 18.9 18 23 12 23A11 11 0 1 1 12 1a10.6 10.6 0 0 1 7.3 2.8l-2.4 2.4A7.2 7.2 0 0 0 12 4.5z" />
        </svg>
      );
    default:
      return null;
  }
}
