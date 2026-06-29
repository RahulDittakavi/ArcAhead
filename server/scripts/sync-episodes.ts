/* ============================================================================
   sync-episodes — fetch the current One Piece episode count from AniList and
   patch timeline.json + arcs.json in-place.

   Run manually:
     npm run sync:episodes

   What it touches:
     timeline.json   → series.episodes, last saga's toEp
     arcs.json       → last arc's end + watch runtime

   What it does NOT touch:
     arc definitions, filler classification, summaries — those are curated via
     the Google Sheet + sync:kb flow.

   The script never goes backwards. If AniList returns a count <= what's stored,
   it exits cleanly with no writes.
   ============================================================================ */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(DIR, "../data");

// AniList: One Piece MAL ID 21. nextAiringEpisode.episode is NEXT ep,
// so current = that - 1. If null (series done), fall back to episodes field.
const QUERY = `
  query {
    Media(idMal: 21, type: ANIME) {
      episodes
      nextAiringEpisode {
        episode
        airingAt
      }
    }
  }
`;

async function fetchAiredCount(): Promise<number> {
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ query: QUERY }),
  });
  if (!res.ok) throw new Error(`AniList responded ${res.status} ${res.statusText}`);
  const body = await res.json() as { data: { Media: { episodes: number | null; nextAiringEpisode: { episode: number; airingAt: number } | null } } };
  const media = body.data.Media;
  if (media.nextAiringEpisode) return media.nextAiringEpisode.episode - 1;
  if (media.episodes) return media.episodes;
  throw new Error("AniList returned neither nextAiringEpisode nor episodes count");
}

function fmtWatch(eps: number): string {
  const mins = eps * 24;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

async function main() {
  const aired = await fetchAiredCount();
  console.log(`AniList: ${aired} episodes aired`);

  // ── timeline.json ──────────────────────────────────────────────────────────
  const tlPath = path.join(DATA_DIR, "timeline.json");
  const tl = JSON.parse(readFileSync(tlPath, "utf8")) as {
    series: { episodes: number };
    sagas: Array<{ name: string; toEp: number }>;
  };

  const stored = tl.series.episodes;
  if (aired <= stored) {
    console.log(`No update needed — stored count (${stored}) is already current.`);
    return;
  }

  console.log(`Updating: ${stored} → ${aired}`);

  tl.series.episodes = aired;
  // Extend the last saga's toEp to match
  const lastSaga = tl.sagas[tl.sagas.length - 1];
  if (lastSaga.toEp < aired) lastSaga.toEp = aired;
  writeFileSync(tlPath, JSON.stringify(tl, null, 2) + "\n", "utf8");
  console.log(`  ✓ timeline.json  (series.episodes=${aired}, ${lastSaga.name} toEp=${lastSaga.toEp})`);

  // ── arcs.json ──────────────────────────────────────────────────────────────
  const arcsPath = path.join(DATA_DIR, "arcs.json");
  const arcs = JSON.parse(readFileSync(arcsPath, "utf8")) as Array<{
    id: string; end: number; start: number; watch: string;
  }>;

  const last = arcs[arcs.length - 1];
  if (last.end < aired) {
    const prevEnd = last.end;
    last.end = aired;
    last.watch = fmtWatch(last.end - last.start + 1);
    writeFileSync(arcsPath, JSON.stringify(arcs, null, 2) + "\n", "utf8");
    console.log(`  ✓ arcs.json      (${last.id}: end ${prevEnd} → ${aired}, watch=${last.watch})`);
  } else {
    console.log(`  · arcs.json      last arc (${last.id}) already ends at ${last.end} — skipped`);
  }

  console.log("\nDone. Review `git diff server/data/` then commit + push.");
}

main().catch((e) => {
  console.error("sync-episodes failed:", (e as Error).message);
  process.exit(1);
});
