import type { JourneyDto, ArcDto, CharacterDto, ReactionDto, MeDto, SeriesRecord } from "./types";

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

  me: () => get<MeDto>(`/me`),
  setEpisode: async (currentEp: number): Promise<MeDto> => {
    const res = await fetch(`${BASE}/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentEp }),
    });
    if (!res.ok) throw new Error(`PATCH /me → ${res.status}`);
    return res.json() as Promise<MeDto>;
  },
};

/** Client-side mirrors of the prototype display helpers (presentation only). */
export function fmtHours(eps: number): string {
  const h = Math.round((eps * 24) / 60);
  return h < 100 ? `${h} hrs` : `${(h / 24).toFixed(0)} days`;
}
