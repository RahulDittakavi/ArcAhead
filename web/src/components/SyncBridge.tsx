import { useEffect, useRef } from "react";
import { useAuth } from "../lib/auth";
import { useEpisode } from "../lib/episode";
import { pushProgress, pullProgress, mergeProgress, type SyncPayload } from "../lib/sync";

/** Null-rendering component that bridges AuthContext and EpisodeContext:
 *  - On sign-in: pulls remote progress, merges (higher ep wins), applies if remote wins.
 *  - On any state change while signed in: debounces a push to Supabase (1.5s). */
export function SyncBridge() {
  const { user } = useAuth();
  const { states, ts, canonOnly, hideMixed, maxEp, importData } = useEpisode();

  // Refs so async callbacks always see the latest values without stale closures.
  const snapshotRef = useRef<SyncPayload & { maxEp: number; importData: typeof importData }>({
    states, ts, canonOnly, hideMixed, maxEp, importData,
  });
  snapshotRef.current = { states, ts, canonOnly, hideMixed, maxEp, importData };

  const prevUserIdRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sign-in: pull remote, merge, apply if remote has more progress, then push merged.
  useEffect(() => {
    if (!user) { prevUserIdRef.current = null; return; }
    if (user.id === prevUserIdRef.current) return;
    prevUserIdRef.current = user.id;
    const userId = user.id;

    (async () => {
      const s = snapshotRef.current;
      const local: SyncPayload = { states: s.states, ts: s.ts, canonOnly: s.canonOnly, hideMixed: s.hideMixed };
      const remote = await pullProgress(userId);
      if (!remote) { await pushProgress(userId, local); return; }

      const merged = mergeProgress(local, remote, s.maxEp);
      if (merged === remote) {
        // Remote has more progress — overwrite local.
        s.importData(JSON.stringify({ v: 1, states: merged.states, ts: merged.ts, canonOnly: merged.canonOnly, hideMixed: merged.hideMixed }));
      }
      await pushProgress(userId, merged);
    })();
  }, [user?.id]);

  // Debounced push on any state change while signed in.
  useEffect(() => {
    if (!user) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushProgress(user.id, { states, ts, canonOnly, hideMixed });
    }, 1500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [states, ts, canonOnly, hideMixed, user?.id]);

  return null;
}
