import type { EpisodeState } from "./types";

/** Local day key (YYYY-M-D) for streak grouping. */
function dayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Consecutive-day watch streak ending today (or yesterday, so a not-yet-watched
 *  today doesn't break it). 0 if no watch events. */
export function computeStreak(ts: Record<number, number>, now = Date.now()): number {
  const days = new Set(Object.values(ts).map(dayKey));
  if (days.size === 0) return 0;
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  if (!days.has(dayKey(d.getTime()))) d.setDate(d.getDate() - 1); // grace: today empty but alive
  let streak = 0;
  while (days.has(dayKey(d.getTime()))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/** Episodes/week over the trailing 30 days. 0 if no recent watch events. */
export function pacePerWeek(ts: Record<number, number>, now = Date.now()): number {
  const cutoff = now - 30 * 86_400_000;
  const recent = Object.values(ts).filter((t) => t >= cutoff).length;
  return recent / (30 / 7);
}

/** Count episodes in a given state (e.g. how many actually `watched`). */
export function countState(states: Record<number, EpisodeState>, state: EpisodeState): number {
  let n = 0;
  for (const v of Object.values(states)) if (v === state) n++;
  return n;
}
