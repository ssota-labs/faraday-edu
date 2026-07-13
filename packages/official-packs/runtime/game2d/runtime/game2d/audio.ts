import { Howl, type HowlOptions } from "howler";

export type SoundId = string;

/**
 * Tiny Howler-backed audio manager for educational 2D stages.
 * Register clips once, play by id. Mute/volume are global for the lesson stage.
 */
export class AudioManager {
  private sounds = new Map<SoundId, Howl>();
  private _muted = false;
  private _volume = 1;

  get muted() {
    return this._muted;
  }
  get volume() {
    return this._volume;
  }

  register(id: SoundId, src: string | string[], opts: Omit<HowlOptions, "src"> = {}) {
    this.unregister(id);
    const howl = new Howl({
      src: Array.isArray(src) ? src : [src],
      volume: this._volume,
      mute: this._muted,
      ...opts,
    });
    this.sounds.set(id, howl);
    return howl;
  }

  play(id: SoundId, opts?: { volume?: number; loop?: boolean }) {
    const s = this.sounds.get(id);
    if (!s) return -1;
    if (opts?.loop != null) s.loop(opts.loop);
    if (opts?.volume != null) s.volume(opts.volume);
    return s.play();
  }

  stop(id: SoundId) {
    this.sounds.get(id)?.stop();
  }

  setVolume(v: number) {
    this._volume = Math.max(0, Math.min(1, v));
    for (const s of this.sounds.values()) s.volume(this._volume);
  }

  setMuted(muted: boolean) {
    this._muted = muted;
    for (const s of this.sounds.values()) s.mute(muted);
  }

  unregister(id: SoundId) {
    const s = this.sounds.get(id);
    if (!s) return;
    s.unload();
    this.sounds.delete(id);
  }

  /** Call on unmount / slide leave. */
  dispose() {
    for (const id of [...this.sounds.keys()]) this.unregister(id);
  }
}

let singleton: AudioManager | null = null;

/** Shared manager for the lesson — create on first use, dispose when the stage unmounts. */
export function getAudioManager() {
  if (!singleton) singleton = new AudioManager();
  return singleton;
}

export function disposeAudioManager() {
  singleton?.dispose();
  singleton = null;
}
