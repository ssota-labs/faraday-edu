import { useEffect, type ReactNode } from "react";
import { Game2D, getAudioManager, disposeAudioManager } from "../game2d";

export type StoryPage = {
  id: string;
  /** Short title shown above / in HUD. */
  title?: string;
  /** Optional narration (keep tiny for early readers). */
  narration?: ReactNode;
  /** Pixi scene for this page — sprites, physics toys, etc. */
  stage: ReactNode;
  /** Optional DOM chrome under the stage (big buttons, SketchPad, etc.). */
  chrome?: ReactNode;
};

export type StorybookGameProps = {
  pages: StoryPage[];
  /** Controlled page index; defaults to internal state via `pageIndex` + `onPageIndexChange`. */
  pageIndex: number;
  onPageIndexChange?: (index: number) => void;
  background?: number | string;
  className?: string;
  /** Register celebration SFX once (path under public/). */
  successSound?: string;
};

/**
 * Page-turn shell over `<Game2D>`. Author advances pages (prev/next) from lesson
 * UI or after a mission clears. Absorbs the old `kids` tablet pacing: one idea
 * per page, big chrome below the stage.
 */
export function StorybookGame({
  pages,
  pageIndex,
  onPageIndexChange,
  background = 0xfff7ed,
  className,
  successSound,
}: StorybookGameProps) {
  const page = pages[Math.max(0, Math.min(pageIndex, pages.length - 1))];

  useEffect(() => {
    if (!successSound) return;
    const audio = getAudioManager();
    audio.register("storybook-success", successSound);
    return () => {
      audio.unregister("storybook-success");
    };
  }, [successSound]);

  useEffect(() => {
    return () => disposeAudioManager();
  }, []);

  if (!page) return null;

  const atStart = pageIndex <= 0;
  const atEnd = pageIndex >= pages.length - 1;

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {page.title ? (
        <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{page.title}</div>
      ) : null}
      {page.narration ? (
        <div style={{ fontSize: 16, lineHeight: 1.4, maxWidth: "40rem" }}>{page.narration}</div>
      ) : null}

      <div style={{ height: 320, borderRadius: 12, overflow: "hidden" }}>
        <Game2D background={background}>{page.stage}</Game2D>
      </div>

      {page.chrome}

      <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
        <button
          type="button"
          disabled={atStart}
          onClick={() => onPageIndexChange?.(pageIndex - 1)}
          style={{ fontSize: 18, padding: "12px 20px", minWidth: 120 }}
        >
          ← Back
        </button>
        <span style={{ alignSelf: "center", opacity: 0.7 }}>
          {pageIndex + 1} / {pages.length}
        </span>
        <button
          type="button"
          disabled={atEnd}
          onClick={() => onPageIndexChange?.(pageIndex + 1)}
          style={{ fontSize: 18, padding: "12px 20px", minWidth: 120 }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export { celebrate } from "./celebrate";
