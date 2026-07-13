# Selecting a stem method

**One stem method per unit** (one concept node or a short sequence treating one
idea). When discipline or content type shifts, switch methods.

Decision order:

1. **Discipline** — math · science · engineering · computing · statistics
2. **Content type** — see table below
3. **Goal** — concept, procedure, modeling, design, data literacy, coding skill
4. **Audience** (`audience` pack) — sets register; does *not* override discipline fit

## By discipline and content type

| Discipline | Content type | Default method | Notes |
|---|---|---|---|
| Math | Concept introduction (especially arithmetic–algebra) | [CRA/CPA](math/cra-cpa.md) | Audience children/secondary often already imply CRA/5E; this file adds variation detail. |
| Math | Problem solving / heuristics | [Polya](math/polya-problem-solving.md) | Olympiad, word problems, proof planning. |
| Math | Structure / "what stays the same?" | [Variation theory](math/variation-theory.md) | Functions, geometry, algebraic structure. |
| Science | Laws, models, mechanisms | [Modeling Instruction](science/modeling-instruction.md) | Physics, chemistry, parts of bio. |
| Science | Structured lab / team inquiry | [POGIL](science/pogil.md) | Solo courseware: sheet-shaped sequence + roles called out in narrative. |
| Science | Single phenomenon / demo | [Predict–Observe–Explain](science/predict-observe-explain.md) | One manipulative moment; pairs with 5E Explore. |
| Science | Evidence and argument | [Argument-driven inquiry](science/argument-driven-inquiry.md) | Labs with claims, evidence tables, revision. |
| Engineering | Ill-structured problem, learning agenda emerges | [PBL](engineering/problem-based-learning.md) | Early design courses, integrated STEM. |
| Engineering | Team deliverable, rubric-graded artifact | [PjBL / CBL](engineering/project-challenge-learning.md) | Capstone, maker, SDG challenges. |
| Engineering | Requirements → prototype → test | [Design cycle](engineering/engineering-design-cycle.md) | MechE, EE, systems; CDIO-aligned. |
| Computing | Algorithms, abstraction, patterns | [Computational thinking](computing/computational-thinking.md) | CS0/CS1 concepts without language syntax focus. |
| Computing | Intro programming / syntax | [PRIMM](computing/primm.md) | Predict–Run–Investigate–Modify–Make on code. |
| Statistics | Exploratory data analysis, GAISE | [GAISE investigation](statistics/gaise-investigation.md) | AP Stats, intro data science surveys. |
| Statistics | Inference without formula first | [Simulation-based inference](statistics/simulation-based-inference.md) | Bootstrap, randomization tests, CI intuition. |
| Any (open inquiry) | Learner-owned questions, light scaffold | [Inquiry-based learning](shared/inquiry-based-learning.md) | Upper secondary / undergrad seminars when structure is intentionally thin. |

## Composing with `audience`

| Audience default | Typical stem pairing |
|---|---|
| CRA (children) | CRA/CPA (math), POE (science phenomena), CT unplugged |
| 5E (secondary) | POE or Modeling (science), Polya (math), PRIMM (computing) |
| Peer Instruction (undergrad) | Modeling or POE opens with ConcepTest; PBL for engineering units |
| Mayer (general public) | GAISE or Modeling with heavy narrative + data families |
| Merrill (professionals) | Design cycle or PjBL/CBL |

**Conflict rule:** If audience and stem methods disagree on *opening*, audience
wins the *first screen*; stem method wins the *unit arc* after that.

## When NOT to use this pack

- Pure delivery / layout choices → `audience`, `slide-view`, `kids`
- Exam integrity / item writing → `exam`
- Universal sequencing and retrieval → `lecture-design`
- Creator named a school-specific framework → follow theirs; borrow from here only
  where they're silent
