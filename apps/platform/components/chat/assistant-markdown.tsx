'use client';

import { Streamdown } from 'streamdown';
import { cn } from '@faraday-academy/ui/lib/utils';

/**
 * 어시스턴트 텍스트의 마크다운 렌더링 (streamdown — 스트리밍 중 미완성 마크다운 안전 처리).
 * 컴팩트 챗 톤에 맞춰 간격·타이포를 우리 토큰으로 조정한다.
 */
export function AssistantMarkdown({ text }: { text: string }) {
  return (
    <Streamdown
      className={cn(
        'text-xs/relaxed text-foreground',
        // 문단·제목
        '[&_p]:my-0 [&_*+p]:mt-2',
        '[&_h1]:mt-3 [&_h1]:mb-1 [&_h1]:text-sm [&_h1]:font-semibold',
        '[&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-sm [&_h2]:font-semibold',
        '[&_h3]:mt-2 [&_h3]:mb-0.5 [&_h3]:font-medium',
        // 리스트
        '[&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5',
        // 코드
        '[&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:text-[0.72rem]',
        '[&_pre]:my-2 [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:bg-muted/60 [&_pre]:p-2 [&_pre]:text-[0.72rem]',
        // 강조·링크·표·인용·구분선
        '[&_strong]:font-semibold [&_a]:text-primary [&_a]:underline',
        '[&_table]:my-2 [&_table]:block [&_table]:overflow-x-auto [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1',
        '[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground',
        '[&_hr]:my-3 [&_hr]:border-border',
      )}
    >
      {text}
    </Streamdown>
  );
}
