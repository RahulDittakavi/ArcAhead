import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";

/* The current episode is the single most important piece of app state — it
   drives every screen's spoiler gate. It is persisted server-side (PATCH /me)
   and held here so the episode stepper can re-filter everything live. */
interface EpisodeCtx {
  ep: number;
  maxEp: number;
  ready: boolean;
  setEp: (ep: number) => void;
}

const Ctx = createContext<EpisodeCtx | null>(null);

export function EpisodeProvider({ children, maxEp = 1122 }: { children: ReactNode; maxEp?: number }) {
  const [ep, setEpState] = useState(381);
  const [ready, setReady] = useState(false);

  // Load the saved episode once on mount.
  useEffect(() => {
    let alive = true;
    api
      .me()
      .then((me) => {
        if (alive) setEpState(me.currentEp);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Optimistic update + debounced persist so dragging the slider stays smooth.
  const setEp = useCallback(
    (next: number) => {
      const clamped = Math.max(1, Math.min(maxEp, Math.round(next)));
      setEpState(clamped);
    },
    [maxEp]
  );

  // Persist whenever ep settles (small debounce).
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      api.setEpisode(ep).catch(() => {});
    }, 350);
    return () => clearTimeout(t);
  }, [ep, ready]);

  return <Ctx.Provider value={{ ep, maxEp, ready, setEp }}>{children}</Ctx.Provider>;
}

export function useEpisode(): EpisodeCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useEpisode must be used within EpisodeProvider");
  return c;
}
