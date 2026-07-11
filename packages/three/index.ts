// Opt-in 3D entry. Import from "@faraday-academy/three" ONLY in lessons that need 3D —
// this is the boundary that keeps three/R3F out of 2D lesson bundles.
// For loading .glb assets, use drei's useGLTF directly (see docs/authoring.md).
export { Scene3D } from "./scene";
export { Body, OrbitPath, Planet, Label3D } from "./helpers";
export { Model } from "./model";
export { MOOD_NAMES, type Mood } from "./moods";
export { world3dPack, createWorld3dPack } from "./world3d";
