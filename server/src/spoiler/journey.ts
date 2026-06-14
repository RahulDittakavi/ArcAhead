/* ============================================================================
   journey(ep) — ported from window.ARC.journey in arc-data.js.
   Derives per-arc status + a progress summary. Status is never persisted.
   ============================================================================ */
import type { ArcRecord, JourneyDto, ArcDto } from "@arcahead/shared";
import { toArcDto } from "./filter.js";

/**
 * @param arcs    all arcs for the series, ANY order (sorted here by start)
 * @param ep      the user's current episode
 * @param total   total aired episodes (series.episodes) — drives the % readout
 */
export function buildJourney(arcs: ArcRecord[], ep: number, total: number): JourneyDto {
  const ordered = [...arcs].sort((a, b) => a.start - b.start);
  const dtos: ArcDto[] = ordered.map((a) => toArcDto(a, ep));

  const doneArcs = dtos.filter((a) => a.status === "done");
  const current =
    dtos.find((a) => a.status === "current") ??
    doneArcs[doneArcs.length - 1] ??
    dtos[0] ??
    null;

  const idx = current ? dtos.findIndex((a) => a.id === current.id) : -1;
  const next = idx >= 0 ? dtos[idx + 1] ?? null : null;
  const pct = total > 0 ? Math.min(100, Math.round((ep / total) * 100)) : 0;

  return {
    ep,
    arcs: dtos,
    current,
    next,
    idx,
    doneCount: doneArcs.length,
    pct,
    total,
  };
}
