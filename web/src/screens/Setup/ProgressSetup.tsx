import { Icon } from "../../components/Icon";
import { Eyebrow, Card } from "../../components/primitives";
import { PlaceImg } from "../../components/PlaceImg";
import { SeaChart } from "../../components/viz";
import { useEpisode } from "../../lib/episode";
import { useApi } from "../../lib/useApi";
import { api, fmtHours } from "../../lib/api";
import { useNav } from "../../lib/nav";

const stepBtn: React.CSSProperties = { width: 44, height: 44, borderRadius: 12, border: "1px solid var(--line-2)", background: "var(--surface-2)", color: "var(--text)", cursor: "pointer", display: "grid", placeItems: "center" };

function StatTile({ icon, label, value, sub, accent }: { icon: string; label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-3)", fontSize: 12.5, marginBottom: 8 }}>
        <Icon name={icon} size={15} color={accent ? "var(--orange-hi)" : "var(--text-3)"} /> {label}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: accent ? "var(--orange-hi)" : "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export function ProgressSetup({ seriesTitle }: { seriesTitle: string }) {
  const { ep, maxEp, setEp } = useEpisode();
  const { go } = useNav();
  const { data: series } = useApi(() => api.series(), []);
  const { data: journey } = useApi(() => api.journey(ep), [ep]);

  const episodes = series?.episodes ?? maxEp;
  const remaining = Math.max(0, episodes - ep);
  const fill = `${(ep / episodes) * 100}%`;

  const presets = [
    { lab: "Just set sail", val: 1 },
    { lab: "End of Alabasta", val: 130 },
    { lab: "Caught up", val: episodes },
    { lab: "Ep 381", val: 381 },
  ];

  return (
    <SeaChart>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 32px 80px" }}>
        <Eyebrow>Set your log pose</Eyebrow>
        <h1 style={{ fontSize: "clamp(28px,3.6vw,42px)", marginBottom: 8 }}>How far have you sailed?</h1>
        <p style={{ color: "var(--text-2)", fontSize: 16, marginBottom: 36, maxWidth: 540 }}>
          Tell us your last finished episode. We'll keep every island beyond it lost in the fog.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 24, alignItems: "start" }}>
          <Card pad={22}>
            <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", marginBottom: 18, aspectRatio: "16 / 10" }}>
              <PlaceImg name="ANIME_POSTER_IMAGE" radius={0} style={{ position: "absolute", inset: 0 }} />
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, marginBottom: 6 }}>{seriesTitle}</div>
            <p style={{ color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.5, marginBottom: 16 }}>{series?.tagline ?? ""}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span className="chip">{episodes} episodes</span>
              <span className="chip"><Icon name="users" size={12} /> {((series?.tracked ?? 0) / 1000).toFixed(0)}k aboard</span>
              <span className="chip"><Icon name="star" size={12} color="var(--orange-hi)" /> {((series?.score ?? 0) / 10).toFixed(1)}</span>
            </div>
            <div style={{ marginTop: 18, padding: "12px 14px", borderRadius: 12, background: "var(--orange-faint)", border: "1px solid color-mix(in oklab, var(--orange) 30%, transparent)", display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "var(--orange-hi)" }}>
              <Icon name="compass" size={16} /> One Piece — the only voyage, for now.
            </div>
          </Card>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Card pad={28} glow>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 6 }}>Last episode watched</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 64, lineHeight: 0.9, color: "var(--orange-hi)" }}>{ep}</span>
                    <span style={{ fontSize: 18, color: "var(--text-3)" }}>/ {episodes}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setEp(Math.max(1, ep - 1))} style={stepBtn}><Icon name="minus" size={18} /></button>
                  <button onClick={() => setEp(Math.min(episodes, ep + 1))} style={stepBtn}><Icon name="plus" size={18} /></button>
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={episodes}
                value={ep}
                onChange={(e) => setEp(+e.target.value)}
                className="ep-slider"
                style={{ width: "100%", ["--fill" as string]: fill }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                {presets.map((o) => (
                  <button
                    key={o.lab}
                    onClick={() => setEp(o.val)}
                    className="chip"
                    style={{ cursor: "pointer", background: ep === o.val ? "var(--orange-faint)" : "var(--surface-2)", color: ep === o.val ? "var(--orange-hi)" : "var(--text-2)", borderColor: ep === o.val ? "var(--orange)" : "var(--line-2)" }}
                  >
                    {o.lab}
                  </button>
                ))}
              </div>
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
              <StatTile icon="map-pin" label="Current island" value={journey?.current?.island ?? "—"} accent />
              <StatTile icon="check-check" label="Islands discovered" value={`${journey?.doneCount ?? 0}`} sub={`${ep} episodes`} />
              <StatTile icon="clock" label="Sea ahead" value={fmtHours(remaining)} sub={`${remaining} episodes`} />
              <div style={{ background: "oklch(0.78 0.15 158 / 0.1)", border: "1px solid oklch(0.78 0.15 158 / 0.28)", borderRadius: "var(--r)", padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--green)", fontSize: 12.5, marginBottom: 8 }}>
                  <Icon name="shield-check" size={15} /> Spoiler shield
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--green)" }}>Active</div>
                <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 4 }}>Fog over ep {ep + 1}–{episodes}</div>
              </div>
            </div>

            <button className="btn btn-lg btn-primary" onClick={() => go("dashboard")} style={{ justifyContent: "center" }}>
              Begin your voyage <Icon name="arrow-right" size={18} />
            </button>
          </div>
        </div>
      </div>
    </SeaChart>
  );
}
