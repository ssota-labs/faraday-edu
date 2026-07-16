import type { ReactNode } from "react";
import { cn } from "@faraday-academy/ui/lib/utils";

/** Contain fullscreen presentation chrome inside catalog thumbnails. */
export function ScaledPreview({
  compact,
  children,
  className,
}: {
  compact?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const scale = compact ? 0.52 : 0.68;
  const size = `${Math.round(100 / scale)}%`;

  return (
    <div className={cn("relative w-full overflow-hidden", compact ? "h-36" : "h-56", className)}>
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ transform: `scale(${scale})`, width: size, height: size }}
      >
        {children}
      </div>
    </div>
  );
}
