import type { JourneyDto, ArcDto, CharacterDto, ReactionDto, SeriesRecord, MilestonesDto } from "./types";

const BASE = "/api";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

const epq = (ep?: number) => (ep == null ? "" : `ep=${ep}`);

export const api = {
  series: () => get<SeriesRecord>(`/series`),
  journey: (ep?: number) => get<JourneyDto>(`/journey?${epq(ep)}`),

  arcs: (ep?: number) => get<ArcDto[]>(`/arcs?${epq(ep)}`),
  arc: (id: string, ep?: number) => get<ArcDto>(`/arcs/${encodeURIComponent(id)}?${epq(ep)}`),

  characters: (ep?: number, q?: string) =>
    get<CharacterDto[]>(`/characters?${epq(ep)}${q ? `&q=${encodeURIComponent(q)}` : ""}`),
  character: (id: string, ep?: number) =>
    get<CharacterDto>(`/characters/${encodeURIComponent(id)}?${epq(ep)}`),

  reactions: (ep?: number, arc?: string) =>
    get<ReactionDto[]>(`/reactions?${epq(ep)}${arc ? `&arc=${encodeURIComponent(arc)}` : ""}`),

  milestones: (ep?: number) => get<MilestonesDto>(`/milestones?${epq(ep)}`),
};

/** Client-side mirrors of the prototype display helpers (presentation only). */
export function fmtHours(eps: number): string {
  const h = Math.round((eps * 24) / 60);
  return h < 100 ? `${h} hrs` : `${(h / 24).toFixed(0)} days`;
}
