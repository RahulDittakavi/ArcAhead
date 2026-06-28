import { deriveBoundary, type EpisodeState } from "@arcahead/shared";
import { supabase } from "./supabase";

const SERIES_ID = "one-piece";

type StateMap = Record<number, EpisodeState>;
type TsMap = Record<number, number>;

export interface SyncPayload {
  states: StateMap;
  ts: TsMap;
  canonOnly: boolean;
  hideMixed: boolean;
}

export async function pushProgress(userId: string, payload: SyncPayload): Promise<void> {
  if (!supabase) return;
  await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      series_id: SERIES_ID,
      states: payload.states,
      ts: payload.ts,
      canon_only: payload.canonOnly,
      hide_mixed: payload.hideMixed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,series_id" }
  );
}

export async function pullProgress(userId: string): Promise<SyncPayload | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("user_progress")
    .select("states, ts, canon_only, hide_mixed")
    .eq("user_id", userId)
    .eq("series_id", SERIES_ID)
    .maybeSingle();
  if (!data) return null;
  return {
    states: (data.states as StateMap) ?? {},
    ts: (data.ts as TsMap) ?? {},
    canonOnly: (data.canon_only as boolean) ?? false,
    hideMixed: (data.hide_mixed as boolean) ?? false,
  };
}

/** Take whichever payload has the higher derived spoiler boundary. */
export function mergeProgress(local: SyncPayload, remote: SyncPayload, maxEp: number): SyncPayload {
  const localEp = deriveBoundary(local.states, maxEp);
  const remoteEp = deriveBoundary(remote.states, maxEp);
  return remoteEp > localEp ? remote : local;
}
