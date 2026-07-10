// <CodeCell> — an editable, RUNNABLE JavaScript cell (notebook-style). The
// learner edits the code and presses Run; it executes in a sandboxed iframe
// (no same-origin access) with console.log/info/warn/error captured into an
// output panel. Use it when the audience codes or the concept is algorithmic —
// seeing the numbers come out of your own edit is the interaction.
//
// The editor is syntax-highlighted (dep-free tokenizer) via a transparent
// textarea over a colored layer; the code area shares the card background and
// the console output sits on a contrasting inset panel.
//
//   <CodeCell
//     label="Verify Kepler's third law"
//     code={`const T = (a) => Math.sqrt(a ** 3);\nfor (const a of [1, 2, 4]) console.log(a, T(a).toFixed(2));`}
//   />
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlayIcon, ArrowCounterClockwiseIcon, SpinnerIcon } from "@phosphor-icons/react";
import { Card, CardContent } from "@/faraday/ui/card";
import { Button } from "@/faraday/ui/button";
import { cn } from "@/faraday/lib/utils";

interface OutLine {
  level: "log" | "info" | "warn" | "error" | "result";
  text: string;
}

const RUN_TIMEOUT_MS = 4000;

// ── dep-free JS syntax highlighting (comment / string / number / keyword) ────
const KEYWORDS =
  "const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|import|from|export|default|try|catch|finally|throw|await|async|typeof|instanceof|in|of|this|null|undefined|true|false|yield|static|get|set";
