// <NumericAnswer> — a free-response check: the learner COMPUTES and types the
// answer instead of recognizing it in a list. Use when the outcome verb is
// "calculate/derive/estimate" (see assessment.md); tolerance makes rounding
// and estimation fair. Enter or Check grades; the hint is feed-forward.
//
//   <NumericAnswer
//     question="At 24 m/s and 30°, how far does the ball land?"
//     answer={50.9} unit="m" tolerance={1}
//     hint="Read the range formula — or aim the launcher at 30° and fire."
//     onCorrect={complete}
//   />
import { useRef, useState } from "react";
import { Button } from "@/faraday/ui/button";
import { Input } from "@/faraday/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/faraday/ui/alert";
import { celebrate } from "./celebrate";

export function NumericAnswer(props: {
  question: string;
  /** The expected value. */
  answer: number;
  /** Absolute tolerance. Defaults to 2% of |answer| (fair for rounding). */
  tolerance?: number;
  /** Shown after the input (e.g. "m", "s", "Ω"). */
  unit?: string;
  placeholder?: string;
  /** Feed-forward guidance shown on a wrong answer — point back into the
   *  interactive/model, don't just say "wrong". */
  hint?: string;
  /** Fires when a correct answer is checked — wire to useNode().complete(). */
  onCorrect?: () => void;
  onChecked?: (correct: boolean, value: number) => void;
}) {
  const [raw, setRaw] = useState("");
  const [state, setState] = useState<"idle" | "correct" | "wrong" | "invalid">("idle");
  const rootRef = useRef<HTMLElement>(null);
  const tolerance = props.tolerance ?? Math.max(Math.abs(props.answer) * 0.02, 1e-9);

  const check = () => {
    const value = Number(raw.trim().replace(",", "."));
    if (raw.trim() === "" || Number.isNaN(value)) {
      setState("invalid");
      return;
    }
    const correct = Math.abs(value - props.answer) <= tolerance;
    setState(correct ? "correct" : "wrong");
    props.onChecked?.(correct, value);
    if (correct) {
      celebrate(rootRef.current);
      props.onCorrect?.();
    }
  };

  return (
    <section ref={rootRef} className="flex flex-col gap-4 rounded-xl border bg-card p-5">
      <p className="font-medium">{props.question}</p>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          inputMode="decimal"
          value={raw}
          placeholder={props.placeholder ?? "Your answer"}
          aria-label="Numeric answer"
          className="max-w-40 font-mono tabular-nums"
          onChange={(e) => {
            setRaw(e.target.value);
            setState("idle");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") check();
          }}
        />
        {props.unit ? <span className="text-sm text-muted-foreground">{props.unit}</span> : null}
        <Button size="sm" onClick={check} disabled={raw.trim() === ""}>
          Check
        </Button>
      </div>
      {state === "invalid" ? (
        <Alert variant="destructive">
          <AlertTitle>Not a number</AlertTitle>
          <AlertDescription>Type a numeric value{props.unit ? ` in ${props.unit}` : ""}.</AlertDescription>
        </Alert>
      ) : null}
      {state === "correct" ? (
        <Alert>
          <AlertTitle>Correct</AlertTitle>
          <AlertDescription>
            {props.answer}
            {props.unit ? ` ${props.unit}` : ""} — nice work.
          </AlertDescription>
        </Alert>
      ) : null}
      {state === "wrong" ? (
        <Alert variant="destructive">
          <AlertTitle>Not quite</AlertTitle>
          <AlertDescription>{props.hint ?? "Re-derive it from the model above and try again."}</AlertDescription>
        </Alert>
      ) : null}
    </section>
  );
}
