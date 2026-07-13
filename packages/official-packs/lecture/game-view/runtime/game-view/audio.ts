import { useCallback, useEffect, useRef } from "react";

export type AudioChannel = "bgm" | "sfx";

/** Lightweight HTMLAudioElement manager for game-view beats. No extra deps. */
export function useGameAudio() {
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<HTMLAudioElement[]>([]);

  const play = useCallback((src: string, channel: AudioChannel = "sfx", loop = false, volume = 1) => {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = Math.max(0, Math.min(1, volume));
    if (channel === "bgm") {
      bgmRef.current?.pause();
      bgmRef.current = audio;
    } else {
      sfxRef.current.push(audio);
      audio.addEventListener("ended", () => {
        sfxRef.current = sfxRef.current.filter((a) => a !== audio);
      });
    }
    void audio.play().catch(() => {
      /* autoplay policy or missing file — silent fail */
    });
  }, []);

  const stop = useCallback((channel: AudioChannel | "all" = "all") => {
    if (channel === "bgm" || channel === "all") {
      bgmRef.current?.pause();
      bgmRef.current = null;
    }
    if (channel === "sfx" || channel === "all") {
      for (const a of sfxRef.current) a.pause();
      sfxRef.current = [];
    }
  }, []);

  useEffect(() => () => stop("all"), [stop]);

  return { play, stop };
}
