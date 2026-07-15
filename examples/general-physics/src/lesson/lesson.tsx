// Assembly — the Newtonian Mechanics **Course** as a graph, presented through an
// immersive 2D map course shell (map2dPack). Each node is a **Lecture** that lives in
// its own file under lectures/ and offers both a SlideView and a TextbookView.
// Plan of record: .faraday/plan/newtonian-mechanics/.
//
// Prerequisite graph (a real branch + join):
//   kinematics → first-law → second-law → third-law ┐
//                                  └────→ friction  ┴→ incline
import { CourseHost, type Course } from "@faraday-academy/kit/world";
import { map2dPack } from "./map2d";

import Kinematics from "./lectures/kinematics";
import FirstLaw from "./lectures/first-law";
import SecondLaw from "./lectures/second-law";
import ThirdLaw from "./lectures/third-law";
import Friction from "./lectures/friction";
import Incline from "./lectures/incline";

// Module scope — REQUIRED. Recreating this object inside the component resets progress.
const course: Course = {
  title: "Newtonian Mechanics",
  nodes: [
    {
      id: "kinematics",
      title: "Motion",
      summary: "Position, velocity, acceleration and the constant-acceleration equations.",
      meta: { x: 10, y: 50 },
      reward: { xp: 10 },
      lesson: <Kinematics />,
    },
    {
      id: "first-law",
      title: "1st Law · Inertia",
      summary: "Zero net force means constant velocity. Equilibrium and the impetus misconception.",
      requires: ["kinematics"],
      meta: { x: 28, y: 50 },
      reward: { xp: 10 },
      lesson: <FirstLaw />,
    },
    {
      id: "second-law",
      title: "2nd Law · F = ma",
      summary: "Acceleration is proportional to net force and inversely to mass.",
      requires: ["first-law"],
      meta: { x: 46, y: 50 },
      reward: { xp: 15 },
      lesson: <SecondLaw />,
    },
    {
      id: "third-law",
      title: "3rd Law · Pairs",
      summary: "Equal and opposite forces on different bodies; unequal masses, unequal recoil.",
      requires: ["second-law"],
      meta: { x: 68, y: 28 },
      reward: { xp: 15 },
      lesson: <ThirdLaw />,
    },
    {
      id: "friction",
      title: "Friction",
      summary: "Static friction grips up to μ_s·N, then kinetic friction μ_k·N takes over.",
      requires: ["second-law"],
      meta: { x: 68, y: 72 },
      reward: { xp: 15 },
      lesson: <Friction />,
    },
    {
      id: "incline",
      title: "The Incline",
      summary: "Resolve gravity on a ramp and find the critical slip angle θ_c = arctan(μ_s).",
      requires: ["third-law", "friction"],
      meta: { x: 88, y: 50 },
      reward: { xp: 25 },
      lesson: <Incline />,
    },
  ],
};

export default function NewtonianMechanics() {
  return (
    <CourseHost
      course={course}
      pack={map2dPack}
      onEvent={(e) => console.debug("[course]", e.type, "nodeId" in e ? e.nodeId : "", e.progress)}
    />
  );
}
