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
} from "@arcahead/shared";
import { hypeFor } from "./hype.js";

export function arcStatus(ep: number, arc: Pick<ArcRecord, "start" | "end">): ArcStatus {
  if (ep > arc.end) return "done";
  if (ep >= arc.start && ep <= arc.end) return "current";
  return "future";
}

/** Convert a full Arc record into a wire-safe DTO for the given episode.
 *  Future arcs lose summary / moments / rating / banner entirely. */
export function toArcDto(arc: ArcRecord, ep: number): ArcDto {
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

/** Convert a full Character record into a wire-safe DTO for the given episode.
 *  Not-yet-introduced characters reveal only name + first-appearance episode.
 *  Locked facts are always sealed stubs (title + hint + unlockEp). */
export function toCharacterDto(char: CharacterRecord, ep: number): CharacterDto {
  const introduced = char.epaffirst <= ep;
  const base: CharacterDto = {
    id: char.id,
    name: char.name,
    epithet: char.epithet,
    img: char.img,
    crew: char.crew,
    bounty: char.bounty,
    epaffirst: char.epaffirst,
    hue: char.hue,
    introduced,
  };
  if (!introduced) return base;
  return {
    ...base,
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
