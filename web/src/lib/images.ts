/* IMAGES registry — the "reference by semantic key" indirection from the
   prototype. `src` is intentionally empty: the prototype's art is third-party,
   so PlaceImg renders a labelled placeholder until you drop in licensed assets
   (set `src` here by key and it appears everywhere that key is used). */
export interface ImageMeta {
  src?: string;
  type: string;
  dims: string;
  where: string;
}

export const IMAGES: Record<string, ImageMeta> = {
  HERO_STRAWHAT_BANNER: {
    type: "Wide cinematic banner — the full crew aboard the ship",
    dims: "2400 × 1200 (2:1)",
    where: "Landing hero banner",
  },
  ANIME_POSTER_IMAGE: {
    type: "Key art — the crew together ('now tracking' poster)",
    dims: "1500 × 1000 (3:2)",
    where: "Setup / dashboard poster",
  },
  LANDING_CAROUSEL_IMAGE_1: { type: "Scenery — early voyage", dims: "1600 × 1000 (8:5)", where: "Landing carousel 1" },
  LANDING_CAROUSEL_IMAGE_2: { type: "Scenery — mid voyage", dims: "1600 × 1000 (8:5)", where: "Landing carousel 2" },
  LANDING_CAROUSEL_IMAGE_3: { type: "Scenery — sweeping shot", dims: "1600 × 1000 (8:5)", where: "Landing carousel 3" },

  LUFFY_CHARACTER_IMAGE: { type: "Portrait — captain", dims: "900 × 1100", where: "Bounty poster / detail" },
  ZORO_CHARACTER_IMAGE: { type: "Portrait — swordsman", dims: "900 × 1100", where: "Bounty poster / detail" },
  NAMI_CHARACTER_IMAGE: { type: "Portrait — navigator", dims: "900 × 1100", where: "Bounty poster / detail" },
  SANJI_CHARACTER_IMAGE: { type: "Portrait — cook", dims: "900 × 1100", where: "Bounty poster / detail" },
  ROBIN_CHARACTER_IMAGE: { type: "Portrait — archaeologist", dims: "900 × 1100", where: "Bounty poster / detail" },
  CHOPPER_CHARACTER_IMAGE: { type: "Portrait — doctor", dims: "900 × 1100", where: "Bounty poster / detail" },

  ARC_BANNER_ALABASTA: { type: "Arc key art — desert kingdom", dims: "1600 × 900 (16:9)", where: "Arc card / hero" },
  ARC_BANNER_ENIES_LOBBY: { type: "Arc key art — fortress island", dims: "1600 × 900 (16:9)", where: "Arc card / hero" },
  ARC_BANNER_MARINEFORD: { type: "Arc key art — distant island", dims: "1600 × 900 (16:9)", where: "Arc card / hero" },
  ARC_BANNER_WANO: { type: "Arc key art — distant island", dims: "1600 × 900 (16:9)", where: "Arc card / hero" },

  SHIP_PROGRESS_IMAGE: { type: "Ship sprite, transparent PNG", dims: "640 × 480", where: "Progress marker" },
};

/** Map a character id → its portrait registry key (matches seed `img`). */
export const CHAR_IMAGE: Record<string, string> = {
  luffy: "LUFFY_CHARACTER_IMAGE",
  zoro: "ZORO_CHARACTER_IMAGE",
  nami: "NAMI_CHARACTER_IMAGE",
  sanji: "SANJI_CHARACTER_IMAGE",
  robin: "ROBIN_CHARACTER_IMAGE",
  chopper: "CHOPPER_CHARACTER_IMAGE",
};
