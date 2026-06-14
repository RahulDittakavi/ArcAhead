import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/* The current episode is the single most important piece of app state — it
   drives every screen's spoiler gate, and is sent as ?ep= on every API call.

   DB-less build: it's persisted in the browser's localStorage, so each visitor
   has their own independent progress (no shared server-side user, no account).
   When multi-user accounts land later, this is the seam that would sync to a
   per-user value on the server instead. */
const STORAGE_KEY = "arcahead.currentEp";
const DEFAULT_EP = 381;

interface EpisodeCtx {
  ep: number;
  maxEp: number;
  ready: boolean;
  setEp: (ep: number) => void;
}

const Ctx = createContext<EpisodeCtx | null>(null);

function loadEp(maxEp: number): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = raw == null ? DEFAULT_EP : Number(raw);
    if (!Number.isFinite(n)) return DEFAULT_EP;
    return Math.max(1, Math.min(maxEp, Math.round(n)));
  } catch {
    return DEFAULT_EP;
  }
}

export function EpisodeProvider({ children, maxEp = 1122 }: { children: ReactNode; maxEp?: number }) {
  const [ep, setEpState] = useState(() => loadEp(maxEp));
  const ready = true; // no async load — localStorage is synchronous

  const setEp = useCallback(
    (next: number) => {
      const clamped = Math.max(1, Math.min(maxEp, Math.round(next)));
      setEpState(clamped);
    },
    [maxEp]
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(ep));
    } catch {
      /* ignore (private mode / disabled storage) */
    }
  }, [ep]);

  return <Ctx.Provider value={{ ep, maxEp, ready, setEp }}>{children}</Ctx.Provider>;
}

export function useEpisode(): EpisodeCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useEpisode must be used within EpisodeProvider");
  return c;
}
