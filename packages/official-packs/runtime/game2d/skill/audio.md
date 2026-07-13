# Audio (Howler)

```ts
import { getAudioManager, disposeAudioManager, game2dAsset } from "./game2d";

const audio = getAudioManager();
audio.register("success", game2dAsset("ui-pack/Sounds/click-a.ogg"));
audio.play("success");

// on stage unmount / leaving the slide:
disposeAudioManager();
```

- Keep SFX short; prefer `.ogg` + `.mp3` fallbacks when you care about Safari.
- Respect mute: wire a lesson control to `audio.setMuted(true)`.
- Don't autoplay music with sound on — browsers block it; start after a tap.
