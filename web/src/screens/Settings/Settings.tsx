import { useRef, useState } from "react";
import { Icon } from "../../components/Icon";
import { Card, Eyebrow } from "../../components/primitives";
import { SeaChart } from "../../components/viz";
import { useEpisode } from "../../lib/episode";
import { useNav } from "../../lib/nav";
import { useIsMobile } from "../../lib/useIsMobile";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (b: boolean) => void; disabled?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
      style={{
        width: 44, height: 26, borderRadius: 999, border: "none", cursor: disabled ? "not-allowed" : "pointer",
        background: on ? "var(--orange-hi)" : "var(--surface-3)", position: "relative", flexShrink: 0,
        opacity: disabled ? 0.4 : 1, transition: "background .2s",
      }}
    >
      <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: 99, background: "#fff", transition: "left .2s var(--ease)" }} />
    </button>
  );
}

function Row({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderTop: "1px solid var(--line)" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14.5 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 3, lineHeight: 1.45 }}>{desc}</div>
      </div>
      {children}
    </div>
  );
}

export function Settings() {
  const { ep, maxEp, canonOnly, setCanonOnly, hideMixed, setHideMixed, resetProgress, exportData, importData } = useEpisode();
  const { go } = useNav();
  const isMobile = useIsMobile();
  const { user, loading: authLoading, authError, signIn, signOut } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const flash = (m: string) => { setNote(m); setTimeout(() => setNote(null), 2600); };

  const onExport = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arcahead-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash("Progress exported.");
  };

  const onImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => flash(importData(String(reader.result)) ? "Progress imported." : "Couldn’t read that file.");
    reader.readAsText(file);
  };

  return (
    <SeaChart>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: isMobile ? "12px 14px 32px" : "16px 32px 80px" }}>
        <Eyebrow>Settings</Eyebrow>
        <h1 style={{ fontSize: "clamp(26px,3vw,38px)", marginBottom: 22 }}>Tweak your voyage</h1>

        {note && (
          <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 12, background: "var(--orange-faint)", color: "var(--orange-hi)", fontSize: 13, fontWeight: 600 }}>
            {note}
          </div>
        )}

        {/* account / sync — only shown when Supabase is configured */}
        {supabase && (
          <Card pad={isMobile ? 18 : 24} style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: ".08em", color: "var(--text-3)" }}>ACCOUNT</div>
            {authLoading ? (
              <div style={{ padding: "14px 0", color: "var(--text-3)", fontSize: 13 }}>Loading…</div>
            ) : user ? (
              <Row title={user.email ?? "Signed in"} desc="Progress syncs automatically across all your devices.">
                <button className="btn btn-sm btn-ghost" onClick={signOut}>
                  <Icon name="log-out" size={14} /> Sign out
                </button>
              </Row>
            ) : (
              <>
                {authError && (
                  <div style={{ margin: "12px 0 4px", padding: "10px 14px", borderRadius: 10, background: "var(--surface-3)", color: "var(--red, #e0524d)", fontSize: 12.5, lineHeight: 1.5 }}>
                    Sign-in failed: {authError}. Make sure the redirect URI is registered in Google Cloud Console.
                  </div>
                )}
                <Row title="Sync your voyage" desc="Sign in with Google to keep your progress across devices and browsers.">
                  <button className="btn btn-sm btn-primary" onClick={signIn} style={{ whiteSpace: "nowrap" }}>
                    <Icon name="log-in" size={14} /> Sign in with Google
                  </button>
                </Row>
              </>
            )}
          </Card>
        )}

        {/* viewing preferences */}
        <Card pad={isMobile ? 18 : 24} style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: ".08em", color: "var(--text-3)" }}>VIEWING</div>
          <Row title="Canon only" desc="Hide anime-original filler episodes in the Episode Log.">
            <Toggle on={canonOnly} onChange={setCanonOnly} />
          </Row>
          <Row title="Also hide mixed episodes" desc="Stricter: also hide part-canon / part-filler episodes. Only applies while Canon only is on.">
            <Toggle on={hideMixed} onChange={setHideMixed} disabled={!canonOnly} />
          </Row>
        </Card>

        {/* spoiler boundary */}
        <Card pad={isMobile ? 18 : 24} style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: ".08em", color: "var(--text-3)" }}>SPOILER BOUNDARY</div>
          <Row title={`Currently at Episode ${ep}`} desc={`Everything past episode ${ep} of ${maxEp} stays fogged. Your boundary is derived from your watch history — mark episodes in the Episode Log to move it.`}>
            <button className="btn btn-sm btn-ghost" onClick={() => go("episodes")}>
              <Icon name="list-checks" size={14} /> Open log
            </button>
          </Row>
        </Card>

        {/* data */}
        <Card pad={isMobile ? 18 : 24}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: ".08em", color: "var(--text-3)" }}>YOUR DATA</div>
          <Row title="Export progress" desc="Download your watch history as a JSON file. Useful as a backup or to transfer to another browser.">
            <button className="btn btn-sm btn-ghost" onClick={onExport}>
              <Icon name="download" size={14} /> Export
            </button>
          </Row>
          <Row title="Import progress" desc="Restore from a previously exported file. Replaces your current progress.">
            <button className="btn btn-sm btn-ghost" onClick={() => fileRef.current?.click()}>
              <Icon name="upload" size={14} /> Import
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onImportFile(f); e.target.value = ""; }}
            />
          </Row>
          <Row title="Reset progress" desc="Clear all watch state and start a blank voyage. This can’t be undone.">
            {confirmReset ? (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-sm btn-ghost" onClick={() => setConfirmReset(false)}>Cancel</button>
                <button
                  className="btn btn-sm btn-primary"
                  style={{ background: "var(--red, #e0524d)", borderColor: "transparent" }}
                  onClick={() => { resetProgress(); setConfirmReset(false); flash("Progress reset."); }}
                >
                  Confirm reset
                </button>
              </div>
            ) : (
              <button className="btn btn-sm btn-ghost" style={{ color: "var(--red, #e0524d)" }} onClick={() => setConfirmReset(true)}>
                <Icon name="trash" size={14} /> Reset
              </button>
            )}
          </Row>
        </Card>
      </div>
    </SeaChart>
  );
}
