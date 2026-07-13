# Build plans

This app's curriculum build plans live here — **one folder per plan** (an app can
hold several, e.g. different tracks or audiences):

    <plan-id>/
      overview.md      # brief · audience · methodology · pack decisions · node index
      nodes/
        <id>.md        # one file per lesson node: brief + status (todo→building→verified)

Each lesson node is authored as its own file at `src/lesson/nodes/<id>.tsx` and
assembled into the module-scope `curriculum` in `src/lesson/lesson.tsx`. This keeps
lessons file-isolated so they can be built independently (e.g. one sub-agent per node).

See `references/orchestration.md` in the faraday skill for the build loop.

## Plans

- [`newtonian-mechanics/`](newtonian-mechanics/overview.md) — 6-node intro-undergrad unit
  (kinematics → Newton's three laws → friction on an incline). Presentation: `map2dPack`.
