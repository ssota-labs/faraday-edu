# Audience — who is this for, and how do you hand them a concept?

**Pinning the audience is a gate, not a nicety.** The same concept is taught with
different *moves* to a 9-year-old, a high-schooler, an undergrad, a curious adult,
and a working professional — and building before you know which one you're serving
produces courseware for nobody. In Discovery you must get an
explicit answer to *"who is the learner?"* (or state the assumption you're making
and flag it). Then apply this reference.

**The creator's own teaching approach always overrides this file.** These are
defaults for creators who *don't* bring a method — one well-evidenced methodology
per audience, chosen because each has survived real scrutiny. Don't blend all
five into every lesson; pick the row that matches, and let
the `lecture-design` pack (the audience-independent default: backward design,
mastery gates, generative interaction, retrieval, feed-forward feedback) run
underneath.

| Audience | Default methodology | Anchor |
|---|---|---|
| Children / elementary (~6–12) | **CRA** — Concrete → Representational → Abstract | Bruner 1966; CRA math-intervention meta-analyses (e.g. Bouck et al. 2018) |
| Adolescents / secondary (~13–18) | **5E learning cycle** — Engage, Explore, Explain, Elaborate, Evaluate | Atkin & Karplus 1962; BSCS 5E (Bybee et al. 2006) |
| Undergraduates / formal STEM | **Peer Instruction** — predict → commit → resolve ConcepTests | Mazur 1997; Crouch & Mazur 2001 |
| General adult public | **Multimedia learning principles** — segmented, coherent, conversational | Mayer, *Multimedia Learning* (2009/2021) |
| Working professionals | **First Principles of Instruction** — problem-centered cycle | Merrill 2002 (background: Knowles' andragogy) |

## Children / elementary — CRA (Concrete → Representational → Abstract)

Meet the concept three times, in order: **manipulate a thing → see it as a
picture/diagram → only then meet the symbol.** Never open with notation; the
symbol is the *souvenir* of an experience they already had.

- Every concept starts as something they can drag, drop, count, or bend — the
  interactive IS the introduction, not an illustration of prose.
- Language: short sentences, concrete nouns, no jargon without an object attached.
- One idea per screen; celebrate progress visibly (XP, unlocks — game worlds fit
  this audience best of all).
- Symbols appear last, small, and always next to the picture they compress.
- Checks ask them to *do* ("make the orbit a circle"), not to define.

→ *Faraday:* `map2dPack`/`world3dPack` world; each node = one idea; `<Workbench>`
first, a labeled `<Stage>` diagram second, at most one tiny `<TeX>` at the end;
quizzes with picture-anchored options. Prose stays under ~50 words per block.

## Adolescents / secondary — the 5E learning cycle

Inquiry-shaped: the learner **explores a phenomenon before being told the rule**,
then the formalism names what they already saw.

1. **Engage** — a hook: a surprising phenomenon or prediction question (pretest).
2. **Explore** — free play with the manipulable model *before* any explanation.
3. **Explain** — now the prose + `<TeX>` formalize what they just saw.
4. **Elaborate** — a second, different interaction transfers it (new context,
   chart, or code).
5. **Evaluate** — the mastery `<Quiz>` gates the next node.

- Keep the Explore genuinely open (sliders with room to break things), and put
  the "why" strictly after it — resist explaining first.
- Formal notation is expected at this level; introduce it in Explain, in `<TeX>`.

→ *Faraday:* this maps 1:1 onto the lesson-section arc in
interactive design: prediction `<Quiz>` → `<Workbench>`
→ Prose+`<TeX>` → second interactive (`<Chart>`/`<Compare>`/`<CodeCell>`) →
`<Quiz onCorrect={complete}>`. Unlock worlds work well here too.

## Undergraduates / formal STEM — Peer Instruction, solo-adapted

Mazur's classroom loop (ConcepTest → commit to an answer → argue → re-vote)
roughly doubled conceptual gains over lecture. Solo courseware keeps the core:
**force a committed prediction on a conceptual question, then let the model —
not the text — prove the learner right or wrong.**

- Before each key interactive: a **ConcepTest** — conceptual MCQ whose
  distractors are the *documented misconceptions* of the field, not filler.
- The learner commits (picks + checks), THEN drives the interactive to see the
  resolution; the follow-up prose names the misconception explicitly.
- Rigor is respected: full derivations available (in `<Reveal>`), real units,
  real data, and a `<CodeCell>` when they can compute the claim themselves.
- Assume fluency with notation; don't slow the prose down — depth over hand-holding.

→ *Faraday:* pretest/mid-lesson `<Quiz>`es with misconception distractors +
`hint`s that say what the misconception was; `<Workbench>` as the reveal;
`<Reveal>` for derivations; `<CodeCell>` for verify-it-yourself.

## General adult public — Mayer's multimedia principles

Curious adults with no exam and no obligation: attention is volunteered, so the
design job is **respecting limited working memory and keeping the narrative
warm.** The best-evidenced levers from Mayer's principle set:

- **Segmenting** — small learner-paced chunks; one idea per section, generous
  stopping points (chapter nav over one long scroll).
- **Coherence** — cut everything decorative; every figure earns its place.
- **Personalization** — conversational register ("you", direct address) measurably
  beats formal textbook voice for this group.
- **Signaling + dual channels** — say it in words *and* show it in the picture,
  with the key element visually cued; don't duplicate long text into diagrams.
- Math is optional garnish here: show the shape of the relationship (a `<Chart>`)
  before — or instead of — the symbols; keep `<TeX>` for the one equation that
  carries the story.

→ *Faraday:* `<Course>` with short chapters (or a shallow world); conversational
lead + prose; one `<Workbench>` and one `<Chart>` per chapter beat four dense
instruments; quizzes framed as "check your intuition", not exams.

## Working professionals — Merrill's First Principles

Adults learning for the job (Knowles: self-directed, experience-rich,
problem-centered). Merrill's synthesis of what effective instruction shares:
**learning is promoted when learners solve real-world problems**, through four
phases around that problem:

1. **Problem** — open every unit with the real task they face ("your API is
   rate-limited; ship a batcher"), not the topic name.
2. **Activation** — connect to what they already do ("you already retry —
   where does that break?").
3. **Demonstration** — show the skill on the real problem (worked example,
   stepped walkthrough).
4. **Application** — they do it, with feedback: the interactive/`<CodeCell>`
   works on realistic inputs, not toy ones.
5. **Integration** — end by transferring it into *their* context ("apply this
   to your current system — what changes?").

- Ruthless relevance: cut theory that doesn't serve the task; link out for depth.
- Respect their time: state up front what they'll be able to do after.

→ *Faraday:* linear `<Course>` (or `linearPack`) over game worlds — completion
here is driven by usefulness, not XP; `<CodeCell>` with production-shaped data;
node summaries phrased as tasks; final quiz = "which approach ships?".

## Layout — pick the reading surface, not just the method

The lesson surface has distinct layout archetypes; **audience sets the default,
the creator's request and the content override it** (this is explicitly NOT a
1:1 mapping — a professionals' field-reference for tablets is paged; a
children's read-aloud storybook may scroll):

| Layout | What it is | Build with |
|---|---|---|
| **Book scroll** (vertical) | The default reading column — long-form prose + embedded instruments, scrolled like a chapter. | `<Lesson>` as-is |
| **Slide deck / tablet** (screen-at-a-time) | Each slide fills the viewport, one idea per screen, prev/next + dots + arrow keys; landscape split (canvas ⇄ prose) inside a slide. | `<SlideDeck slides={…}>` inside `<Lesson>` |
| **Chaptered course** | Several scroll lessons behind a chapter nav. | `<Course>` |
| **Game world** | Full-viewport map/constellation with HUD; lessons open per node. | `<CourseHost>` + game pack |

Defaults by audience: **children → paged** (CRA wants literally one idea per
screen, big targets, no wall of text to scroll past); **secondary → scroll**
(5E arcs read well as a chapter; paged works for younger/middle grades);
**undergrad → scroll** (dense reading + derivations want a column);
**general public → scroll with short chapters** (`<Course>`), paged for
kiosk/exhibit contexts; **professionals → scroll** (skimmable, searchable,
reference-shaped). Whatever the layout, the quality-bar MUSTs are unchanged —
paged lessons still need the full teach-interpret-check substance, just
distributed across screens.

## Cross-cutting rules (all audiences)

- **Expertise beats age.** Within any audience, *novices to the topic* learn more
  from worked examples that fade into problems, while *experienced* learners are
  hurt by that same scaffolding (expertise-reversal effect — Kalyuga et al. 2003).
  Discovery's "what do they already know?" answer moves you along this axis
  independently of the rows above.
- **Audience ≠ learning styles.** These rows adapt *method and register* to a
  population's prior knowledge and motivation — never build visual/auditory-style
  variants (the `lecture-design` pack anti-patterns).
- **Mixed/unknown audience** → default to the adolescent/5E row (its arc is the
  most forgiving) and say so in the brief; a stated assumption the creator can
  veto beats a silent guess. When the creator names a span across TWO rows
  (e.g. "high-school to college freshman"), take the *younger* row's arc as
  the spine and layer the older row's rigor on top (its assessment forms,
  full derivations, real data/units) — state the blend in the brief.
- **Assessment forms follow the audience too** — children clear missions,
  undergrads type numbers and face ConcepTests, professionals get the job task
  as the gate. The per-audience defaults live in
  the assessment reference ("Audience defaults").
- The quality bar (the quality bar) applies to every audience —
  what changes is prose register, symbol density, and which interactions carry
  the load, not whether the lesson is substantial.
