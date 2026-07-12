# Pack `three` — quality bar

Additional acceptance rules for lessons that use the `three` pack. These layer on
top of the base `docs/quality-bar.md`.

- **Spatial justification.** 3D is used because the idea is spatial (orbit, field,
  molecule, force, geometry-in-space). A scene that would read as well or better
  as a 2D diagram is a fail.
- **Mood set.** Every `<Scene3D>` carries an explicit `mood`
  (`space`/`cell`/`lab`/`physics`/`abstract`). No default/omitted mood.
- **Manipulable.** The learner can change the scene — at least one live control
  (`<ParamSlider>`/`<Segmented>`/`<Scrubber>`) drives a visible change in the 3D
  view. A watch-only render fails.
- **Procedural-first.** Procedural helpers (`<Body>`/`<Planet>`/`<OrbitPath>`)
  are used unless the shape genuinely needs a `.glb`. A `<Model>` with no
  justification is a smell.
- **Physics honesty** (if `--physics`): the physics reveals something a
  closed-form curve wouldn't. No physics-as-decoration.
