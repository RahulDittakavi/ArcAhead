/* ============================================================================
   @arcahead/shared — the API contract.
   These types are the single source of truth shared by server and web.

   Naming convention:
   - `*Record`  = the full, unfiltered shape as stored in the DB.
   - `*Dto`     = the spoiler-FILTERED shape that may leave the server. Fields
                  that the Spoiler Shield can strip are optional/nullable here,
                  so the compiler reminds you they may be absent.
   ============================================================================ */

export type ArcStatus = "done" | "current" | "future";

// ---------------------------------------------------------------------------
// Series
// ---------------------------------------------------------------------------
export interface SeriesRecord {
  id: string;
  title: string;
  episodes: number;
  year: number;
  tracked: number;
  score: number;
  hue: number;
  tagline: string;
  tag: string;
}

// ---------------------------------------------------------------------------
// Arc ("island")
// ---------------------------------------------------------------------------
export interface ArcRecord {
  id: string;
  seriesId: string;
  name: string;
  island: string;
  saga: string;
  start: number;
  end: number;
  rating: number;
  summary: string;
  moments: string[];
  watch: string;
  future: boolean;
  banner: string | null;
}

/**
 * Spoiler-filtered arc. For `future` arcs the server strips the payload:
 * `summary`, `moments`, `rating`, and `banner` come back null/undefined.
 * `island`/`name` are still sent (the client blurs them client-side per the
 * design), but everything that would reveal plot is gone before the wire.
 */
export interface ArcDto {
  id: string;
  name: string;
  island: string;
  saga: string;
  start: number;
  end: number;
  watch: string;
  status: ArcStatus;
  hype: number;
  hasBanner: boolean;
  // present only when status !== "future"
  summary?: string;
  moments?: string[];
  rating?: number;
  banner?: string | null;
}

// ---------------------------------------------------------------------------
// Journey (derived per-episode summary)
// ---------------------------------------------------------------------------
export interface JourneyDto {
  ep: number;
  arcs: ArcDto[];
  current: ArcDto | null;
  next: ArcDto | null;
  idx: number;
  doneCount: number;
  pct: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Character
// ---------------------------------------------------------------------------
export interface LockedFactRecord {
  id: number;
  title: string;
  unlockEp: number;
  hint: string;
}

export interface CharacterRecord {
  id: string;
  seriesId: string;
  name: string;
  epithet: string | null;
  img: string | null;
  crew: boolean;
  bounty: string | null;
  epaffirst: number;
  hue: number;
  role: string;
  affil: string;
  overview: string;
  affiliations: string[];
  appearances: string[];
  relationships: string[];
  locked: LockedFactRecord[];
}

/** A locked fact stays sealed (title + hint + unlockEp) until ep >= unlockEp. */
export interface LockedFactDto {
  title: string;
  unlockEp: number;
  hint: string;
}

/**
 * Spoiler-filtered character.
 * - If the character is not yet introduced (epaffirst > ep), `introduced` is
 *   false and the bio payload is omitted — only name + epaffirst are sent.
 * - `locked` always lists every gated fact as a sealed stub (the prototype has
 *   no post-unlock payload, so unlocking just marks it reached).
 */
export interface CharacterDto {
  id: string;
  name: string;
  epithet: string | null;
  img: string | null;
  crew: boolean;
  bounty: string | null;
  epaffirst: number;
  hue: number;
  introduced: boolean;
  // present only when introduced
  role?: string;
  affil?: string;
  overview?: string;
  affiliations?: string[];
  appearances?: string[];
  relationships?: string[];
  locked?: LockedFactDto[];
}

// ---------------------------------------------------------------------------
// Reaction (community hype) — spoiler-free by construction
// ---------------------------------------------------------------------------
export interface ReactionDto {
  id: number;
  user: string;
  arc: string;
  text: string;
  hype: number;
  ago: string;
}

// ---------------------------------------------------------------------------
// User / me
// ---------------------------------------------------------------------------
export interface MeDto {
  id: string;
  email: string;
  currentEp: number;
}
