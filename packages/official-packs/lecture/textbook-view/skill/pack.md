# Pack: `textbook-view` — textbook view presentation

Load when a lecture needs the **textbook view**: dense, self-study-friendly
prose the learner reads at their own pace — complementary to the **slide view**
(same concepts, fuller exposition).

## When it fits

- Self-study, revision, reference while working problems
- Longer derivations, worked examples, connecting paragraphs
- Learners who want scroll + search, not one-beat-per-screen pacing

It does **not** replace the slide view for presenter-led or kiosk delivery —
author **both** when the lecture serves class and solo study.

## Build surface

```tsx
import { TextbookView } from "./textbook-view";

<TextbookView
  notesKey="newton-2nd-law"
  pages={[
    { id: "intro", title: "Forces and acceleration", content: <Prose>…</Prose> },
    { id: "derive", title: "From F=ma to motion", content: <Prose>…</Prose> },
  ]}
/>
```

- **Normal mode** — single reading column, vertical scroll (A4 feel).
- **Free mode** — scaled page grid + margin notes (`notesKey` → localStorage).
- Put interactives inside page `content` like any lesson block.

## With `<Lecture>` (view tabs)

```tsx
import { Lecture, SlideDeck, Prose } from "@faraday-academy/runtime/blocks";
import { TextbookView } from "./textbook-view";

<Lecture
  title="Newton's second law"
  views={[
    { id: "slide", label: "Slides", content: <SlideDeck slides={[…]} /> },
    { id: "textbook", label: "Textbook", content: <TextbookView notesKey="…" pages={[…]} /> },
  ]}
/>
```

## Quality gate

See [../quality.md](../quality.md).
