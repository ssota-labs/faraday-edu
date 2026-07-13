# Move 2 — Structure the domain as a prerequisite graph with mastery gates

Order by real dependencies and gate progression on **demonstrated mastery**, not
exposure — mastery-based progression averages **d ≈ 0.52**, helping weaker
learners most (Bloom 1968; Kulik, Kulik & Bangert-Drowns 1990 meta-analysis).

The formal basis for dependency-graph curricula is Knowledge Space Theory (Doignon
& Falmagne 1985; deployed in ALEKS): a learner's **frontier** — nodes whose
prerequisites are all mastered — is what they're ready for next.

→ **Faraday:** `requires: [...]` edges + `<Quiz onCorrect={complete}>` gates in
`<CourseHost>`; the map's unlocked nodes *are* the frontier.
