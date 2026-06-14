/** Deterministic 78–97 hype score per arc — ported from arc-data.js `hypeFor`.
 *  Stand-in for a real community metric; stable so the UI doesn't flicker. */
export function hypeFor(arcId: string): number {
  let h = 0;
  for (const c of arcId) h = (h * 31 + c.charCodeAt(0)) % 100;
  return 78 + (h % 20);
}

/** eps * 24 minutes, formatted — ported from arc-screens-2.jsx `fmtHours`. */
export function fmtHours(eps: number): string {
  const mins = eps * 24;
  const h = Math.round(mins / 60);
  if (h < 100) return `${h} hrs`;
  return `${(h / 24).toFixed(0)} days`;
}
