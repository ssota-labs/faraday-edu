// Registers the Pixi classes this pack uses with @pixi/react's extend() catalogue.
// Import once from Game2D (or any entry) before rendering pixi* JSX.
import { extend } from "@pixi/react";
import {
  AnimatedSprite,
  Container,
  Graphics,
  Sprite,
  Text,
  TilingSprite,
} from "pixi.js";

let extended = false;

/** Idempotent — safe to call from multiple modules. */
export function extendGame2D() {
  if (extended) return;
  extend({
    Container,
    Graphics,
    Sprite,
    Text,
    AnimatedSprite,
    TilingSprite,
  });
  extended = true;
}
