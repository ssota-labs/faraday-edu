/** Vite public URL under `public/assets/game2d/` (installed via AssetVault). */
export function game2dAsset(...parts: string[]): string {
  const tail = parts.filter(Boolean).join("/");
  return tail ? `/assets/game2d/${tail}` : "/assets/game2d";
}
