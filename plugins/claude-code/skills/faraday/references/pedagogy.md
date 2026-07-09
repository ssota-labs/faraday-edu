# Pedagogy — the evidence-based default

**The creator's own methodology always wins.** If they teach with a method (their
sequence, their assessment style, a school framework), follow it — you learned it in
[discovery.md](discovery.md). This document is the **default** for creators who
don't bring one: a compact methodology assembled from findings that survive
meta-analytic scrutiny, mapped to Faraday's levers. Don't recite it to the creator;
apply it, and cite it only if they ask why.

## The default in five moves

### 1. Design backward, and keep it aligned

Decide in this order: **outcomes → evidence → activities** — what the learner should
be able to *do*; what would prove it (the checks); only then the lessons/interactives
(Wiggins & McTighe, *Understanding by Design* 2005; Biggs 1996 constructive
alignment). Enforce the alignment invariant: **every lesson and every check maps to
an outcome verb; anything that maps to nothing gets cut.** For complex integrated
skills (programming projects, clinical reasoning, troubleshooting), structure around
**whole authentic tasks** ordered simple→complex rather than a topic list
(van Merriënboer & Kirschner, *Ten Steps to Complex Learning*).
→ *Faraday:* this is the Curriculum phase ([curriculum.md](curriculum.md)); outcomes
become node titles + their `<Quiz>`/checks, written **before** the lesson bodies.

### 2. Structure the domain as a prerequisite graph with mastery gates

Order by real dependencies and gate progression on **demonstrated mastery**, not
exposure — mastery-based progression averages **d ≈ 0.52**, helping weaker learners
most (Bloom 1968; Kulik, Kulik & Bangert-Drowns 1990 meta-analysis). The formal
basis for dependency-graph curricula is Knowledge Space Theory (Doignon & Falmagne
1985; deployed in ALEKS): a learner's frontier — nodes whose prerequisites are all
mastered — is what they're ready for next.
→ *Faraday:* `requires: [...]` edges + `<Quiz onCorrect={complete}>` gates in
`<CurriculumHost>`; the map's unlocked nodes *are* the frontier
([learning-design.md](learning-design.md), [worlds.md](worlds.md)).

### 3. Make the learner generate, not just watch

Engagement modes rank **Interactive > Constructive > Active > Passive** (ICAP —
Chi & Wylie 2014); active formats beat lecture by **+0.47 SD** with failure rates
cut by a third (Freeman et al. 2014, PNAS, 225 studies). So prefer interactions
where the learner **predicts, constructs, or explains** over ones where they merely
scrub or watch. Two high-value generative prompts: **self-explanation** ("why does
this step work?", g ≈ 0.55 — Bisra et al. 2018) and **pretesting** (open with an
attempt-before-instruction question on exactly what the lesson teaches, g ≈ 0.54 —
St. Hilaire et al. 2023). For *novices*, start from **worked examples and fade**:
worked → completion (learner fills missing steps) → full problems (g ≈ 0.48 in
math — Barbieri et al. 2023; expertise-reversal: skip for experienced learners).
Keep media lean (Mayer): segment into learner-paced chunks, cue the key element,
**cut decorative material** — extraneous load costs real learning.
→ *Faraday:* design the manipulable-variable interaction in
[interactive-design.md](interactive-design.md); "predict before you scrub" = a
pretest `<Quiz>` or prediction prompt above the `<Workbench>`; completion problems =
frames the learner must set up before playing; restraint rules in
[design.md](design.md).

### 4. Space and retrieve — quizzes are learning events, not just measurement

**Retrieval practice** is the strongest single technique (g ≈ 0.51 vs restudy,
g ≈ 0.67 in classrooms — Adesope et al. 2017, 272 effects; Roediger & Karpicke
2006): closing every unit with real recall *is teaching*. **Spacing** beats massing
(Cepeda et al. 2006, 317 experiments), and their combination — **successive
relearning**, recall-to-criterion across spaced sessions — is the single best
retention engine (Rawson & Dunlosky 2022). **Interleave** related problem types the
learner must discriminate (g ≈ 0.42 — Brunmair & Richter 2019; skip for reading
passages).
→ *Faraday:* every node ends in a `<Quiz>` that requires the interaction (not the
prose) to answer; later nodes **re-quiz earlier ideas** (a "warm-up from last
time" question is cheap spacing); a tier's boss/challenge node interleaves the
tier's skills. Note: expect the difficulty — spaced/retrieved practice *feels*
worse while learning more (desirable difficulties — Bjork & Bjork 2011); don't
optimize for in-session smoothness.

### 5. Feedback that says where-next, not just right/wrong

Feedback averages d ≈ 0.48 but varies wildly; **high-information feedback** (where
am I going / how am I going / where to next) beats bare correctness, and praise does
nothing (Hattie & Timperley 2007; Wisniewski, Zierer & Hattie 2020, 435 studies).
→ *Faraday:* write `<Quiz>` `hint`s as feed-forward ("re-run the sim with n=1 and
watch the ends" — not "wrong"); the grounded tutor is the richest feedback channel —
Socratic, pointing back into the lesson ([tutor.md](tutor.md)).

## Anti-patterns (commonly believed, poorly supported)

- **Passive review features** — highlighting, rereading, "summary at the end"
  as the main event: rated low-utility (Dunlosky et al. 2013). Fine as garnish,
  never the mechanism.
- **Learning-styles matching** (visual/auditory learners…): no adequate evidence
  (Pashler et al. 2008). Never build style-matched variants; match the
  *representation to the content* (spatial → 3D, process → stepped), not to a
  claimed style.
- **"2-sigma" claims** — Bloom's 1984 tutoring benchmark is contested (VanLehn 2011:
  human tutoring d ≈ 0.79). Don't promise it in creator-facing copy.
- **Mechanical stacking** — techniques interact (e.g., self-explanation prompts can
  *blunt* worked-example gains — Barbieri 2023). Pick per lesson; don't bolt all
  five moves onto every node.

## Using this with a creator

In [discovery.md](discovery.md) you asked whether they have their own methodology.
- **They do** → their structure/assessment style leads; borrow from here only where
  they're silent (e.g., they give a sequence but no checks → add retrieval gates).
- **They don't** → apply the five moves, and *show* them the result (the roadmap,
  a sample lesson with its pretest/quiz) rather than lecturing pedagogy. If they
  push back on a default (e.g., "no gates, keep it open"), their call wins —
  note the trade-off once, then follow it.
