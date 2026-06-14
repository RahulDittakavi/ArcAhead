# Image assets

Drop image files here with the **exact filenames** below. Vite serves this
folder at `/uploads/...`, and the IMAGES registry (`web/src/lib/images.ts`)
already points at these names — so each file appears as soon as you add it.
Missing files fall back to a labelled placeholder (no broken images).

## Filenames the app expects

| Filename | Used for |
|---|---|
| `hero-banner.png` | Landing hero banner (wide crew-on-ship shot) |
| `poster.jpg` | "Now tracking" poster (crew together) |
| `carousel-1.png` | Landing carousel slide 1 (scenery) |
| `carousel-2.png` | Landing carousel slide 2 (scenery) |
| `carousel-3.png` | Landing carousel slide 3 (scenery) |

> Extensions must match exactly — the registry references these names. If you
> re-export as a different format, update `web/src/lib/images.ts` to match.
| `luffy.jpg` | Luffy portrait (bounty poster + detail) |
| `zoro.jpg` | Zoro portrait |
| `nami.jpg` | Nami portrait |
| `sanji.jpg` | Sanji portrait |
| `robin.jpg` | Robin portrait |
| `chopper.jpg` | Chopper portrait |
| `alabasta.jpg` | Alabasta arc banner |
| `enies-lobby.jpg` | Enies Lobby arc banner |
| `marineford.jpg` | Marineford arc banner (future/fogged) |
| `wano.jpg` | Wano arc banner (future/fogged) |
| `ship.png` | Progress marker ship sprite (transparent PNG ideal) |

Portraits crop to the face via per-character framing in `BountyPoster.tsx`
(`MUG_FRAME`) — tweak there if a crop sits oddly.
