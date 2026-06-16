/* ============================================================================
   Spoiler-safe search.

   Only content the user has REACHED is searchable (non-future arcs, introduced
   characters). Future islands/characters never surface, so a lucky guess can't
   confirm what lies ahead — and because the match runs only over already-visible
   records, it can't probe hidden fields either. Results are the same gated DTOs
   used everywhere else.
   ============================================================================ */
import type { SearchResultsDto } from "@arcahead/shared";
import { kb } from "../kb/index.js";
import { toArcDto, toCharacterDto, arcStatus } from "./filter.js";

export function searchKb(rawQuery: string, ep: number): SearchResultsDto {
  const q = rawQuery.trim().toLowerCase();
  if (q.length < 2) return { query: q, arcs: [], characters: [] };

  const hit = (s: string | null | undefined) => !!s && s.toLowerCase().includes(q);

  const arcs = kb
    .arcs()
    .filter((a) => arcStatus(ep, a) !== "future")
    .filter((a) => hit(a.name) || hit(a.island) || hit(a.saga) || hit(a.summary) || a.moments.some(hit))
    .map((a) => toArcDto(a, ep, kb.classCounts(a.start, a.end, a.kind)));

  const characters = kb
    .characters()
    .filter((c) => c.epaffirst <= ep)
    .filter(
      (c) =>
        hit(c.name) || hit(c.epithet) || hit(c.role) || hit(c.affil) || hit(c.overview) || c.affiliations.some(hit)
    )
    .map((c) => toCharacterDto(c, ep));

  return { query: q, arcs, characters };
}
