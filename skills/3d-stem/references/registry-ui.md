# Education UI via shadcn registry

Optional HUD pieces live in the monorepo **education UI** app and install by
**copy** (shadcn registry), not npm.

## Browse

```bash
pnpm --filter @faraday-academy/edu-ui dev
# open the local URL — component catalog + install snippets
```

## Install into a lesson

From a lesson that already has a shadcn-compatible setup (or after adding one):

```bash
# Example — param-control from the Faraday education registry
npx shadcn@latest add http://localhost:4300/r/param-control.json
```

When the registry is deployed, replace the host with the published registry URL.
The skill does **not** require every lesson to install UI pieces.

## When to pull registry UI

- You need a polished param slider / numeric readout / light overlay chrome.
- Inline HTML controls would become inconsistent across a multi-lesson set.

## When not to

- A single `<input type="range">` already teaches clearly.
- The component would force dashboard layout into a fullscreen scene.

## Hard ban

`npm install @faraday-academy/ui` is **not** a supported product path.
