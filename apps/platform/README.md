# @faraday-academy/platform

Public Faraday catalog (Next.js) — blocks, packs, examples, quality, and
compatibility. Catalog content is read-only; the app retains only the basic
Supabase authentication foundation for later phases.

```bash
pnpm --filter @faraday-academy/platform dev   # http://localhost:3100
pnpm --filter @faraday-academy/platform typecheck
pnpm --filter @faraday-academy/platform build
```

The Vite-based [`apps/labs`](../labs) remains the internal component-fidelity
environment. Both apps consume the same generated catalog metadata.
