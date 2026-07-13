// Full-screen storybook lesson — no reading column, no page header.
import { GameView } from "./game-view";
import { AppleCountMission } from "./AppleCountMission";

const kidSprite =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96"><circle cx="32" cy="20" r="14" fill="#fbbf24"/><rect x="20" y="34" width="24" height="36" rx="8" fill="#3b82f6"/><rect x="16" y="70" width="10" height="22" rx="4" fill="#1e40af"/><rect x="38" y="70" width="10" height="22" rx="4" fill="#1e40af"/></svg>',
  );

const bearSprite =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><circle cx="40" cy="40" r="28" fill="#92400e"/><circle cx="28" cy="28" r="10" fill="#92400e"/><circle cx="52" cy="28" r="10" fill="#92400e"/><circle cx="32" cy="38" r="4" fill="#1c1917"/><circle cx="48" cy="38" r="4" fill="#1c1917"/></svg>',
  );

export default function PreschoolCountingLesson() {
  return (
    <GameView
      immersive
      title="Count with Bear"
      resume={false}
      storageKey="preschool-count-live"
      startSceneId="meadow"
      scenes={[
        {
          id: "meadow",
          characters: [
            { id: "kid", sprite: kidSprite, x: 12, y: 78 },
            { id: "bear", sprite: bearSprite, x: 78, y: 76, width: "20%" },
          ],
          beats: [
            { type: "scene", backgroundColor: "oklch(0.62 0.16 145)" },
            { type: "dialogue", speaker: "Bear", text: "Hi! Let's count together." },
            { type: "move", characterId: "kid", x: 38, y: 78, durationMs: 900 },
            { type: "dialogue", speaker: "Bear", text: "Can you fill the basket?" },
            {
              type: "interaction",
              title: "Count the apples",
              hint: "One tap = one apple.",
              celebrateOnComplete: false,
              content: <AppleCountMission />,
            },
            { type: "celebrate", message: "Great counting!", advanceAfterMs: 1400 },
            { type: "dialogue", speaker: "Bear", text: "Three apples! Well done!" },
          ],
        },
      ]}
    />
  );
}
