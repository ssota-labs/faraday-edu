import { type ReactNode, useRef } from "react";
import { Application } from "@pixi/react";
import { extendGame2D } from "./extend";

extendGame2D();

export type Game2DProps = {
  children?: ReactNode;
  /** CSS size of the host div. Default fills the parent. */
  className?: string;
  style?: React.CSSProperties;
  background?: number | string;
  antialias?: boolean;
  /** Prefer WebGPU when available (Pixi v8). */
  preference?: "webgl" | "webgpu";
};

/**
 * Host for a PixiJS v8 stage inside a Faraday lesson.
 * Resizes to its parent via `resizeTo`. Author-editable — tweak destroy options,
 * background, or wrap with lesson chrome as needed.
 */
export function Game2D({
  children,
  className,
  style,
  background = 0x1a1a2e,
  antialias = true,
  preference = "webgl",
}: Game2DProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 280,
        touchAction: "none",
        ...style,
      }}
    >
      <Application
        resizeTo={hostRef}
        background={background}
        antialias={antialias}
        preference={preference}
        autoDensity
        resolution={typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1}
      >
        {children}
      </Application>
    </div>
  );
}
