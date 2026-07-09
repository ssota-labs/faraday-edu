// Example 3D lesson — loading an ASSET (Tier 2). This uses a CC0 animated fox
// model (Khronos glTF sample assets) from public/models/fox.glb. Copy this into
// src/lesson/lesson.tsx of a `faraday new --3d` project. Contrast with the
// procedural demos: use assets only when the shape is too detailed/organic to
// code-generate. Drop your own .glb in public/models/ and change the url.
import { useState } from "react";
import { Lesson, Prose, Workbench, ControlGroup, Segmented, ParamSlider, ParamSwitch, Callout, Quiz } from "@/faraday/blocks";
import { Scene3D, Model } from "@/faraday/three";

export default function ModelLesson() {
  const [clip, setClip] = useState("Survey");
  const [scale, setScale] = useState(0.05);
  const [rotate, setRotate] = useState(true);

  return (
    <Lesson
      topic="3D assets"
      title="Loading a 3D model"
      lead="Some shapes are too detailed or organic to code-generate — a real animal, an anatomically correct organ, a machine. For those, load an artist-made model (.glb). This fox is a CC0 asset with built-in animations."
    >
      <Prose>
        <p>
          The <code>&lt;Model&gt;</code> block loads a <code>.glb</code> from{" "}
          <code>public/models/</code> and plays its animation clips. Switch clips and reshape from
          the panel — the mesh and rig came from the file, not from code.
        </p>
      </Prose>

      <Workbench
        title="Fox (CC0 asset)"
        panelTitle="Model"
        onReset={() => {
          setClip("Survey");
          setScale(0.05);
          setRotate(true);
        }}
        controls={
          <>
            <ControlGroup label="Animation">
              <Segmented
                value={clip}
                onChange={setClip}
                options={[
                  { value: "Survey", label: "Survey" },
                  { value: "Walk", label: "Walk" },
                  { value: "Run", label: "Run" },
                ]}
              />
            </ControlGroup>
            <ControlGroup label="View">
              <ParamSlider label="Scale" value={scale} min={0.02} max={0.09} step={0.005} onChange={setScale} format={(v) => v.toFixed(3)} />
              <ParamSwitch label="Auto-rotate" checked={rotate} onChange={setRotate} />
            </ControlGroup>
          </>
        }
      >
        <Scene3D mood="lab" height={440} camera={[0, 3, 9]} autoRotate={rotate}>
          <Model url="/models/fox.glb" scale={scale} animation={clip} />
        </Scene3D>
      </Workbench>

      <Callout title="Procedural or asset?">
        Reach for an asset only when code can't express the shape clearly. Orbits, molecules, fields,
        and stylized diagrams are better <em>generated</em> — they stay editable, labelable, and tiny.
      </Callout>

      <Quiz
        question="When is loading a .glb asset the right call over code-generating the geometry?"
        options={[
          { label: "For a planet's circular orbit", hint: "That's a parametric curve — generate it." },
          { label: "For a detailed, organic shape like an animal", correct: true, hint: "Right — too complex to code by hand." },
          { label: "For a bar chart", hint: "That's 2D data viz, not a 3D asset." },
          { label: "Always — never generate geometry", hint: "Procedural is better for most teaching shapes." },
        ]}
      />
    </Lesson>
  );
}
