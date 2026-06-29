import { useState } from "react";
import { Icon } from "../../components/Icon";
import { Card } from "../../components/primitives";
import { SeaChart, LogPose, HypeMeter } from "../../components/viz";
import { LockedPanel } from "../../components/LockedPanel";
import { ProgressViz } from "../../components/journeyViz";
import { useEpisode } from "../../lib/episode";
import { useApi } from "../../lib/useApi";
import { api, fmtHours } from "../../lib/api";
import { useNav } from "../../lib/nav";
import { useIsMobile } from "../../lib/useIsMobile";
import { computeStreak, pacePerWeek, countState } from "../../lib/stats";
import { useAuth } from "../../lib/auth";
import { ShareModal } from "./ShareModal";

export function Dashboard() {
  const { ep, maxEp, states, ts } = useEpisode();
  const { user } = useAuth();
  const [showShare, setShowShare] = useState(false);
  const displayName = user?.user_metadata?.full_name?.split(" ")[0]
    ?? user?.email?.split("@")[0]
    ?? "navigator";
  const { openArc, openChar, go } = useNav();
  const isMobile = useIsMobile();
  const { data: journey } = useApi(() => api.journey(ep), [ep]);
  const { data: reactions } = useApi(() => api.reactions(ep), [ep]);
  const { data: chars } = useApi(() => api.characters(ep), [ep]);
  const { data: ms } = useApi(() => api.milestones(ep), [ep]);

  if (!journey || !journey.current) {
    return (
      <SeaChart>
        <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "40px 32px" }}>Charting your voyage…</div>
      </SeaChart>
    );
  }

  const arc = journey.current;
  const arcLen = arc.end - arc.start + 1;
  const arcDone = Math.min(arcLen, Math.max(0, ep - arc.start + 1));
  const arcPct = Math.round((arcDone / arcLen) * 100);

  // ---- real, progress-derived stats (no fabricated numbers) ----
  const streak = computeStreak(ts);
  const pace = pacePerWeek(ts);
  const watchedCount = countState(states, "watched");
  const nextEp = ep < maxEp ? ep + 1 : null;
  const epsLeftInArc = Math.max(0, arc.end - ep);
  const remainingToFrontier = Math.max(0, maxEp - ep);

  const introducedChars = (chars ?? []).filter((c) => c.introduced).slice(0, 6);
  const discovered = journey.arcs.filter((a) => a.status === "done");
  const horizon = journey.arcs.filter((a) => a.status === "future").slice(0, 3);

  return (
    <SeaChart>
      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: isMobile ? "12px 16px 32px" : "16px 32px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ color: "var(--text-3)", fontSize: 14, marginBottom: 4 }}>Welcome back, {displayName}</div>
            <h1 style={{ fontSize: "clamp(26px,3vw,38px)" }}>
              Your <span style={{ color: "var(--orange)" }}>Grand Line</span> voyage
            </h1>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {streak > 0 ? (
              <span className="chip"><Icon name="flame" size={13} color="var(--orange-hi)" /> {streak}-day streak</span>
            ) : (
              <span className="chip" onClick={() => go("episodes")} style={{ cursor: "pointer" }}><Icon name="flame" size={13} color="var(--text-3)" /> Start a streak</span>
            )}
            <span className="chip"><Icon name="map-pin" size={13} color="var(--orange-hi)" /> {journey.doneCount} islands discovered</span>
            <button className="btn btn-sm btn-ghost" onClick={() => setShowShare(true)}>
              <Icon name="share-2" size={14} /> Share voyage
            </button>
          </div>
        </div>

        {/* hero journey card */}
        <Card pad={0} style={{ overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "26px 30px 6px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 18 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: "1.5px", color: "var(--orange-hi)" }}>CURRENT ISLAND · {arc.saga.toUpperCase()} SAGA</span>
              </div>
              <h2 style={{ fontSize: "clamp(26px,3.2vw,40px)", marginBottom: 12 }}>{arc.island}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 14, maxWidth: 420 }}>
                <div style={{ flex: 1, height: 8, borderRadius: 9, background: "var(--surface-3)", overflow: "hidden" }}>
                  <div style={{ width: `${arcPct}%`, height: "100%", borderRadius: 9, background: "linear-gradient(90deg,var(--orange-deep),var(--orange-hi))", boxShadow: "0 0 10px var(--orange-glow)", transition: "width .8s var(--ease)" }} />
                </div>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--orange-hi)", whiteSpace: "nowrap" }}>{arcPct}% explored</span>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={() => openArc(arc.id)} style={{ marginTop: 16 }}>
                Explore this island <Icon name="arrow-right" size={14} />
              </button>
            </div>
            <LogPose pct={journey.pct} label={journey.pct + "%"} sub="of the voyage" size={134} />
          </div>
          <ProgressViz journey={journey} mode="rail" onArc={(a) => openArc(a.id)} />
        </Card>

        {/* discovered · current · horizon */}
        <Card pad={0} style={{ overflow: "hidden", marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.1fr 1fr" }}>
            <div style={{ padding: "22px 24px", borderRight: "1px solid var(--line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, color: "var(--text-2)" }}>
                <Icon name="map-pinned" size={16} color="var(--green)" /> <span style={{ fontSize: 13, fontWeight: 600 }}>Islands discovered</span>
                <span style={{ marginLeft: "auto", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--green)" }}>{discovered.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {discovered.slice(-3).reverse().map((a) => (
                  <div key={a.id} onClick={() => openArc(a.id)} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", fontSize: 12.5, color: "var(--text-2)" }}>
                    <Icon name="check" size={13} color="var(--green)" /> {a.island}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: "22px 24px", borderRight: "1px solid var(--line)", background: "linear-gradient(180deg, var(--orange-faint), transparent)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "var(--orange-hi)" }}>
                <Icon name="sailboat" size={16} /> <span style={{ fontSize: 13, fontWeight: 600 }}>Currently sailing</span>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, marginBottom: 6 }}>{arc.island}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.5 }}>Ep {arc.start}–{arc.end} · {arc.watch} of sea</div>
            </div>
            <div style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, color: "var(--text-2)" }}>
                <Icon name="cloud-fog" size={16} color="var(--text-3)" /> <span style={{ fontSize: 13, fontWeight: 600 }}>On the horizon</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {horizon.map((a, k) => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5, color: "var(--text-3)" }}>
                    <Icon name="lock" size={12} color="var(--text-4)" />
                    <span style={{ filter: k === 0 ? "none" : `blur(${k * 1.6}px)` }}>{k === 0 ? "A new world awaits" : a.island}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* journey milestones */}
        {ms && (
          <Card pad={26} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ fontSize: 19, display: "flex", alignItems: "center", gap: 9 }}>
                <Icon name="flag" size={19} color="var(--orange-hi)" /> Journey milestones
              </h3>
              <span className="chip">
                <Icon name="check-check" size={12} color="var(--green)" /> {ms.milestones.filter((m) => m.status === "reached").length} reached
              </span>
            </div>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6 }}>
              {ms.milestones.map((m) => {
                const reached = m.status === "reached";
                const current = m.status === "current";
                return (
                  <div
                    key={m.id}
                    style={{
                      flexShrink: 0,
                      width: 210,
                      borderRadius: "var(--r)",
                      padding: 16,
                      border: current ? "1.5px solid var(--orange)" : "1px solid var(--line)",
                      background: current ? "var(--orange-faint)" : "var(--surface-2)",
                      opacity: m.status === "future" ? 0.7 : 1,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <Icon
                        name={reached ? "check-check" : current ? "sailboat" : "lock"}
                        size={15}
                        color={reached ? "var(--green)" : current ? "var(--orange-hi)" : "var(--text-4)"}
                      />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".1em", color: "var(--text-3)" }}>
                        {reached ? "REACHED" : current ? "IN PROGRESS" : `LOCKED · EP ${m.unlockEp}`}
                      </span>
                    </div>
                    {m.status === "future" ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-3)" }}>
                        <Icon name="cloud-fog" size={16} />
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15 }}>A milestone awaits</span>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{m.title}</div>
                        {reached && m.safeRecap && <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5, marginBottom: 8 }}>{m.safeRecap}</p>}
                        {current && <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.5, marginBottom: 8 }}>Finish this stretch to unlock its recap.</p>}
                        <span className="chip" style={{ fontSize: 11, color: reached ? "var(--orange-hi)" : "var(--text-3)", background: reached ? "var(--orange-faint)" : "var(--surface-3)" }}>
                          <Icon name="star" size={11} color="var(--orange-hi)" /> {m.reward}
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* lower grid */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.4fr 1fr", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Card pad={26}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h3 style={{ fontSize: 19, display: "flex", alignItems: "center", gap: 9 }}>
                  <Icon name="compass" size={19} color="var(--orange-hi)" /> Next island on the log pose
                </h3>
                <span className="chip"><Icon name="shield" size={12} color="var(--green)" /> spoiler-free</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                <div style={{ borderRadius: "var(--r)", border: "1px solid var(--line)", padding: 20, background: "var(--surface-2)" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "1px", color: "var(--text-3)", marginBottom: 8 }}>UP NEXT</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, marginBottom: 8 }}>{journey.next ? journey.next.island : "The edge of the map"}</div>
                  <p style={{ fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.55 }}>
                    {journey.next?.summary ?? "You've reached the edge of what's aired. Drop anchor and rest up."}
                  </p>
                  {journey.next && (
                    <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                      <span className="chip"><Icon name="clock" size={12} /> {journey.next.watch}</span>
                      <span className="chip">Ep {journey.next.start}–{journey.next.end}</span>
                    </div>
                  )}
                </div>
                <LockedPanel title="What awaits ashore" hint="The events of this island stay in the fog. You'll see them when you make landfall." unlockEp={journey.next ? journey.next.start : ep} spoilerStyle="shield" />
              </div>
            </Card>

            <Card pad={26}>
              <h3 style={{ fontSize: 19, marginBottom: 16, display: "flex", alignItems: "center", gap: 9 }}>
                <Icon name="play" size={19} color="var(--orange-hi)" /> Keep watching
              </h3>
              {/* up next — fogged label only, never an episode title */}
              <div onClick={() => go("episodes")} style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface-2)", cursor: "pointer", marginBottom: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: "var(--orange-faint)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Icon name="play" size={18} color="var(--orange-hi)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "1px", color: "var(--text-3)" }}>UP NEXT</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, marginTop: 2 }}>
                    {nextEp ? `Episode ${nextEp}` : "You're all caught up"}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-2)", marginTop: 2 }}>
                    {nextEp ? `${arc.island} · ${epsLeftInArc} ${epsLeftInArc === 1 ? "episode" : "episodes"} left in this island` : "Drop anchor — you've reached the frontier"}
                  </div>
                </div>
                <Icon name="arrow-right" size={16} color="var(--text-3)" />
              </div>
              {/* real, derived stats */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap: 10 }}>
                <MiniStat icon="check-check" label="Watched" value={`${watchedCount}`} sub="episodes" />
                <MiniStat icon="clock" label="Time invested" value={fmtHours(watchedCount)} sub={`~${remainingToFrontier} to frontier`} />
                <MiniStat icon="activity" label="Your pace" value={pace > 0 ? `${pace.toFixed(1)}/wk` : "—"} sub={pace > 0 ? "last 30 days" : "mark eps to track"} />
              </div>
            </Card>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Card pad={24}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h3 style={{ fontSize: 17, display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="activity" size={17} color="var(--orange-hi)" /> Crew hype
                </h3>
                <span style={{ fontSize: 12, color: "var(--text-3)" }}>this island</span>
              </div>
              <HypeMeter value={arc.hype} segments={20} height={14} />
              <div style={{ borderTop: "1px solid var(--line)", margin: "18px 0 14px" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(reactions ?? []).slice(0, 2).map((r, i) => (
                  <div key={r.id} style={{ display: "flex", gap: 11 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 99, background: `oklch(0.5 0.12 ${i * 80 + 30})`, flexShrink: 0, display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#fff" }}>
                      {r.user[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 2 }}>
                        <span style={{ color: "var(--text-2)", fontWeight: 600 }}>@{r.user}</span> · {r.ago}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.45 }}>{r.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card pad={24}>
              <h3 style={{ fontSize: 17, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="scroll" size={17} color="var(--orange-hi)" /> Safe crew lookup
              </h3>
              <p style={{ fontSize: 12.5, color: "var(--text-3)", marginBottom: 16 }}>Only what's safe for Ep {ep}.</p>
              <div onClick={() => go("character")} style={{ position: "relative", marginBottom: 14, cursor: "pointer" }}>
                <Icon name="search" size={16} color="var(--text-3)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <div style={{ padding: "11px 14px 11px 40px", borderRadius: 999, border: "1px solid var(--line-2)", background: "var(--surface-2)", color: "var(--text-3)", fontSize: 13.5 }}>Search a pirate…</div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {introducedChars.map((c) => (
                  <button key={c.id} onClick={() => openChar(c.id)} className="chip" style={{ cursor: "pointer" }}>
                    <span style={{ width: 16, height: 16, borderRadius: 99, background: `oklch(0.5 0.12 ${c.hue})` }} /> {c.name.split(" ").slice(-1)[0]}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
      {showShare && (
        <ShareModal
          data={{
            ep,
            maxEp,
            island: arc.island,
            saga: arc.saga,
            pct: journey.pct,
            islandsDiscovered: journey.doneCount,
            watchedEps: watchedCount,
            streak,
            displayName,
          }}
          onClose={() => setShowShare(false)}
        />
      )}
    </SeaChart>
  );
}

function MiniStat({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <div style={{ borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface-2)", padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-3)", fontSize: 11.5, marginBottom: 6 }}>
        <Icon name={icon} size={13} /> {label}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--orange-hi)" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-4)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
