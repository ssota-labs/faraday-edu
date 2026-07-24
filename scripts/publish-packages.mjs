#!/usr/bin/env node
// LEGACY — npm suite publish is not part of the 3d-stem product path (PLAN-001 / ADR-001).
// Release = skill version tag, not @faraday-academy/{cli,kit,ui,lms} publish.
console.error(
  "publish-packages: refused — Faraday Academy v1 ships the 3d-stem skill, not an npm runtime suite.\n" +
    "See legacy/QUARANTINE.md and docs/content/docs/development/adr/adr-skill-first-delivery-without-npm-runtime-packages.mdx",
);
process.exit(4);
