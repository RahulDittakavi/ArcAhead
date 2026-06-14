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
} from "@arcahead/shared";
import {
  ArcsFileSchema,
  CharactersFileSchema,
  ReactionsFileSchema,
  MilestonesFileSchema,
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

// ---- cross-checks: a single series, everything tied to it ----
const SERIES_ID = timeline.series.id;
const stray = [
  ...arcs.filter((a) => a.seriesId !== SERIES_ID),
  ...characters.filter((c) => c.seriesId !== SERIES_ID),
].map((x) => x.id);
if (stray.length) {
  throw new Error(`KB: records reference an unknown series: ${stray.join(", ")}`);
}

console.log(
  `KB loaded: ${arcs.length} arcs · ${characters.length} characters · ${milestones.length} milestones · ${reactions.length} reactions`
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
};
