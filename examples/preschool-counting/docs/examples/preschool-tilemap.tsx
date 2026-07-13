// Tilemap game-view example (v2) — grid walk on a canvas tilemap layer.
import { Lecture } from "@faraday-academy/runtime/blocks";
import { GameView } from "./game-view";

const meadowMap = [
  [0, 0, 1, 1, 1, 0, 0],
  [0, 1, 1, 2, 1, 1, 0],
  [1, 1, 2, 2, 2, 1, 1],
  [1, 2, 2, 3, 2, 2, 1],
  [0, 1, 1, 2, 1, 1, 0],
];

export default function PreschoolTilemap() {
  return (
    <Lecture
      title="Walk the path"
      lead="Tilemap layer — the character walks tile-by-tile (no PixiJS dep)."
      views={[
        {
          id: "game",
          label: "Play",
          content: (
            <GameView
              storageKey="preschool-tilemap-demo"
              startSceneId="grid"
              scenes={[
                {
                  id: "grid",
                  characters: [{ id: "kid", sprite: "/assets/sprites/kid.png", col: 0, row: 2 }],
                  beats: [
                    {
                      type: "tilemap",
                      config: { cols: 7, rows: 5, map: meadowMap, tileSize: 48, tilesetColumns: 4 },
                    },
                    { type: "dialogue", speaker: "Guide", text: "Walk to the golden tile!" },
                    {
                      type: "tileWalk",
                      characterId: "kid",
                      path: [
                        { col: 1, row: 2 },
                        { col: 2, row: 2 },
                        { col: 3, row: 2 },
                        { col: 3, row: 3 },
                      ],
                    },
                    { type: "celebrate", message: "You made it!" },
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
