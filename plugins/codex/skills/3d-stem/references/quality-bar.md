# Quality bar — what “done” looks like

Grade before reporting done. Compiling is not enough.

## MUST

- **Fullscreen 3D primary surface** — no LMS/dashboard shell.
- **Manipulable concept** — a primary control changes the idea visibly.
- **True-enough model** — the relationship is real for the teaching claim (state
  simplifications explicitly).
- **Readable** — contrast, labels, and camera framing let a newcomer parse the
  scene in seconds.
- **`check` passes** — skill/local gate green.
- **No `@faraday-academy/*` product dependencies.**
- **Diagnostic close** — a check that requires the interaction when an outcome
  was promised.

## SHOULD

- Sparse HUD; one job per overlay cluster.
- Reduced-motion path for non-essential animation.
- Short prose overlays that set up / interpret — not a slide deck beside the
  canvas.

## Automatic fail

- Kit/LMS chrome resurrected.
- Decorative 3D with no conceptual response to controls.
- Claiming success from `check` alone without a preview pass.
- npm-pinning retired Faraday runtime packages.
