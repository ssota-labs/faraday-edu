// Example 3D lesson — a stylized animal cell, fully procedural (no assets).
// Copy this into src/lesson/lesson.tsx of a `faraday new --3d` project to use it.
// Shows the "cell" mood + composing raw R3F meshes inside <Scene3D>.
import { useMemo, useState } from "react";
import { Lesson, Prose, Workbench, ControlGroup, ParamSlider, ParamSwitch, Callout, Quiz } from "@faraday-academy/kit/blocks";
import { Scene3D, Label3D } from "@faraday-academy/three";

const R = 5; // cell radius

function Membrane() {
  return (
    <mesh>
      <sphereGeometry args={[R, 64, 64]} />
      <meshStandardMaterial color="#5eead4" transparent opacity={0.1} depthWrite={false} side={2} />
    </mesh>
  );
}

function Nucleus() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[1.7, 48, 48]} />
        <meshStandardMaterial color="#a78bfa" transparent opacity={0.85} />
      </mesh>
      {/* nucleolus */}
      <mesh position={[0.4, 0.2, 0.3]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial color="#7c3aed" />
      </mesh>
    </group>
  );
}

function Mitochondrion({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  return (
    <mesh position={position} rotation={rotation}>
      <capsuleGeometry args={[0.28, 0.85, 8, 20]} />
      <meshStandardMaterial color="#fb923c" emissive="#f97316" emissiveIntensity={0.25} />
    </mesh>
  );
}

function seededOrganelles(count: number) {
  // deterministic-ish placement inside the membrane (Math.random ok in browser)
  return Array.from({ length: count }, (_, i) => {
    const r = 2.4 + (i % 3) * 0.7;
    const theta = i * 2.399; // golden-angle-ish spread
    const y = Math.sin(i * 1.3) * 2.2;
    const rad = Math.sqrt(Math.max(0, r * r - y * y * 0.3));
    return {
      position: [rad * Math.cos(theta), y, rad * Math.sin(theta)] as [number, number, number],
      rotation: [i * 0.7, i * 1.1, i * 0.4] as [number, number, number],
    };
  });
}

export default function CellLesson() {
  const [labels, setLabels] = useState(true);
  const [rotate, setRotate] = useState(true);
  const [mito, setMito] = useState(5);
  const [showNucleus, setShowNucleus] = useState(true);

  const mitochondria = useMemo(() => seededOrganelles(mito), [mito]);

  const reset = () => {
    setLabels(true);
    setRotate(true);
    setMito(5);
    setShowNucleus(true);
  };

  return (
    <Lesson
      topic="Biology"
      title="Inside an animal cell"
      lead="A stylized, code-generated cell. Rotate to look inside the translucent membrane; the organelles are all procedural geometry — no 3D models."
    >
      <Prose>
        <p>
          The <strong>membrane</strong> encloses everything. The <strong>nucleus</strong> holds the
          cell's DNA; the orange <strong>mitochondria</strong> are its power plants. Explore the
          structure from the control panel.
        </p>
      </Prose>

      <Workbench
        title="Cell"
        panelTitle="Explore"
        onReset={reset}
        controls={
          <>
            <ControlGroup label="View">
              <ParamSwitch label="Labels" checked={labels} onChange={setLabels} />
              <ParamSwitch label="Auto-rotate" checked={rotate} onChange={setRotate} />
            </ControlGroup>
            <ControlGroup label="Structure">
              <ParamSlider label="Mitochondria" value={mito} min={0} max={9} onChange={setMito} />
              <ParamSwitch label="Show nucleus" checked={showNucleus} onChange={setShowNucleus} />
            </ControlGroup>
          </>
        }
      >
        <Scene3D mood="cell" height={440} camera={[0, 3, 14]} autoRotate={rotate}>
          <Membrane />
          {showNucleus ? <Nucleus /> : null}
          {mitochondria.map((m, i) => (
            <Mitochondrion key={i} position={m.position} rotation={m.rotation} />
          ))}
          {labels ? (
            <>
              <Label3D position={[0, 2.1, 0]}>Nucleus</Label3D>
              {mitochondria[0] ? <Label3D position={mitochondria[0].position}>Mitochondrion</Label3D> : null}
              <Label3D position={[0, -R - 0.2, 0]}>Membrane</Label3D>
            </>
          ) : null}
        </Scene3D>
      </Workbench>

      <Callout title="Why 'stylized' beats photoreal here">
        A clear, labelled diagram teaches structure better than a realistic render — you can see and
        name each organelle. That's exactly why procedural geometry is a good fit for teaching.
      </Callout>

      <Quiz
        question="Which organelle is described as the cell's 'power plant'?"
        options={[
          { label: "Nucleus", hint: "The nucleus stores DNA." },
          { label: "Mitochondrion", correct: true, hint: "Right — it produces the cell's energy (ATP)." },
          { label: "Membrane", hint: "The membrane is the outer boundary." },
        ]}
      />
    </Lesson>
  );
}
