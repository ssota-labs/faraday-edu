// Example — real rigid-body physics via @react-three/rapier: balls fall under
// gravity and collide with the floor and each other. Needs the physics variant
// (`faraday pack add three --physics`). Copy into src/lesson/lesson.tsx. AUTHOR
// AREA — rewrite it. The 3D block is a locked dependency.
import { useState } from "react";
import { Physics, RigidBody } from "@react-three/rapier";
import { Lesson, Prose, Workbench, ControlGroup, ParamSlider, Callout, Quiz } from "@faraday-academy/kit/blocks";
import { Button } from "@faraday-academy/kit/ui/button";
import { Scene3D } from "@faraday-academy/three";

const COLORS = ["#8b9cf6", "#5eead4", "#fbbf24", "#fb7185", "#a78bfa", "#38bdf8"];

interface Ball {
  id: number;
  x: number;
  color: string;
}

function Floor() {
  return (
    <RigidBody type="fixed" position={[0, -0.25, 0]} restitution={0.4}>
      <mesh receiveShadow>
        <boxGeometry args={[16, 0.5, 16]} />
        <meshStandardMaterial color="#20242c" />
      </mesh>
    </RigidBody>
  );
}

export default function PhysicsLesson() {
  const [gravity, setGravity] = useState(9.8);
  const [restitution, setRestitution] = useState(0.7);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [nextId, setNextId] = useState(0);

  const addBalls = (count: number) => {
    const fresh = Array.from({ length: count }, (_, k) => ({
      id: nextId + k,
      x: (Math.random() - 0.5) * 6,
      color: COLORS[(nextId + k) % COLORS.length],
    }));
    setBalls((b) => [...b, ...fresh]);
    setNextId((n) => n + count);
  };

  const reset = () => {
    setBalls([]);
    setGravity(9.8);
    setRestitution(0.7);
  };

  return (
    <Lesson
      topic="Physics"
      title="Gravity & collisions"
      lead="A real rigid-body simulation (Rapier). Drop balls and watch them fall, bounce, and pile up. Change gravity and bounciness from the panel."
    >
      <Prose>
        <p>
          Unlike the hand-animated demos, nothing here is scripted — a physics engine integrates the
          motion, resolves every collision, and lets the balls settle on their own.
        </p>
      </Prose>

      <Workbench
        title="Sandbox"
        panelTitle="Physics"
        onReset={reset}
        controls={
          <>
            <ControlGroup label="World">
              <ParamSlider label="Gravity" value={gravity} min={0} max={20} step={0.5} onChange={setGravity} format={(v) => v.toFixed(1)} />
              <ParamSlider label="Bounciness" value={restitution} min={0} max={1} step={0.05} onChange={setRestitution} format={(v) => v.toFixed(2)} />
            </ControlGroup>
            <ControlGroup label="Spawn">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => addBalls(1)}>Drop 1</Button>
                <Button variant="outline" size="sm" onClick={() => addBalls(8)}>Drop 8</Button>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setBalls([])}>Clear ({balls.length})</Button>
            </ControlGroup>
          </>
        }
      >
        <Scene3D mood="physics" height={460} camera={[0, 6, 15]} controls>
          <Physics gravity={[0, -gravity, 0]}>
            <Floor />
            {balls.map((ball) => (
              <RigidBody key={ball.id} colliders="ball" restitution={restitution} position={[ball.x, 9, 0]}>
                <mesh castShadow>
                  <sphereGeometry args={[0.6, 32, 32]} />
                  <meshStandardMaterial color={ball.color} />
                </mesh>
              </RigidBody>
            ))}
          </Physics>
        </Scene3D>
      </Workbench>

      <Callout title="Try it">
        Set gravity to 0 and drop a few balls — they drift instead of falling. Crank bounciness to 1
        and they never lose energy.
      </Callout>

      <Quiz
        question="What does the physics engine compute that a hand-animated scene doesn't?"
        options={[
          { label: "The colours of the balls", hint: "Those are set in code." },
          { label: "Collisions and resulting motion", correct: true, hint: "Right — it resolves contacts and integrates motion each frame." },
          { label: "The camera angle", hint: "That's just OrbitControls." },
        ]}
      />
    </Lesson>
  );
}
