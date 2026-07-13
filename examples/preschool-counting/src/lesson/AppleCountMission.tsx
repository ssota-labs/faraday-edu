// Preschool game-view — tap-to-count apples mission inside a game beat.
import { useState } from "react";
import { Button } from "@faraday-academy/runtime/ui/button";
import { Challenge } from "@faraday-academy/runtime/blocks";
import { useGameInteraction } from "./game-view";

const TARGET = 3;

export function AppleCountMission() {
  const { complete } = useGameInteraction();
  const [apples, setApples] = useState(0);

  return (
    <Challenge
      goal={`Put ${TARGET} apples in the basket.`}
      done={apples >= TARGET}
      hint="Tap the big button once for each apple you count."
      onDone={complete}
    >
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="flex min-h-16 flex-wrap justify-center gap-2" aria-live="polite">
          {Array.from({ length: apples }, (_, i) => (
            <span key={i} className="text-4xl" role="img" aria-label="apple">
              🍎
            </span>
          ))}
          {apples === 0 ? <span className="text-sm text-muted-foreground">Tap to add apples</span> : null}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" className="min-h-14 min-w-[10rem] text-lg" onClick={() => setApples((n) => Math.min(TARGET, n + 1))}>
            Add apple
          </Button>
          {apples > 0 ? (
            <Button size="lg" variant="outline" className="min-h-14" onClick={() => setApples(0)}>
              Start over
            </Button>
          ) : null}
        </div>
      </div>
    </Challenge>
  );
}
