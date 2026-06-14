import { kb } from "./kb/index.js";

/* DB-less build: there is no persistence layer. The current episode lives in
   the client's localStorage and is sent as ?ep= on every request. The server
   stays stateless and does all spoiler filtering from the JSON knowledge base.
   (Multi-user accounts + a real datastore come later — this is the single seam
   where that would plug back in.) */

export const SERIES_ID = kb.seriesId;

const DEFAULT_EP = 381;

/** Resolve the effective episode for a request from ?ep=, clamped to
 *  [1, series.episodes]. Falls back to a sensible default if absent/invalid. */
export function resolveEp(rawEp: unknown): number {
  const max = kb.series().episodes;
  let ep = Number(rawEp);
  if (!Number.isFinite(ep)) ep = DEFAULT_EP;
  return Math.max(1, Math.min(max, Math.round(ep)));
}
