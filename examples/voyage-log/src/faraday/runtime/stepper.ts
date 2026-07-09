// useStepper — cursor + optional autoplay over an ordered list of frames.
// Wire it to a <Scrubber> for "step through it" lessons.
import { useCallback, useEffect, useState } from "react";

export interface Stepper {
  index: number;
  total: number;
  atStart: boolean;
  atEnd: boolean;
  playing: boolean;
  setIndex: (n: number) => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
  togglePlay: () => void;
}

export function useStepper(total: number, options: { fps?: number } = {}): Stepper {
  const fps = options.fps ?? 4;
  const [index, setIndexRaw] = useState(0);
  const [playing, setPlaying] = useState(false);

  const clamp = useCallback((n: number) => Math.max(0, Math.min(total - 1, n)), [total]);
  const setIndex = useCallback((n: number) => setIndexRaw(clamp(n)), [clamp]);

  useEffect(() => {
    setIndexRaw((i) => clamp(i));
  }, [clamp]);

  const next = useCallback(() => setIndexRaw((i) => clamp(i + 1)), [clamp]);
  const prev = useCallback(() => setIndexRaw((i) => clamp(i - 1)), [clamp]);
  const reset = useCallback(() => setIndexRaw(0), []);
  const togglePlay = useCallback(() => setPlaying((p) => !p), []);

  useEffect(() => {
    if (!playing) return;
    if (index >= total - 1) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setIndexRaw((i) => clamp(i + 1)), 1000 / fps);
    return () => clearTimeout(id);
  }, [playing, index, total, fps, clamp]);

  return {
    index,
    total,
    atStart: index <= 0,
    atEnd: index >= total - 1,
    playing,
    setIndex,
    next,
    prev,
    reset,
    togglePlay,
  };
}
