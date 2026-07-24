---
description: Run the 3d-stem structure gate on a lesson
argument-hint: "[lesson-dir]"
---

Run the fail-closed `3d-stem` check and fix findings before claiming done.

```bash
node skills/3d-stem/scripts/stem.mjs check --dir "${ARGUMENTS:-.}" --json
```

Exit `0` is required. Still open a preview — never claim success from check alone.
