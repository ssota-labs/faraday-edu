// Voyage Log — C-B curriculum demo. A 3D star-map of six labs that walk the
// learner from Kepler orbits through gravitational time dilation and clock
// synchronization. World shape comes from world3dPack (mood="space"); content
// comes from the six lesson files in ./nodes.
//
// The curriculum object is intentionally at module scope: <CourseHost>
// keys progress on stable identity, so recreating this object per render
// would wipe progress. See docs/authoring.md "Curricula & worlds".
import { CourseHost, type Course } from "@faraday-academy/runtime/world";
import { world3dPack } from "@faraday-academy/three";

import KeplerLesson from "./nodes/kepler";
import SlingshotLesson from "./nodes/slingshot";
import ElevatorLesson from "./nodes/elevator";
import DilationLesson from "./nodes/dilation";
import LensLesson from "./nodes/lens";
import SyncLesson from "./nodes/sync";

const course: Course = {
  title: "Voyage Log · 항해 일지",
  nodes: [
    {
      id: "kepler",
      title: "Kepler Orbit",
      summary: "Equal areas in equal times — Kepler's 2nd law.",
      meta: { x: 12, y: 50 },
      reward: { xp: 10 },
      lesson: <KeplerLesson />,
    },
    {
      id: "slingshot",
      title: "Gravity Assist",
      summary: "Trade planet velocity for spacecraft velocity.",
      requires: ["kepler"],
      meta: { x: 32, y: 28 },
      reward: { xp: 15 },
      lesson: <SlingshotLesson />,
    },
    {
      id: "elevator",
      title: "Equivalence Elevator",
      summary: "Acceleration in deep space vs standing in gravity.",
      requires: ["slingshot"],
      meta: { x: 52, y: 28 },
      reward: { xp: 15 },
      lesson: <ElevatorLesson />,
    },
    {
      id: "dilation",
      title: "Time Dilation",
      summary: "Clocks run slower deep in a gravity well.",
      requires: ["slingshot"],
      meta: { x: 52, y: 72 },
      reward: { xp: 20 },
      lesson: <DilationLesson />,
    },
    {
      id: "lens",
      title: "Light Bend",
      summary: "Mass deflects light — from double images to a ring.",
      requires: ["elevator", "dilation"],
      meta: { x: 72, y: 50 },
      reward: { xp: 20 },
      lesson: <LensLesson />,
    },
    {
      id: "sync",
      title: "Clock Sync",
      summary: "Reconcile two clocks after a round-trip near a well.",
      requires: ["lens"],
      meta: { x: 90, y: 50 },
      reward: { xp: 30 },
      lesson: <SyncLesson />,
    },
  ],
};

export default function VoyageLog() {
  return (
    <CourseHost
      course={curriculum}
      pack={world3dPack}
      onEvent={(e) => console.debug("[voyage]", e.type, "nodeId" in e ? e.nodeId : "", e.progress)}
    />
  );
}
