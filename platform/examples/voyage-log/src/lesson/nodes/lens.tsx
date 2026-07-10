// Node 5 — Gravitational lensing.
//
// Uses the thin-lens equation for a point-mass lens:
//     β = θ − θ_E² / θ,      θ_E² = (4GM/c²) · (D_ls / (D_l · D_s))
// where β is the source's true angular offset, θ the observed image angle, and
// θ_E is the Einstein radius. Two solutions θ± give two images either side of
// the lens; when β → 0, they merge into an Einstein ring.
//
// We visualise this in a 3D <Scene3D>: mass at origin, source behind it, and
// two bent light paths (source → deflection point → observer/camera). Aligning
// the source reveals a symmetric "ring" made of a ring of impact points.
import { useMemo, useState } from "react";
import { Line } from "@react-three/drei";
import { Lesson, Prose, Workbench, ControlGroup, ParamSlider, Callout, Quiz, Stat } from "@/faraday/blocks";
import { Scene3D, Body, Label3D } from "@/faraday/three";
import { useNode } from "@/faraday/world";

type Vec3 = [number, number, number];

const D_L = 8; // observer ← lens distance
const D_S = 16; // observer ← source distance
const D_LS = D_S - D_L; // lens ← source distance

/** Solve β = θ - θ_E² / θ for θ (returns [θ_plus, θ_minus] with θ_+ > 0). */
function solveThetas(beta: number, thetaE: number): [number, number] {
  const disc = Math.sqrt(beta * beta + 4 * thetaE * thetaE);
  return [(beta + disc) / 2, (beta - disc) / 2];
}

