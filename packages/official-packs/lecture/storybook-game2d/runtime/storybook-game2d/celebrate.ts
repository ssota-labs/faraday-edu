import { getAudioManager } from "../game2d";

/** Fire the shared success cue (register via StorybookGame `successSound` first). */
export function celebrate() {
  getAudioManager().play("storybook-success");
}
