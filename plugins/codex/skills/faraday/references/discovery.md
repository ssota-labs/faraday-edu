# Discover — start from the creator's material, not a blank page

The best courseware starts from what the creator already teaches. Before designing
anything, take in their material and pin down the few facts that shape every later
decision. Keep it short — this is a 1–5 minute step, not an interrogation.

## 1. Get their material (or ask for it)

Creators arrive with a topic *and usually with artefacts*: slides, lecture notes, a
syllabus, a textbook chapter, a problem set, a diagram. **Starting from these
preserves their pedagogy, examples, and voice — and saves enormous time.**

- **If they attached files**, read them:
  - `.md` / `.txt` / code → read directly.
  - `.pdf` → extract text (use a PDF skill/tool if available; OCR scanned pages).
  - `.pptx` / slides → extract text + slide structure (a PPTX skill/tool).
  - `.docx` / `.xlsx` → extract with the matching tool.
  - images/screenshots → read them visually.
  From each, pull: the **topics** and the **order** they teach them, worked
  **examples**, **exercises/assessments**, the **level**, and their **voice/tone**.
- **If they didn't**, ask once: *"Do you have slides, notes, a syllabus, or a
  chapter I can start from? Even rough material lets me match how you already
  teach."* Proceed from a topic alone only if they have nothing.

Treat their material as the source of truth for *what* to teach and *in what order*;
your job is to make it interactive, not to rewrite their curriculum unasked.

## 1b. Fill gaps with research — deliberately, not reflexively

Their material won't always be complete. Web-search to fill a gap **only when** one
of these holds; otherwise build from what they gave you:

- **a real gap** — the material omits a fact, definition, or worked value a lesson
  needs, and you can't derive it;
- **currency** — the topic moves (a current figure, a recent result) and a stale
  value would mislead;
- **accuracy stakes** — the domain punishes wrong facts (medicine, law, safety,
  finance), so a claim must be grounded in an authority, not paraphrased from memory.

Scale the depth to the stakes: for high-stakes domains, cite the source and
cross-check a second one; for low-stakes, a light lookup is enough. **Anything you
couldn't verify, mark as unverified** in the node's plan brief (see
[orchestration.md](orchestration.md)) so it's checked before ship — this ties into
the quality bar's "content is correct" gate. Don't let research balloon the scope:
you're filling holes in *their* curriculum, not writing a new one.

## 2. Ask the few questions that shape everything

Ask only what you can't infer from their material, and keep it to a handful:

- **Audience & level** — who is this for, and what do they already know? **This one
  is a gate, not optional**: a 9-year-old, a high-schooler, an undergrad, a curious
  adult, and a working professional get the same concept through *different moves*
  (one default methodology per audience in the `audience` pack). If the
  creator can't say, state the assumption you're making in the brief and let them
  veto it — never design with the audience silently unpinned.
- **Goal** — what should the learner be able to *do* after? (an outcome, not "know about X")
- **Scope** — one concept, a unit, or a whole course? (sets lesson vs. multi-chapter `<Course>`)
- **Assessment** — self-check only, or graded/mastery-gated progression?
- **Their methodology** — do they already teach this with a method (their sequence,
  their assessment style, a framework their school uses)? **If yes, their method
  leads** — capture it. If no, you'll apply the evidence-based default in
  the `lecture-design` pack.
- **Constraints** — must-cover items, examples of theirs to keep, time budget, any
  brand/voice.

For a quick one-off lesson, a single question often suffices: *"Who's it for, and
what should they be able to do after?"* Match the depth to the request.

## 3. Reflect back a brief, get a nod, then design

Before building, restate what you heard as a short brief and confirm it:

> **Audience:** … · **Goal:** … · **Scope:** … (→ lesson / course) ·
> **Source:** … · **Proposed shape:** …

One or two lines. A 10-second confirmation here prevents building the wrong thing.
Then move to the **Curriculum** phase (if multi-lesson) or straight to
**Interactive** design (single lesson). This intake feeds:
the `audience` pack (how to hand *this* learner a concept),
[curriculum.md](curriculum.md), [learning-design.md](learning-design.md),
[interactive-design.md](interactive-design.md).