const TOKEN_RE = new RegExp(
  "(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)" + // 1 comment
    "|(`(?:\\\\.|[^`\\\\])*`|\"(?:\\\\.|[^\"\\\\\\n])*\"|'(?:\\\\.|[^'\\\\\\n])*')" + // 2 string/template
    "|\\b(0[xob][\\da-fA-F_]+|\\d[\\d_]*(?:\\.[\\d_]+)?(?:[eE][+-]?\\d+)?)\\b" + // 3 number
    `|\\b(${KEYWORDS})\\b`, // 4 keyword
  "g",
);
const TOKEN_STYLE: Record<number, string> = {
  1: "color:var(--muted-foreground);font-style:italic",
  2: "color:var(--chart-3)",
  3: "color:var(--chart-4)",
  4: "color:var(--chart-1);font-weight:500",
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlightJs(code: string): string {
  let out = "";
  let last = 0;
  TOKEN_RE.lastIndex = 0;
  for (let m = TOKEN_RE.exec(code); m; m = TOKEN_RE.exec(code)) {
    out += escapeHtml(code.slice(last, m.index));
    const group = m[1] ? 1 : m[2] ? 2 : m[3] ? 3 : 4;
    out += `<span style="${TOKEN_STYLE[group]}">${escapeHtml(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  out += escapeHtml(code.slice(last));
  return out;
}

// The sandbox harness: runs posted code as an async body, captures console.
const HARNESS = `<!doctype html><script>
window.addEventListener('message', async (e) => {
  if (!e.data || e.data.type !== 'run') return;
  const logs = [];
  const fmt = (a) => {
    if (typeof a === 'string') return a;
    try { const s = JSON.stringify(a); return s === undefined ? String(a) : s; }
    catch { return String(a); }
  };
  for (const level of ['log', 'info', 'warn', 'error']) {
    console[level] = (...args) => logs.push({ level, text: args.map(fmt).join(' ') });
  }
  try {
    const value = await new Function('"use strict";return (async () => {' + e.data.code + '\\n})()')();
    if (value !== undefined) logs.push({ level: 'result', text: '→ ' + fmt(value) });
  } catch (err) {
    logs.push({ level: 'error', text: String(err) });
  }
  parent.postMessage({ type: 'fd-codecell-result', id: e.data.id, logs }, '*');
});
</script>`;

export function CodeCell(props: {
  /** Initial JavaScript source (the learner can edit it freely). */
  code: string;
  label?: string;
  /** Rendered under the cell — say what to try changing. */
  caption?: string;
}) {
  const [code, setCode] = useState(props.code);
  const [out, setOut] = useState<OutLine[] | null>(null);
  const [running, setRunning] = useState(false);
  const [frameKey, setFrameKey] = useState(0); // bump to kill a runaway sandbox
  const frame = useRef<HTMLIFrameElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const runId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const highlighted = useMemo(() => highlightJs(code) + "\n", [code]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type?: string; id?: number; logs?: OutLine[] };
      if (d?.type !== "fd-codecell-result" || d.id !== runId.current) return;
      if (timer.current) clearTimeout(timer.current);
      setOut(d.logs?.length ? d.logs : [{ level: "info", text: "(no output — console.log something)" }]);
      setRunning(false);
    };
    window.addEventListener("message", onMsg);
    return () => {
      window.removeEventListener("message", onMsg);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const run = useCallback(() => {
    const win = frame.current?.contentWindow;
    if (!win) return;
    runId.current += 1;
    setRunning(true);
    setOut(null);
    win.postMessage({ type: "run", id: runId.current, code }, "*");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setOut([{ level: "error", text: `Timed out after ${RUN_TIMEOUT_MS / 1000}s — infinite loop? Sandbox restarted.` }]);
      setRunning(false);
      setFrameKey((k) => k + 1); // recreate the iframe to kill the loop
    }, RUN_TIMEOUT_MS);
  }, [code]);

  const syncScroll = (el: HTMLTextAreaElement) => {
    const pre = highlightRef.current;
    if (pre) {
      pre.scrollTop = el.scrollTop;
      pre.scrollLeft = el.scrollLeft;
    }
  };

  const rows = Math.min(24, Math.max(4, code.split("\n").length + 1));
  const editorText = "font-mono text-[13px] leading-relaxed";

  return (
    <Card data-flush className="overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
        <span className="text-sm text-muted-foreground">
          {props.label ?? "Code"} <span className="text-xs opacity-70">· JavaScript, editable</span>
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Reset code"
            onClick={() => {
              setCode(props.code);
              setOut(null);
            }}
          >
            <ArrowCounterClockwiseIcon />
          </Button>
          <Button size="sm" onClick={run} disabled={running}>
            {running ? <SpinnerIcon className="animate-spin" /> : <PlayIcon />} Run
          </Button>
        </div>
      </div>
      <CardContent className="p-0">
        {/* editor: transparent-text textarea over the highlight layer; the code
            area shares the card background so the cell reads as one surface */}
        <div className="relative">
          <pre
            ref={highlightRef}
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 overflow-hidden px-4 py-3 break-words whitespace-pre-wrap",
              editorText,
            )}
          >
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
          <textarea
            value={code}
            rows={rows}
            spellCheck={false}
            aria-label={props.label ?? "Code editor"}
            onChange={(e) => setCode(e.target.value)}
            onScroll={(e) => syncScroll(e.currentTarget)}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                e.preventDefault();
                const el = e.currentTarget;
                const { selectionStart: s, selectionEnd: end } = el;
                setCode(code.slice(0, s) + "  " + code.slice(end));
                requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2));
              }
            }}
            className={cn(
              "relative w-full resize-y bg-transparent px-4 py-3 break-words whitespace-pre-wrap text-transparent outline-none selection:bg-primary/25",
              editorText,
            )}
            style={{ caretColor: "var(--foreground)" }}
          />
        </div>
        {out ? (
          <div className="border-t bg-muted/50">
            <div className="px-4 pt-2 text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Console
            </div>
            <div className={cn("px-4 pt-1 pb-3", editorText)}>
              {out.map((l, i) => (
                <div
                  key={i}
                  className={cn(
                    "whitespace-pre-wrap",
                    l.level === "error" && "text-destructive",
                    l.level === "warn" && "text-[var(--chart-4)]",
                    l.level === "result" && "text-primary",
                  )}
                >
                  {l.text}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {props.caption ? (
          <div className="border-t px-4 py-2 text-xs text-muted-foreground">{props.caption}</div>
        ) : null}
      </CardContent>
      <iframe
        key={frameKey}
        ref={frame}
        sandbox="allow-scripts"
        srcDoc={HARNESS}
        title="code sandbox"
        aria-hidden
        tabIndex={-1}
        className="hidden"
      />
    </Card>
  );
}
