// Bottom ink tool strip — icon buttons for pan/draw tools (overview + slide annotate).
import {
  ArrowUUpLeftIcon,
  EraserIcon,
  HandIcon,
  HighlighterIcon,
  MarkerCircleIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Button } from "../ui/button";
import { cn } from "../lib/utils";
import { INK_COLORS, type InkTool, defaultInkSize } from "./ink";

export type InkToolbarMode = "draw" | "pan";

export function InkToolbar(props: {
  tool: InkTool;
  mode?: InkToolbarMode;
  color: string;
  size: number;
  onTool: (tool: InkTool) => void;
  onMode?: (mode: InkToolbarMode) => void;
  onColor: (color: string) => void;
  onSize: (size: number) => void;
  onUndo: () => void;
  onClear: () => void;
  className?: string;
}) {
  const panActive = props.mode === "pan";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-1 rounded-full border border-border/70 bg-background/94 px-2 py-1.5 shadow-lg backdrop-blur-md",
        props.className,
      )}
      role="toolbar"
      aria-label="Drawing tools"
    >
      {props.onMode ? (
        <Button
          size="icon-sm"
          variant={panActive ? "default" : "outline"}
          aria-label="Pan"
          onClick={() => props.onMode!("pan")}
        >
          <HandIcon />
        </Button>
      ) : null}
      <Button
        size="icon-sm"
        variant={!panActive && props.tool === "pen" ? "default" : "outline"}
        aria-label="Pen"
        onClick={() => {
          props.onMode?.("draw");
          props.onTool("pen");
          props.onSize(defaultInkSize("pen"));
        }}
      >
        <PencilSimpleIcon />
      </Button>
      <Button
        size="icon-sm"
        variant={!panActive && props.tool === "highlighter" ? "default" : "outline"}
        aria-label="Highlighter"
        onClick={() => {
          props.onMode?.("draw");
          props.onTool("highlighter");
          props.onSize(defaultInkSize("highlighter"));
        }}
      >
        <HighlighterIcon />
      </Button>
      <Button
        size="icon-sm"
        variant={!panActive && props.tool === "marker" ? "default" : "outline"}
        aria-label="Marker"
        onClick={() => {
          props.onMode?.("draw");
          props.onTool("marker");
          props.onSize(defaultInkSize("marker"));
        }}
      >
        <MarkerCircleIcon />
      </Button>
      <Button
        size="icon-sm"
        variant={!panActive && props.tool === "eraser" ? "default" : "outline"}
        aria-label="Eraser"
        onClick={() => {
          props.onMode?.("draw");
          props.onTool("eraser");
          props.onSize(defaultInkSize("eraser"));
        }}
      >
        <EraserIcon />
      </Button>
      <span className="mx-0.5 h-5 w-px bg-border" />
      {INK_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={`Color ${c}`}
          onClick={() => {
            props.onMode?.("draw");
            if (props.tool === "eraser") props.onTool("pen");
            props.onColor(c);
          }}
          className={cn(
            "size-6 rounded-full ring-offset-2",
            props.color === c && props.tool !== "eraser" ? "ring-2 ring-ring" : "",
          )}
          style={{ background: c }}
        />
      ))}
      <input
        type="range"
        min={1}
        max={14}
        value={props.size}
        onChange={(e) => props.onSize(Number(e.target.value))}
        className="mx-1 w-16 sm:w-20"
        aria-label="Stroke size"
      />
      <span className="mx-0.5 h-5 w-px bg-border" />
      <Button size="icon-sm" variant="outline" aria-label="Undo" onClick={props.onUndo}>
        <ArrowUUpLeftIcon />
      </Button>
      <Button size="icon-sm" variant="outline" aria-label="Clear" onClick={props.onClear}>
        <TrashIcon />
      </Button>
    </div>
  );
}
