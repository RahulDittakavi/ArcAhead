import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { deriveBoundary, type EpisodeState } from "@arcahead/shared";

/* Episode-level tracker state — the real "tracker".

   A per-episode state map (`{epNum: state}`) is the single source of truth,
   persisted in localStorage (DB-less; accounts/sync are a later phase). The
   spoiler boundary `ep` is DERIVED (highest contiguous watched/skipped run) and
   sent as ?ep= on every API call. Marking a far-future episode does NOT advance
   the boundary, which keeps the shield safe.

   The legacy `ep`/`setEp` interface is preserved so the TopBar stepper and Setup
   slider keep working — `setEp(n)` just means "my position is n" (mark 1..n,
   clear the rest). The tracker screen uses the granular ops. */
const STATES_KEY = "arcahead.episodeStates";
const TS_KEY = "arcahead.episodeTs";
const CANON_KEY = "arcahead.canonOnly";
const HIDEMIXED_KEY = "arcahead.hideMixed";
const DEFAULT_EP = 381; // seed for a fresh visitor, so the demo voyage is populated

type StateMap = Record<number, EpisodeState>;
/** When an episode was individually marked watched (epoch ms). Bulk/catch-up
 *  actions (slider, "mark up to here", "mark arc") do NOT record a timestamp —
 *  only real-time single marks do, so pace/streak reflect actual watching. */
type TsMap = Record<number, number>;

interface EpisodeCtx {
  ep: number;
  maxEp: number;
  ready: boolean;
  states: StateMap;
  stateOf: (n: number) => EpisodeState;
  setEp: (n: number) => void; // truncating: 1..n watched, rest unwatched (slider/stepper)
  markWatched: (n: number) => void;
  markSkipped: (n: number) => void;
  markUnwatched: (n: number) => void;
  markUpTo: (n: number) => void; // non-destructive bulk: 1..n watched
  markRange: (from: number, to: number, state: EpisodeState) => void;
  ts: TsMap; // watch-event timestamps (individual marks only)
  canonOnly: boolean;
  setCanonOnly: (b: boolean) => void;
  hideMixed: boolean; // when canonOnly, also hide `mixed` episodes (stricter)
  setHideMixed: (b: boolean) => void;
  resetProgress: () => void; // wipe all watch state (back to a blank voyage)
  exportData: () => string; // serialize progress for backup/transfer
  importData: (raw: string) => boolean; // restore from exportData() output
}

const Ctx = createContext<EpisodeCtx | null>(null);

function loadStates(): StateMap | null {
  try {
    const raw = localStorage.getItem(STATES_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw) as StateMap;
    return obj && typeof obj === "object" ? obj : null;
  } catch {
    return null;
  }
}

function seedDefault(): StateMap {
  const m: StateMap = {};
  for (let i = 1; i <= DEFAULT_EP; i++) m[i] = "watched";
  return m;
}

function loadTs(): TsMap {
  try {
    const raw = localStorage.getItem(TS_KEY);
    const obj = raw ? (JSON.parse(raw) as TsMap) : null;
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

export function EpisodeProvider({ children, maxEp = 1122 }: { children: ReactNode; maxEp?: number }) {
  const [states, setStates] = useState<StateMap>(() => loadStates() ?? seedDefault());
  const [ts, setTs] = useState<TsMap>(() => loadTs());
  const [canonOnly, setCanonOnlyState] = useState<boolean>(() => {
    try { return localStorage.getItem(CANON_KEY) === "1"; } catch { return false; }
  });
  const [hideMixed, setHideMixedState] = useState<boolean>(() => {
    try { return localStorage.getItem(HIDEMIXED_KEY) === "1"; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(STATES_KEY, JSON.stringify(states)); } catch { /* ignore */ }
  }, [states]);
  useEffect(() => {
    try { localStorage.setItem(TS_KEY, JSON.stringify(ts)); } catch { /* ignore */ }
  }, [ts]);
  useEffect(() => {
    try { localStorage.setItem(CANON_KEY, canonOnly ? "1" : "0"); } catch { /* ignore */ }
  }, [canonOnly]);
  useEffect(() => {
    try { localStorage.setItem(HIDEMIXED_KEY, hideMixed ? "1" : "0"); } catch { /* ignore */ }
  }, [hideMixed]);

  const ep = useMemo(() => deriveBoundary(states, maxEp), [states, maxEp]);

  const clamp = useCallback((n: number) => Math.max(1, Math.min(maxEp, Math.round(n))), [maxEp]);

  const setEp = useCallback((n: number) => {
    const k = clamp(n);
    const m: StateMap = {};
    for (let i = 1; i <= k; i++) m[i] = "watched";
    setStates(m);
  }, [clamp]);

  const setOne = useCallback((n: number, state: EpisodeState | null) => {
    const k = clamp(n);
    setStates((prev) => {
      const next = { ...prev };
      if (state === null || state === "unwatched") delete next[k];
      else next[k] = state;
      return next;
    });
  }, [clamp]);

  const markWatched = useCallback((n: number) => {
    setOne(n, "watched");
    const k = clamp(n);
    setTs((prev) => ({ ...prev, [k]: Date.now() })); // real-time watch event
  }, [setOne, clamp]);
  const markSkipped = useCallback((n: number) => setOne(n, "skipped"), [setOne]);
  const markUnwatched = useCallback((n: number) => {
    setOne(n, null);
    const k = clamp(n);
    setTs((prev) => { const next = { ...prev }; delete next[k]; return next; });
  }, [setOne, clamp]);

  const markUpTo = useCallback((n: number) => {
    const k = clamp(n);
    setStates((prev) => {
      const next = { ...prev };
      for (let i = 1; i <= k; i++) if (!next[i] || next[i] === "unwatched") next[i] = "watched";
      return next;
    });
  }, [clamp]);

  const markRange = useCallback((from: number, to: number, state: EpisodeState) => {
    const a = clamp(from), b = clamp(to);
    setStates((prev) => {
      const next = { ...prev };
      for (let i = Math.min(a, b); i <= Math.max(a, b); i++) {
        if (state === "unwatched") delete next[i];
        else next[i] = state;
      }
      return next;
    });
  }, [clamp]);

  const stateOf = useCallback((n: number): EpisodeState => states[n] ?? "unwatched", [states]);

  const resetProgress = useCallback(() => { setStates({}); setTs({}); }, []);

  const exportData = useCallback(
    () => JSON.stringify({ v: 1, states, ts, canonOnly, hideMixed }, null, 2),
    [states, ts, canonOnly, hideMixed]
  );

  const importData = useCallback((raw: string): boolean => {
    try {
      const obj = JSON.parse(raw);
      if (!obj || typeof obj !== "object" || typeof obj.states !== "object") return false;
      setStates(obj.states ?? {});
      setTs(obj.ts && typeof obj.ts === "object" ? obj.ts : {});
      if (typeof obj.canonOnly === "boolean") setCanonOnlyState(obj.canonOnly);
      if (typeof obj.hideMixed === "boolean") setHideMixedState(obj.hideMixed);
      return true;
    } catch {
      return false;
    }
  }, []);

  const value: EpisodeCtx = {
    ep, maxEp, ready: true, states, stateOf, setEp,
    markWatched, markSkipped, markUnwatched, markUpTo, markRange,
    ts, canonOnly, setCanonOnly: setCanonOnlyState,
    hideMixed, setHideMixed: setHideMixedState,
    resetProgress, exportData, importData,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useEpisode(): EpisodeCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useEpisode must be used within EpisodeProvider");
  return c;
}
