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
