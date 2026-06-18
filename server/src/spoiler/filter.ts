/* ============================================================================
   The Spoiler Shield — server-side gating.

   NOTHING that reveals plot past the user's episode may leave these functions.
   Both routes and the journey builder funnel through here so the gate is applied
   in exactly one place.
   ============================================================================ */
import type {
  ArcRecord,
  ArcDto,
  ArcStatus,
  CharacterRecord,
  CharacterDto,
  MilestoneRecord,
  MilestoneDto,
  MilestoneStatus,
  EpisodeDto,
  EpisodeClassification,
  ClassCounts,
} from "@arcahead/shared";
import { hypeFor } from "./hype.js";

export function arcStatus(ep: number, arc: Pick<ArcRecord, "start" | "end">): ArcStatus {
  if (ep > arc.end) return "done";
  if (ep >= arc.start && ep <= arc.end) return "current";
  return "future";
}

/** Convert a full Arc record into a wire-safe DTO for the given episode.
 *  Future arcs lose summary / moments / rating / banner entirely.
 *  `classCounts` is reveal-ahead-safe and computed by the caller (it needs the
 *  episode-class overlay, which the gate intentionally doesn't import). */
export function toArcDto(arc: ArcRecord, ep: number, classCounts: ClassCounts): ArcDto {
  const status = arcStatus(ep, arc);
  const base: ArcDto = {
    id: arc.id,
    name: arc.name,
    island: arc.island,
    saga: arc.saga,
    start: arc.start,
    end: arc.end,
    watch: arc.watch,
    status,
    hype: hypeFor(arc.id),
    hasBanner: !!arc.banner,
    classCounts,
  };
  if (status === "future") return base; // fogged: no plot payload crosses the wire
  return {
    ...base,
    summary: arc.summary,
    moments: arc.moments,
    rating: arc.rating,
    banner: arc.banner,
    kind: arc.kind, // safe to reveal for reached/current arcs ("is this filler?")
  };
}

/** Format a belly amount with thousands separators (e.g. 30000000 → "30,000,000"). */
function formatBelly(n: number): string {
  return n.toLocaleString("en-US");
}

/** The bounty as known to the viewer at episode `ep`: the HIGHEST poster value
 *  among those revealed so far (b.ep <= ep). Using the max — not the most-recent
 *  reveal — is deliberate: an old, lower bounty can be re-shown later in a
 *  flashback (e.g. Jinbe's rookie poster), and that must not look like a
 *  downgrade. In-story bounties only climb, so the max of revealed posters is the
 *  current known bounty. Returns null if no poster has been revealed yet. Falls
 *  back to the legacy static bounty when there's no episode-stamped history. */
function bountyAsOf(char: CharacterRecord, ep: number): string | null {
  if (char.bounties && char.bounties.length) {
    const revealed = char.bounties.filter((b) => b.ep <= ep);
    if (!revealed.length) return null;
    const top = revealed.reduce((a, b) => (b.amount >= a.amount ? b : a));
    return formatBelly(top.amount);
  }
  return char.bounty;
}

/** Convert a full Character record into a wire-safe DTO for the given episode.
 *  A not-yet-introduced character reveals ONLY name + first-appearance episode —
 *  no epithet, portrait, bounty, or bio crosses the wire. Locked facts are
 *  always sealed stubs (title + hint + unlockEp). */
export function toCharacterDto(char: CharacterRecord, ep: number): CharacterDto {
  const introduced = char.epaffirst <= ep;
  const base: CharacterDto = {
    id: char.id,
    name: char.name,
    epaffirst: char.epaffirst,
    hue: char.hue,
    crew: char.crew,
    introduced,
  };
  if (!introduced) return base;
  return {
    ...base,
    epithet: char.epithet,
    img: char.img,
    bounty: bountyAsOf(char, ep),
    role: char.role,
    affil: char.affil,
    overview: char.overview,
    affiliations: char.affiliations,
    appearances: char.appearances,
    relationships: char.relationships,
    locked: char.locked
      .slice()
      .sort((a, b) => a.unlockEp - b.unlockEp)
      .map((l) => ({ title: l.title, unlockEp: l.unlockEp, hint: l.hint })),
  };
}

export function milestoneStatus(ep: number, m: Pick<MilestoneRecord, "fromEp" | "toEp">): MilestoneStatus {
  if (ep > m.toEp) return "reached";
  if (ep >= m.fromEp) return "current"; // in the stretch but not finished
  return "future";
}

/** Convert a milestone to a wire-safe DTO.
 *  - reached: full payload (the recap is safe — you've passed the whole range).
 *  - current: title + reward, recap WITHHELD (it would spoil the range's end).
 *  - future: a sealed mystery placeholder — only the unlock episode. */
export function toMilestoneDto(m: MilestoneRecord, ep: number): MilestoneDto {
  const status = milestoneStatus(ep, m);
  if (status === "future") return { id: m.id, status, unlockEp: m.fromEp };
  const base: MilestoneDto = { id: m.id, status, title: m.title, reward: m.reward, fromEp: m.fromEp, toEp: m.toEp };
  if (status === "reached") base.safeRecap = m.safeRecap;
  return base;
}

/** Convert a single episode number (+ the arc it falls in, if any) to a
 *  wire-safe DTO for the given boundary episode `ep`.
 *  - `label` is always a plain "Episode N" — no plot.
 *  - `classification` is revealed ahead (policy): canon/filler so users can
 *    skip-plan. An episode-level `override` (from the KB overlay) wins over the
 *    arc's `kind`; with no override it falls back to the arc default.
 *  - arc identity is sent only once that arc is reached (arc.start <= ep).
 *  - the real episode `title` is sent only when the episode is reached AND the
 *    KB actually has one (none yet — derived episodes have no titles). */
export function toEpisodeDto(
  num: number,
  arc: ArcRecord | null,
  ep: number,
  override: EpisodeClassification | null = null
): EpisodeDto {
  const dto: EpisodeDto = {
    number: num,
    label: `Episode ${num}`,
    reached: num <= ep,
    classification: override ?? (arc ? arc.kind : "unclassified"),
  };
  if (arc && arc.start <= ep) {
    dto.arcId = arc.id;
    dto.arcName = arc.name;
    dto.saga = arc.saga;
  }
  return dto;
}
