import { Icon } from "../../components/Icon";
import { Card } from "../../components/primitives";
import { SeaChart } from "../../components/viz";
import { PlaceImg } from "../../components/PlaceImg";
import { LockedPanel } from "../../components/LockedPanel";
import { useEpisode } from "../../lib/episode";
import { useApi } from "../../lib/useApi";
import { api } from "../../lib/api";
import { useNav } from "../../lib/nav";

function InfoHead({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
      <Icon name={icon} size={17} color="var(--orange-hi)" />
      <h3 style={{ fontSize: 17 }}>{title}</h3>
    </div>
  );
}

function HeroStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--text-3)", fontSize: 12, marginBottom: 6 }}>
        <Icon name={icon} size={13} /> {label}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22 }}>{value}</div>
    </div>
  );
}

export function ArcDetail({ arcId }: { arcId: string | null }) {
  const { ep } = useEpisode();
  const { openArc } = useNav();
  const { data: journey } = useApi(() => api.journey(ep), [ep]);
  const { data: chars } = useApi(() => api.characters(ep), [ep]);

  // No explicit arc → show the current arc.
  const resolvedId = arcId ?? journey?.current?.id ?? null;
  const { data: full } = useApi(() => (resolvedId ? api.arc(resolvedId, ep) : Promise.resolve(null)), [resolvedId, ep]);

  if (!journey || !full) {
    return (
      <SeaChart>
        <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "40px 32px" }}>Charting the island…</div>
      </SeaChart>
    );
  }

  const isFuture = full.status === "future";
  // Spoiler-safe "crew on this island": characters you've actually met (introduced)
  // who first appear by this arc's end.
  const charsHere = (chars ?? []).filter((c) => c.introduced && c.epaffirst <= full.end);

  return (
    <SeaChart>
      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "16px 32px 80px" }}>
        {/* island hero */}
        <div style={{ position: "relative", borderRadius: "var(--r-xl)", overflow: "hidden", marginBottom: 24, border: "1px solid var(--line)", minHeight: 280 }}>
          {full.hasBanner && !isFuture && full.banner ? (
            <PlaceImg name={full.banner} radius={0} style={{ position: "absolute", inset: 0 }} />
          ) : (
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg, oklch(0.3 0.1 32 / 0.6), var(--surface))" }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg, rgba(8,9,12,0.92) 30%, rgba(8,9,12,0.55))" }} />
          {isFuture && <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(6px)", background: "rgba(8,9,12,0.35)" }} />}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 90% -10%, var(--orange-faint), transparent 55%)" }} />
          <div style={{ position: "relative", padding: "40px 40px 34px" }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: "1.5px", color: "var(--orange-hi)" }}>
                {full.saga.toUpperCase()} SAGA · EP {full.start}–{full.end}
              </span>
              {full.status === "done" && <span className="chip" style={{ color: "var(--green)", borderColor: "oklch(0.78 0.15 158 / 0.3)" }}><Icon name="map-pinned" size={12} /> Island discovered</span>}
              {full.status === "current" && <span className="chip" style={{ color: "var(--orange-hi)", borderColor: "var(--orange)" }}><Icon name="sailboat" size={12} /> Currently ashore</span>}
              {isFuture && <span className="chip"><Icon name="cloud-fog" size={12} /> Still in the fog</span>}
            </div>
            <h1 style={{ fontSize: "clamp(34px,5vw,60px)", marginBottom: 8, filter: isFuture ? "blur(8px)" : "none", userSelect: isFuture ? "none" : "auto" }}>{full.island}</h1>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--text-3)", marginBottom: 16 }}>{isFuture ? "An island still under cloud" : full.name + " arc"}</div>
            <p style={{ fontSize: 17, color: "var(--text-2)", maxWidth: 560, lineHeight: 1.6 }}>
              {isFuture ? "This island is still beyond your log pose. Sail on to lift the fog." : full.summary}
            </p>
            <div style={{ display: "flex", gap: 20, marginTop: 22, flexWrap: "wrap" }}>
              <HeroStat icon="star" label="Crew rating" value={isFuture || full.rating == null ? "—" : full.rating.toFixed(1) + "/10"} />
              <HeroStat icon="clock" label="Sea time" value={full.watch} />
              <HeroStat icon="activity" label="Hype" value={full.hype + "/100"} />
              <HeroStat icon="users" label="Crew aboard" value={isFuture ? "??" : charsHere.length + "+"} />
            </div>
          </div>
        </div>

        {/* body */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20, marginBottom: 28 }}>
          <Card pad={28}>
            <InfoHead icon="sparkles" title="Moments worth the voyage" />
            <p style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: -8, marginBottom: 18 }}>Vague on purpose — the feeling, never the facts.</p>
            {isFuture || !full.moments ? (
              <LockedPanel title="Hidden until you make landfall" hint="The best moments of this island are waiting for you spoiler-free." unlockEp={full.start} spoilerStyle="shield" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {full.moments.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", padding: 14, borderRadius: "var(--r)", background: "var(--surface-2)", border: "1px solid var(--line)" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 99, flexShrink: 0, display: "grid", placeItems: "center", background: "var(--orange-faint)", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--orange-hi)", fontSize: 14 }}>{i + 1}</div>
                    <span style={{ fontSize: 14.5, color: "var(--text)" }}>{m}</span>
                    <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, color: "var(--text-3)", fontSize: 12.5 }}>
                      <Icon name="heart" size={13} color="var(--orange-hi)" /> {72 + i * 9}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card pad={28}>
            <InfoHead icon="users" title="Crew on this island" />
            {isFuture ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, background: "var(--surface-2)" }}>
                    <span style={{ width: 34, height: 34, borderRadius: 99, background: "var(--surface-3)" }} />
                    <span style={{ height: 11, width: 90 + i * 20, borderRadius: 6, background: "var(--surface-3)" }} />
                    <Icon name="cloud-fog" size={14} color="var(--text-4)" style={{ marginLeft: "auto" }} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {charsHere.slice(0, 5).map((c) => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 10, borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
                    <span style={{ width: 34, height: 34, borderRadius: 99, flexShrink: 0, background: `oklch(0.5 0.12 ${c.hue})`, display: "grid", placeItems: "center", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>
                      {c.name.split(" ").slice(-1)[0][0]}
                    </span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{c.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* voyage map */}
        <Card pad={28}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <h3 style={{ fontSize: 19, display: "flex", alignItems: "center", gap: 9 }}>
              <Icon name="map" size={20} color="var(--orange-hi)" /> Voyage map
            </h3>
            <span className="chip"><Icon name="cloud-fog" size={12} color="var(--text-3)" /> distant islands stay fogged</span>
          </div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
            {journey.arcs.map((a) => {
              const fut = a.status === "future";
              const isThis = a.id === full.id;
              return (
                <div
                  key={a.id}
                  onClick={() => openArc(a.id)}
                  style={{ flexShrink: 0, width: 152, cursor: "pointer", borderRadius: "var(--r)", padding: 16, border: isThis ? "1.5px solid var(--orange)" : "1px solid var(--line)", background: isThis ? "var(--orange-faint)" : "var(--surface-2)", filter: fut ? "blur(2.5px)" : "none", opacity: fut ? 0.6 : 1, transition: "filter .3s" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ width: 24, height: 14, borderRadius: "60% 60% 22% 22% / 100% 100% 22% 22%", display: "grid", placeItems: "center", background: fut ? "var(--surface-3)" : "linear-gradient(180deg,var(--orange-hi),var(--orange-deep))" }}>
                      {a.status === "done" && <Icon name="check" size={10} color="#1a0c03" style={{ marginTop: -2 }} />}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-4)" }}>{a.start}</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13.5, lineHeight: 1.25 }}>{a.island}</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{a.saga}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </SeaChart>
  );
}
