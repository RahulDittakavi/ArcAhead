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

/** Whether today has any individual watch events (real-time marks only). */
export function watchedToday(ts: Record<number, number>, now = Date.now()): boolean {
  const today = dayKey(now);
  return Object.values(ts).some((t) => dayKey(t) === today);
}

/** Last N calendar days, oldest→newest. Each entry has the episode count for that day. */
export function lastNDaysActivity(
  ts: Record<number, number>,
  n: number,
  now = Date.now(),
): Array<{ count: number; isToday: boolean }> {
  const counts: Record<string, number> = {};
  for (const t of Object.values(ts)) {
    const k = dayKey(t);
    counts[k] = (counts[k] ?? 0) + 1;
  }
  const result: Array<{ count: number; isToday: boolean }> = [];
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const offset = new Date(d);
    offset.setDate(d.getDate() - i);
    const key = dayKey(offset.getTime());
    result.push({ count: counts[key] ?? 0, isToday: i === 0 });
  }
  return result;
}

/** All-time longest consecutive-day watch streak. */
export function bestStreak(ts: Record<number, number>): number {
  const days = new Set(Object.values(ts).map(dayKey));
  if (days.size === 0) return 0;
  const sorted = [...days]
    .map((k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m, d).getTime(); })
    .sort((a, b) => a - b);
  let best = 1, cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (Math.round((sorted[i] - sorted[i - 1]) / 86_400_000) === 1) best = Math.max(best, ++cur);
    else cur = 1;
  }
  return best;
}
