import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  authError: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({ user: null, loading: false, authError: null, signIn: async () => {}, signOut: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!supabase);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Clean up OAuth redirect params (errors or tokens) from the URL immediately
    // so the user never sees raw query strings after a redirect.
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const errorDesc = params.get("error_description") ?? hashParams.get("error_description");
    if (errorDesc || params.has("error") || hashParams.has("access_token") || hashParams.has("error")) {
      if (errorDesc) setAuthError(decodeURIComponent(errorDesc.replace(/\+/g, " ")));
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    // Subscribe first so we never miss INITIAL_SESSION, then fall back to
    // getSession() in case the event already fired before we subscribed.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "SIGNED_OUT") {
        setLoading(false);
      }
      if (event === "SIGNED_IN") setAuthError(null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(prev => prev ?? data.session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    if (!supabase) return;
    setAuthError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return <Ctx.Provider value={{ user, loading, authError, signIn, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
