/* ============================================================================
   @arcahead/shared — the API contract.
   These types are the single source of truth shared by server and web.

   Naming convention:
   - `*Record`  = the full, unfiltered shape in the curated JSON knowledge base
                  (the authoritative source of truth). Never sent to clients raw.
   - `*Dto`     = the spoiler-FILTERED shape that may leave the server. Fields
                  that the Spoiler Shield can strip are optional/nullable here,
                  so the compiler reminds you they may be absent.

   The AI formatting layer (if ever enabled) may ONLY consume `*Dto` values —
   never `*Record` — so it is structurally incapable of seeing unreleased
   content. See server/src/present/.
   ============================================================================ */

export type ArcStatus = "done" | "current" | "future";

/** Whether an arc is canon story, anime-original filler, or a mix. Lets the app
 *  honestly answer "is this filler?" without fabricating anything. */
export type ArcKind = "canon" | "filler" | "mixed";

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
  kind: ArcKind;
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
  // present only when status !== "future" (knowing a fogged arc's kind/summary
  // would leak that it exists and what it is)
  summary?: string;
  moments?: string[];
  rating?: number;
  banner?: string | null;
  kind?: ArcKind;
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
// Journey Milestones — narrative checkpoints with a safe recap + reward.
// ---------------------------------------------------------------------------
export type MilestoneStatus = "reached" | "current" | "future";

export interface MilestoneRecord {
  id: string;
  seriesId: string;
  fromEp: number;
  toEp: number;
  title: string;
  /** Spoiler-safe recap of everything up to `toEp`. Only safe to show once the
   *  user has PASSED `toEp` — revealing it mid-range would spoil the ending. */
  safeRecap: string;
  reward: string;
  order: number;
}

/**
 * Spoiler-filtered milestone.
 * - reached (ep > toEp): full payload (title, recap, reward).
 * - current (fromEp <= ep <= toEp): title + reward, but recap WITHHELD — you
 *   haven't finished the stretch, so its recap would spoil the end.
 * - future (ep < fromEp): a sealed mystery placeholder — only `unlockEp`.
 */
export interface MilestoneDto {
  id: string;
  status: MilestoneStatus;
  // present for reached + current
  title?: string;
  reward?: string;
  fromEp?: number;
  toEp?: number;
  // present for reached only
  safeRecap?: string;
  // always present for future (the episode at which it begins to reveal)
  unlockEp?: number;
}

export interface MilestonesDto {
  milestones: MilestoneDto[];
  current: MilestoneDto | null;
  next: MilestoneDto | null;
}

// ---------------------------------------------------------------------------
// Timeline — the journey spine: series meta + ordered sagas. Authoritative
// source for total episode count and saga ordering.
// ---------------------------------------------------------------------------
export interface SagaRecord {
  name: string;
  order: number;
  fromEp: number;
  toEp: number;
}

export interface TimelineDto {
  series: SeriesRecord;
  sagas: SagaRecord[];
}

// ---------------------------------------------------------------------------
// User / me
// ---------------------------------------------------------------------------
export interface MeDto {
  id: string;
  email: string;
  currentEp: number;
}
