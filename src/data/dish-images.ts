import bento from "@/assets/dish-bento.jpg";
import california from "@/assets/dish-california-roll.jpg";
import dragon from "@/assets/dish-dragon-roll.jpg";
import rainbow from "@/assets/dish-rainbow-roll.jpg";

export const dishImagePool = [dragon, rainbow, california, bento];

const keyed: [string, string][] = [
  ["dragon", dragon],
  ["rainbow", rainbow],
  ["california", california],
  ["bento", bento],
  ["sashimi", rainbow],
  ["plateau", rainbow],
  ["aromaki", dragon],
  ["maki", dragon],
  ["sushi", california],
  ["tempura", bento],
  ["crevette", bento],
  ["ramen", bento],
  ["poké", bento],
  ["poke", bento],
  ["gyoza", bento],
];

/** Retourne une photo gastronomique cohérente avec le nom du plat. */
export function dishImage(name: string | undefined, fallbackIndex = 0): string {
  const n = (name ?? "").toLowerCase();
  for (const [k, img] of keyed) if (n.includes(k)) return img;
  return dishImagePool[fallbackIndex % dishImagePool.length]!;
}
