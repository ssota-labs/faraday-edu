# Pack `tutor` — quality bar

Additional acceptance rules for lessons that use the `tutor` pack.

- **Real grounding.** `<Tutor context={…} />` is passed the lesson's actual text,
  not an empty string or a placeholder. An ungrounded tutor fails.
- **No answer leaks.** The tutor never reveals quiz/exercise solutions outright;
  the persona in `workflows/tutor-agent.ts` enforces Socratic hinting.
- **Earned, not reflexive.** The tutor is added because the lesson benefits from
  learner Q&A — not bolted onto every lesson by default.
- **Boots without a key.** The app compiles and runs without `AI_GATEWAY_API_KEY`
  (live responses need it, but the build must not depend on it).
- **Key stays out of git.** No real key is committed; `.env.local` is git-ignored
  and `env.example` documents the name only.
