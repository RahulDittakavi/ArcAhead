import { useEffect, useRef } from "react";
import type { JourneyDto, ArcDto } from "../lib/types";
import { Icon } from "./Icon";
import { ShipMarker } from "./viz";

export type ProgressVizMode = "rail" | "horizon" | "saga";

// ===================== SEA ROUTE (default) =====================
function SeaRoute({ journey, onArc }: { journey: JourneyDto; onArc?: (a: ArcDto) => void }) {
  const railRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const cur = el.querySelector<HTMLElement>("[data-current]");
    if (cur) el.scrollLeft = cur.offsetLeft - el.clientWidth / 2 + 90;
  }, [journey.current?.id]);

  return (
    <div
      ref={railRef}
      style={{ position: "relative", overflowX: "auto", overflowY: "hidden", padding: "58px 8px 22px", maskImage: "linear-gradient(90deg, transparent, #000 5%, #000 92%, transparent)" }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", minWidth: "max-content", paddingRight: 40 }}>
        {journey.arcs.map((a, i) => {
          const fogDepth = a.status === "future" ? Math.min(0.85, (i - journey.idx) * 0.3) : 0;
          const done = a.status === "done",
            curr = a.status === "current",
            fut = a.status === "future";
          return (
            <div key={a.id} style={{ display: "flex", alignItems: "flex-end" }}>
              {i > 0 && (
                <div
                  style={{
                    width: 56,
                    height: 2,
                    flexShrink: 0,
                    marginBottom: 40,
                    borderRadius: 9,
                    backgroundImage:
                      done || journey.arcs[i - 1].status !== "future"
                        ? "repeating-linear-gradient(90deg, var(--orange) 0 6px, transparent 6px 12px)"
                        : "repeating-linear-gradient(90deg, var(--text-4) 0 5px, transparent 5px 12px)",
                    opacity: fut ? 0.4 : 1,
                  }}
                />
              )}
              <div
                data-current={curr || undefined}
                onClick={() => onArc && onArc(a)}
                style={{ position: "relative", flexShrink: 0, width: 122, textAlign: "center", cursor: onArc ? "pointer" : "default", filter: fut ? `blur(${fogDepth * 2.4}px)` : "none", opacity: fut ? 1 - fogDepth * 0.5 : 1, transition: "filter .4s, opacity .4s" }}
              >
                {curr && (
                  <div style={{ position: "absolute", top: -56, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ animation: "bob 3.2s var(--ease) infinite" }}>
                      <ShipMarker size={38} />
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "1.4px", color: "var(--orange-hi)", whiteSpace: "nowrap" }}>YOU ARE HERE</span>
                  </div>
                )}
                {fut && (
                  <div style={{ position: "absolute", top: -26, left: "50%", transform: "translateX(-50%)" }}>
                    <Icon name="cloud-fog" size={18} color="var(--text-3)" />
                  </div>
                )}
                <div style={{ display: "grid", placeItems: "center", margin: "0 auto 12px", height: 30, position: "relative" }}>
                  <span
                    style={{
                      width: curr ? 34 : 26,
                      height: curr ? 19 : 14,
                      borderRadius: "60% 60% 22% 22% / 100% 100% 22% 22%",
                      background: fut ? "var(--surface-3)" : "linear-gradient(180deg, var(--orange-hi), var(--orange-deep))",
                      border: fut ? "1.5px solid var(--text-4)" : "none",
                      boxShadow: fut ? "none" : "0 0 14px var(--orange-glow)",
                      position: "relative",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {done && <Icon name="check" size={11} color="#1a0c03" style={{ marginTop: -2 }} />}
                  </span>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12.5, lineHeight: 1.2, color: curr ? "var(--orange-hi)" : done ? "var(--text)" : "var(--text-3)" }}>{a.island}</div>
                <div style={{ fontSize: 10.5, color: "var(--text-4)", marginTop: 3 }}>
                  Ep {a.start}–{a.end}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===================== LOG POSE HORIZON =====================
function LogPoseHorizon({ journey }: { journey: JourneyDto }) {
  const total = journey.arcs.length;
  const prog = total > 0 ? (journey.idx + 0.5) / total : 0;
  const ax = 60 + prog * 680,
    ay = 250 - Math.sin(prog * Math.PI) * 150;
  return (
    <div style={{ position: "relative" }}>
      <svg viewBox="0 0 800 280" style={{ width: "100%", height: "auto" }} fill="none">
        <defs>
          <linearGradient id="hz" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--orange)" stopOpacity="0.3" />
            <stop offset={prog} stopColor="var(--orange-hi)" />
            <stop offset={Math.min(1, prog + 0.02)} stopColor="var(--text-4)" stopOpacity="0.5" />
            <stop offset="1" stopColor="var(--text-4)" stopOpacity="0.06" />
          </linearGradient>
          <radialGradient id="hzfog" cx={`${prog + 0.15}`} cy="0.6" r="0.6">
            <stop offset="0" stopColor="var(--bg)" stopOpacity="0" />
            <stop offset="1" stopColor="var(--bg)" stopOpacity="0.85" />
          </radialGradient>
        </defs>
        <path d="M40 250 Q 400 -40 760 250" stroke="url(#hz)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 11" />
        {journey.arcs.map((a, i) => {
          const p = (i + 0.5) / total;
          const x = 60 + p * 680,
            y = 250 - Math.sin(p * Math.PI) * 150;
          const curr = a.status === "current",
            done = a.status === "done";
          return (
            <circle key={a.id} cx={x} cy={y} r={curr ? 7 : done ? 5 : 4} fill={a.status === "future" ? "var(--text-4)" : "var(--orange)"} opacity={a.status === "future" ? Math.max(0.15, 1 - (p - prog) * 2.5) : 1} style={curr ? { filter: "drop-shadow(0 0 8px var(--orange-glow))" } : {}} />
          );
        })}
        <circle cx={ax} cy={ay} r="3" fill="#fff" opacity="0.9" />
        <rect x="420" y="0" width="380" height="280" fill="url(#hzfog)" />
      </svg>
      <div style={{ position: "absolute", left: `${(ax / 800) * 100}%`, top: `${(ay / 280) * 100}%`, transform: "translate(-50%,-115%)" }}>
        <div style={{ animation: "bob 3.2s var(--ease) infinite" }}>
          <ShipMarker size={36} />
        </div>
      </div>
      <div style={{ position: "absolute", left: "50%", bottom: 8, transform: "translateX(-50%)", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "1px" }}>THE LOG POSE POINTS TO THE NEXT ISLAND</div>
      </div>
    </div>
  );
}

// ===================== SEA CHART (saga bars) =====================
function SeaChartBars({ journey }: { journey: JourneyDto }) {
  const sagas: { name: string; arcs: ArcDto[] }[] = [];
  journey.arcs.forEach((a) => {
    let s = sagas.find((x) => x.name === a.saga);
    if (!s) {
      s = { name: a.saga, arcs: [] };
      sagas.push(s);
    }
    s.arcs.push(a);
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {sagas.map((s) => {
        const done = s.arcs.filter((a) => a.status === "done").length;
        const hasCurrent = s.arcs.some((a) => a.status === "current");
        const pct = Math.round((done / s.arcs.length) * 100);
        const future = !hasCurrent && done === 0;
        return (
          <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 16, opacity: future ? 0.5 : 1, filter: future ? "blur(0.4px)" : "none" }}>
            <div style={{ width: 130, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13.5, color: hasCurrent ? "var(--orange-hi)" : "var(--text-2)", display: "flex", alignItems: "center", gap: 7 }}>
              {future && <Icon name="cloud-fog" size={12} color="var(--text-4)" />}
              {s.name}
            </div>
            <div style={{ flex: 1, height: 9, borderRadius: 9, background: "var(--surface-3)", overflow: "hidden" }}>
              <div style={{ width: `${hasCurrent ? Math.max(pct, 12) : pct}%`, height: "100%", borderRadius: 9, background: "linear-gradient(90deg, var(--orange-deep), var(--orange-hi))", boxShadow: pct > 0 ? "0 0 10px var(--orange-glow)" : "none", transition: "width .8s var(--ease)" }} />
            </div>
            <div style={{ width: 50, textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-3)" }}>
              {done}/{s.arcs.length} <span style={{ color: "var(--text-4)" }}>isl</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ProgressViz({ journey, mode = "rail", onArc }: { journey: JourneyDto; mode?: ProgressVizMode; onArc?: (a: ArcDto) => void }) {
  if (mode === "horizon") return <LogPoseHorizon journey={journey} />;
  if (mode === "saga") return <SeaChartBars journey={journey} />;
  return <SeaRoute journey={journey} onArc={onArc} />;
}
