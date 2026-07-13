// 3D game-view example (v3) — Scene3D stage + dialogue panel.
import { Lecture } from "@faraday-academy/runtime/blocks";
import { GameView3D } from "./game-view";

export default function Preschool3D() {
  return (
    <Lecture
      title="3D counting cave"
      lead="GameView3D template — three.js stage with the same beat panel as 2D GameView."
      views={[
        {
          id: "game",
          label: "Play",
          content: (
            <GameView3D
              storageKey="preschool-3d-demo"
              startSceneId="cave"
              mood="abstract"
              scenes={[
                {
                  id: "cave",
                  props3d: (
                    <>
                      <mesh position={[0, 0.5, 0]}>
                        <sphereGeometry args={[0.6, 24, 24]} />
                        <meshStandardMaterial color="#fbbf24" />
                      </mesh>
                      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                        <planeGeometry args={[10, 10]} />
                        <meshStandardMaterial color="#1e293b" />
                      </mesh>
                    </>
                  ),
                  beats: [
                    { type: "scene" },
                    { type: "dialogue", speaker: "Orb", text: "Welcome to the counting cave!" },
                    { type: "dialogue", speaker: "Orb", text: "How many glowing balls do you see?" },
                    { type: "celebrate", message: "One shiny ball!" },
                  ],
                },
              ]}
            />
          ),
        },
      ]}
    />
  );
}
