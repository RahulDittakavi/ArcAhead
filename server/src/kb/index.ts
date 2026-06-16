/* ============================================================================
   Knowledge base loader — the authoritative content source.

   Reads the curated JSON files once at boot, validates every record against the
   Zod schemas, and exposes typed, read-only accessors. If validation fails the
   thrown error aborts startup (fail-closed): we never serve unvalidated content.
   ============================================================================ */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  ArcRecord,
  CharacterRecord,
  SeriesRecord,
  SagaRecord,
  MilestoneRecord,
  EpisodeClassRecord,
  EpisodeClassification,
} from "@arcahead/shared";
import {
  ArcsFileSchema,
  CharactersFileSchema,
  ReactionsFileSchema,
  MilestonesFileSchema,
  EpisodeClassFileSchema,
  TimelineSchema,
} from "./schema.js";

export interface ReactionRecord {
  id: number;
  seriesId: string;
  user: string;
  arc: string;
  text: string;
  hype: number;
  ago: string;
}

// data/ sits one level above this module's parent dir (src/kb → server/data,
// dist/kb → server/data). Override with KB_DIR if you relocate the KB.
const KB_DIR =
  process.env.KB_DIR ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../data");

function readJson(file: string): unknown {
  const full = path.join(KB_DIR, file);
  try {
    return JSON.parse(readFileSync(full, "utf8"));
  } catch (e) {
    throw new Error(`KB: failed to read/parse ${full}: ${(e as Error).message}`);
  }
}

function parseOrThrow<T>(file: string, schema: { parse: (v: unknown) => T }): T {
  try {
    return schema.parse(readJson(file));
  } catch (e) {
    // Zod errors are already descriptive; prefix with the file so boot logs point
    // straight at the offending KB file.
    throw new Error(`KB: validation failed for ${file}:\n${(e as Error).message}`);
  }
}

// ---- load + validate at module init (boot) ----
const timeline = parseOrThrow("timeline.json", TimelineSchema);
const arcs = parseOrThrow("arcs.json", ArcsFileSchema) as ArcRecord[];
const characters = parseOrThrow("characters.json", CharactersFileSchema) as CharacterRecord[];
const reactions = parseOrThrow("reactions.json", ReactionsFileSchema) as ReactionRecord[];
const milestones = parseOrThrow("milestones.json", MilestonesFileSchema) as MilestoneRecord[];
const episodeClass = parseOrThrow("episode-class.json", EpisodeClassFileSchema) as EpisodeClassRecord[];

// ---- cross-checks: a single series, everything tied to it ----
const SERIES_ID = timeline.series.id;
const stray = [
  ...arcs.filter((a) => a.seriesId !== SERIES_ID),
  ...characters.filter((c) => c.seriesId !== SERIES_ID),
  ...episodeClass.filter((e) => e.seriesId !== SERIES_ID),
].map((x) => ("id" in x ? x.id : `${x.from}-${x.to}`));
if (stray.length) {
  throw new Error(`KB: records reference an unknown series: ${stray.join(", ")}`);
}

// ---- episode-class overlay: sort + reject overlaps (fail-closed) ----
// Overlapping ranges would make classification ambiguous; refuse to boot rather
// than resolve unpredictably. Lookups assume this sorted, disjoint invariant.
const episodeClassSorted = [...episodeClass].sort((a, b) => a.from - b.from);
for (let i = 1; i < episodeClassSorted.length; i++) {
  const prev = episodeClassSorted[i - 1];
  const cur = episodeClassSorted[i];
  if (cur.from <= prev.to) {
    throw new Error(
      `KB: episode-class ranges overlap: [${prev.from}-${prev.to}] and [${cur.from}-${cur.to}]`
    );
  }
}

console.log(
  `KB loaded: ${arcs.length} arcs · ${characters.length} characters · ${milestones.length} milestones · ${reactions.length} reactions · ${episodeClass.length} class overrides`
);

// ---- accessors (return copies/sorted views so callers can't mutate the KB) ----
export const kb = {
  seriesId: SERIES_ID,
  series(): SeriesRecord {
    return timeline.series;
  },
  sagas(): SagaRecord[] {
    return [...timeline.sagas].sort((a, b) => a.order - b.order);
  },
  arcs(): ArcRecord[] {
    return [...arcs].sort((a, b) => a.start - b.start);
  },
  arc(id: string): ArcRecord | null {
    return arcs.find((a) => a.id === id) ?? null;
  },
  characters(): CharacterRecord[] {
    return [...characters].sort((a, b) => a.epaffirst - b.epaffirst);
  },
  character(id: string): CharacterRecord | null {
    return characters.find((c) => c.id === id) ?? null;
  },
  reactions(): ReactionRecord[] {
    return [...reactions];
  },
  milestones(): MilestoneRecord[] {
    return [...milestones].sort((a, b) => a.order - b.order);
  },
  /** Episode-level classification OVERRIDE for episode `n`, or null if no
   *  overlay entry covers it (caller falls back to the arc's `kind`). Ranges are
   *  validated disjoint at boot, so the first containing range is authoritative. */
  episodeClass(n: number): EpisodeClassification | null {
    const hit = episodeClassSorted.find((e) => e.from <= n && n <= e.to);
    return hit ? hit.classification : null;
  },
};
