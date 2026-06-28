import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// When env vars are absent (local dev without auth), supabase is null and
// all auth/sync calls silently no-op. The app works as before.
export const supabase = url && key ? createClient(url, key) : null;
