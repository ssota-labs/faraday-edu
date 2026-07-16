"use client";

import { BLOCK_PREVIEW_DEMOS } from "./block-previews/demos";

export function BlockPreview({
  name,
  compact = false,
}: {
  name: string;
  compact?: boolean;
}) {
  const render = BLOCK_PREVIEW_DEMOS[name];
  const preview = render ? (
    render({ compact })
  ) : (
    <div className="grid h-full min-h-28 place-items-center font-mono text-xs text-muted-foreground">
      Preview unavailable
    </div>
  );

  return (
    <div className="style-faraday h-full min-h-36 overflow-hidden bg-background p-5 text-foreground">
      {preview}
    </div>
  );
}
