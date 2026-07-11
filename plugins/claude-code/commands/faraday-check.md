---
description: Run the Faraday quality gates on the current lesson and fix any integrity drift.
argument-hint: "[lesson dir]"
allowed-tools: Bash, Read, Edit, Glob, Grep
---

Run the Faraday gates and repair any failures. Target: **$ARGUMENTS** (default: current dir).

1. **Structure + integrity gate:**
   ```bash
   pnpm check      # = node scripts/check-structure.mjs && node scripts/check-integrity.mjs
   ```
   Or from outside the project: `npx @faraday-academy/cli@latest check --dir <lesson>`.

2. **If integrity fails**, the cause is almost always an edit under the locked
   `src/faraday/**` tree. Identify the drifted file from the finding, then **revert
   it to the vendored original** — never "fix" the manifest. If a primitive was
   missing and you worked around it by editing the lock, undo that and note the
   gap instead.

3. **If structure fails** (missing `src/lesson/lesson.tsx`, no default export,
   etc.), fix the author-zone file to satisfy the contract.

4. **Don't stop at `check`.** It only proves the locked tree is intact — it does
   not prove the lesson renders. Follow with `pnpm dev` and drive the lesson to
   confirm it actually works, and `pnpm typecheck` if you want the TS gate.

5. Report the final gate status (exit codes) and what you changed.

Exit codes: `0` ok · `1` check failed · `2` usage · `4` environment.