export default function LensLesson() {
  const { complete } = useNode();
  // Mass sets Einstein radius (scaled to toy units). Source offset in the same units.
  const [mass, setMass] = useState(1.2); // → sets thetaE
  const [betaAngle, setBetaAngle] = useState(0.15); // radians (small, ~ tan θ ≈ θ)

  const model = useMemo(() => {
    // thetaE in radians: pick a scaling so mass=1 gives thetaE ≈ 0.18 rad.
    const thetaE = 0.18 * Math.sqrt(mass);
    const [thetaP, thetaM] = solveThetas(betaAngle, thetaE);

    // Observer at (0,0,0) looking down +z. Lens at (0,0,D_L). Source at (D_S * β, 0, D_S).
    const observer: Vec3 = [0, 0, 0];
    const lensCenter: Vec3 = [0, 0, D_L];
    const sourcePos: Vec3 = [D_S * betaAngle, 0, D_S];

    // Impact points on the lens plane for the two images: x = D_L * θ, z = D_L.
    const impactP: Vec3 = [D_L * thetaP, 0, D_L];
    const impactM: Vec3 = [D_L * thetaM, 0, D_L];

    // Ring is centred on lens & has radius D_L * thetaE in the lens plane.
    const ringRadius = D_L * thetaE;
    const ringPoints: Vec3[] = [];
    const N = 96;
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * Math.PI * 2;
      ringPoints.push([ringRadius * Math.cos(t), ringRadius * Math.sin(t), D_L]);
    }

    // A little "photon" travels source → impact → observer (piecewise straight),
    // slightly separated in y so we can see two beams clearly.
    const pathP: Vec3[] = [
      [sourcePos[0], sourcePos[1] + 0.02, sourcePos[2]],
      [impactP[0], impactP[1] + 0.02, impactP[2]],
      [observer[0], observer[1] + 0.02, observer[2]],
    ];
    const pathM: Vec3[] = [
      [sourcePos[0], sourcePos[1] - 0.02, sourcePos[2]],
      [impactM[0], impactM[1] - 0.02, impactM[2]],
      [observer[0], observer[1] - 0.02, observer[2]],
    ];

    return { thetaE, thetaP, thetaM, observer, lensCenter, sourcePos, impactP, impactM, ringPoints, pathP, pathM, ringRadius, aligned: Math.abs(betaAngle) < 0.02 };
  }, [mass, betaAngle]);

  const reset = () => {
    setMass(1.2);
    setBetaAngle(0.15);
  };

  return (
    <Lesson
      topic="Voyage Log · Node 5"
      title="Light Bend — from double images to a ring"
      lead="Mass deflects light. Line a background source up behind a massive body and you don't see one image — you see two, or a full ring."
    >
      <Prose>
        <p>
          A star or galaxy behind a massive object sends light around it on both
          sides. For a thin, point-mass lens, the two observed image angles
          <code> θ_±</code> satisfy <code>β = θ − θ_E²/θ</code>, where{" "}
          <code>β</code> is the source's true angular offset and <code>θ_E</code> is
          the <em>Einstein radius</em>. When <code>β → 0</code>, the two images
          merge into a symmetric ring around the lens.
        </p>
      </Prose>

      <Workbench
        title="Lens plane (bird's-eye)"
        panelTitle="Geometry"
        onReset={reset}
        controls={
          <>
            <ControlGroup label="Lens">
              <ParamSlider label="Mass (toy units)" value={mass} min={0.1} max={4} step={0.05} onChange={setMass} format={(v) => v.toFixed(2)} />
            </ControlGroup>
            <ControlGroup label="Background source">
              <ParamSlider label="Source offset β" value={betaAngle} min={-0.4} max={0.4} step={0.005} onChange={setBetaAngle} format={(v) => v.toFixed(3)} />
            </ControlGroup>
          </>
        }
      >
        <Scene3D mood="space" height={420} camera={[6, 5, -2]} fov={55}>
          {/* Observer marker at origin */}
          <Body position={model.observer} radius={0.18} color="#94a3b8" />
          <Label3D position={[0, 0.5, 0]}>observer</Label3D>

          {/* Lens mass */}
          <Body position={model.lensCenter} radius={0.7} color="#1f2937" emissive="#4c1d95" emissiveIntensity={0.35} />
          <Label3D position={[model.lensCenter[0], model.lensCenter[1] + 1.2, model.lensCenter[2]]}>lens (mass)</Label3D>

          {/* Source */}
          <Body position={model.sourcePos} radius={0.28} color="#fef08a" emissive="#f59e0b" emissiveIntensity={0.9} />
          <Label3D position={[model.sourcePos[0], model.sourcePos[1] + 0.7, model.sourcePos[2]]}>source</Label3D>

          {/* Einstein ring (in the lens plane) */}
          <Line points={model.ringPoints} color="#5eead4" lineWidth={1} transparent opacity={model.aligned ? 0.95 : 0.35} />

          {/* Bent photon paths */}
          <Line points={model.pathP} color="#fbbf24" lineWidth={2} />
          <Line points={model.pathM} color="#f472b6" lineWidth={2} />

          {/* Impact-point markers (the two visible images) */}
          <mesh position={model.impactP}>
            <sphereGeometry args={[0.12, 20, 20]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.7} />
          </mesh>
          <mesh position={model.impactM}>
            <sphereGeometry args={[0.12, 20, 20]} />
            <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.7} />
          </mesh>
        </Scene3D>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat label="Einstein radius θ_E" value={model.thetaE.toFixed(3)} />
          <Stat label="Image θ_+" value={model.thetaP.toFixed(3)} />
          <Stat label="Image θ_−" value={model.thetaM.toFixed(3)} />
        </div>
      </Workbench>

      <Callout title="When you see a ring">
        As you drag <code>β</code> toward zero (source directly behind the lens), the
        two image points <code>θ_+</code> and <code>θ_−</code> merge, and by rotational
        symmetry the image opens into a full <em>Einstein ring</em> of angular
        radius <code>θ_E</code>. Higher mass ⇒ larger <code>θ_E</code> ⇒ wider ring.
      </Callout>

      <Quiz
        onCorrect={complete}
        question="You see an exact ring of light around a foreground galaxy. What does this tell you?"
        options={[
          { label: "The galaxy is transparent.", hint: "Light isn't passing through the galaxy — it's bending around it." },
          { label: "There's another galaxy behind, precisely aligned with the foreground mass.", correct: true, hint: "Perfect alignment collapses the two images into a symmetric Einstein ring." },
          { label: "Nothing — rings are decorative artifacts.", hint: "Einstein rings are real observations (e.g. Hubble, JWST)." },
          { label: "Light has slowed down inside the galaxy.", hint: "The bending is a geometric effect from curved spacetime, not slowing." },
        ]}
      />
    </Lesson>
  );
}
