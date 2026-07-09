// <Scrubber> — transport controls for a stepped visualization. Wire to useStepper.
import { CaretLeftIcon, CaretRightIcon, PauseIcon, PlayIcon } from "@phosphor-icons/react";
import { Button } from "@/faraday/ui/button";
import { Slider } from "@/faraday/ui/slider";

export function Scrubber(props: {
  index: number;
  total: number;
  playing: boolean;
  atStart: boolean;
  atEnd: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onSeek: (index: number) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon-sm" onClick={props.onPrev} disabled={props.atStart} aria-label="Previous step">
          <CaretLeftIcon />
        </Button>
        <Button variant="outline" size="icon-sm" onClick={props.onTogglePlay} aria-label={props.playing ? "Pause" : "Play"}>
          {props.playing ? <PauseIcon /> : <PlayIcon />}
        </Button>
        <Button variant="outline" size="icon-sm" onClick={props.onNext} disabled={props.atEnd} aria-label="Next step">
          <CaretRightIcon />
        </Button>
      </div>
      <Slider
        aria-label="Step position"
        className="flex-1"
        value={props.index}
        min={0}
        max={Math.max(0, props.total - 1)}
        onValueChange={(v) => props.onSeek(typeof v === "number" ? v : v[0])}
      />
      <span className="min-w-16 text-right font-mono text-sm tabular-nums text-muted-foreground">
        {props.label ?? `${props.index + 1} / ${props.total}`}
      </span>
    </div>
  );
}
