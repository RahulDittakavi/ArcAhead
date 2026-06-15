import { useState } from "react";
import { Icon } from "../../components/Icon";
import { Card, Eyebrow, Chip } from "../../components/primitives";
import { SeaChart } from "../../components/viz";
import { useEpisode } from "../../lib/episode";
import { useApi } from "../../lib/useApi";
import { api } from "../../lib/api";
import { useIsMobile } from "../../lib/useIsMobile";
import type { ArcDto, EpisodeState } from "../../lib/types";

const STATE_META: Record<EpisodeState, { icon: string; color: string; label: string }> = {
  unwatched: { icon: "circle", color: "var(--text-4)", label: "Unwatched" },
  watched: { icon: "check-check", color: "var(--green)", label: "Watched" },
  skipped: { icon: "skip-forward", color: "var(--blue)", label: "Skipped" },
  rewatching: { icon: "rotate-ccw", color: "var(--orange-hi)", label: "Rewatching" },
};
// click cycles through these
const CYCLE: EpisodeState[] = ["unwatched", "watched", "skipped"];

function classChip(c: string) {
  const map: Record<string, { label: string; color: string }> = {
    canon: { label: "Canon", color: "var(--green)" },
    filler: { label: "Filler", color: "var(--blue)" },
    mixed: { label: "Mixed", color: "var(--orange-hi)" },
    recap: { label: "Recap", color: "var(--text-3)" },
    unclassified: { label: "—", color: "var(--text-4)" },
  };
  return map[c] ?? map.unclassified;
}

function ArcGroup({ arc, expanded, onToggle }: { arc: ArcDto; expanded: boolean; onToggle: () => void }) {
  const { stateOf, markWatched, markSkipped, markUnwatched, markUpTo, markRange, canonOnly, ep } = useEpisode();
  const fut = arc.status === "future";

  // count watched/skipped in this arc's range (from client state — no server needed)
  let done = 0;
  for (let i = arc.start; i <= arc.end; i++) {
    const s = stateOf(i);
    if (s === "watched" || s === "skipped" || s === "rewatching") done++;
  }
  const total = arc.end - arc.start + 1;

  // episodes fetched lazily only when expanded (windowed by arc)
  const { data: eps } = useApi(() => (expanded ? api.episodes(ep, { arc: arc.id }) : Promise.resolve(null)), [expanded, arc.id, ep]);

  const cycle = (n: number) => {
    const cur = stateOf(n);
    const idx = CYCLE.indexOf(cur === "rewatching" ? "watched" : cur);
    const next = CYCLE[(idx + 1) % CYCLE.length];
    if (next === "unwatched") markUnwatched(n);
    else if (next === "skipped") markSkipped(n);
    else markWatched(n);
  };

  return (
    <Card pad={0} style={{ overflow: "hidden" }}>
      <button
        onClick={onToggle}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", color: "var(--text)" }}
      >
        <Icon name={expanded ? "chevron-up" : "chevron-down"} size={18} color="var(--text-3)" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, filter: fut ? "blur(5px)" : "none", userSelect: fut ? "none" : "auto" }}>
            {fut ? "Uncharted island" : arc.island}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
            {arc.saga} · Ep {arc.start}–{arc.end}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: done === total ? "var(--green)" : "var(--text-3)" }}>{done}/{total}</span>
          <div style={{ width: 60, height: 6, borderRadius: 9, background: "var(--surface-3)", overflow: "hidden" }}>
            <div style={{ width: `${(done / total) * 100}%`, height: "100%", background: done === total ? "var(--green)" : "linear-gradient(90deg,var(--orange-deep),var(--orange-hi))" }} />
          </div>
        </div>
      </button>

      {expanded && (
        <div style={{ borderTop: "1px solid var(--line)" }}>
          <div style={{ display: "flex", gap: 8, padding: "10px 20px", borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>
            <button className="btn btn-sm btn-ghost" onClick={() => markRange(arc.start, arc.end, "watched")}>
              <Icon name="check-check" size={14} /> Mark arc watched
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => markRange(arc.start, arc.end, "unwatched")}>
              <Icon name="circle" size={14} /> Clear arc
            </button>
          </div>
          <div>
            {(eps ?? []).map((e) => {
              if (canonOnly && e.classification === "filler") return null;
              const st = stateOf(e.number);
              const meta = STATE_META[st];
              const cc = classChip(e.classification);
              const atBoundary = e.number === ep;
              return (
                <div key={e.number} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 20px", borderTop: "1px solid var(--line)", background: atBoundary ? "var(--orange-faint)" : "transparent" }}>
                  <button onClick={() => cycle(e.number)} title={meta.label + " — click to change"} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--line-2)", background: "var(--surface-2)", cursor: "pointer", display: "grid", placeItems: "center" }}>
                    <Icon name={meta.icon} size={16} color={meta.color} />
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* fogged label — never a real episode title */}
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13.5, color: st === "unwatched" ? "var(--text-2)" : "var(--text)" }}>{e.label}</span>
                    {atBoundary && <span style={{ marginLeft: 10, fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "1px", color: "var(--orange-hi)" }}>YOU ARE HERE</span>}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: cc.color }}>{cc.label}</span>
                  <button onClick={() => markUpTo(e.number)} className="chip" style={{ cursor: "pointer", fontSize: 11 }} title="Mark everything up to here watched">
                    <Icon name="check" size={11} /> up to here
                  </button>
                </div>
              );
            })}
            {!eps && <div style={{ padding: "16px 20px", color: "var(--text-3)", fontSize: 13 }}>Loading episodes…</div>}
          </div>
        </div>
      )}
    </Card>
  );
}

export function EpisodeTracker() {
  const { ep, maxEp, states, canonOnly, setCanonOnly } = useEpisode();
  const isMobile = useIsMobile();
  const { data: journey } = useApi(() => api.journey(ep), [ep]);
  const [expanded, setExpanded] = useState<string | null>(null);

  // default-expand the current arc once journey loads
  const currentId = journey?.current?.id ?? null;
  const openId = expanded ?? currentId;

  const marked = Object.values(states).filter((s) => s === "watched" || s === "skipped" || s === "rewatching").length;
  const pct = Math.round((marked / maxEp) * 100);

  return (
    <SeaChart>
      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: isMobile ? "12px 14px 32px" : "16px 32px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 22 }}>
          <div>
            <Eyebrow>Episode log</Eyebrow>
            <h1 style={{ fontSize: "clamp(26px,3vw,38px)" }}>Track every episode</h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Chip active={canonOnly} onClick={() => setCanonOnly(!canonOnly)}>
              <Icon name="filter" size={13} /> Canon only
            </Chip>
            <span className="chip"><Icon name="check-check" size={13} color="var(--green)" /> {marked} marked</span>
          </div>
        </div>

        {/* progress summary */}
        <Card pad={22} style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 8 }}>
                Spoiler boundary: <span style={{ color: "var(--orange-hi)", fontWeight: 600 }}>Episode {ep}</span> · everything past it stays fogged
              </div>
              <div style={{ height: 8, borderRadius: 9, background: "var(--surface-3)", overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", borderRadius: 9, background: "linear-gradient(90deg,var(--orange-deep),var(--orange-hi))", boxShadow: "0 0 10px var(--orange-glow)", transition: "width .5s var(--ease)" }} />
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "var(--orange-hi)" }}>{pct}%</div>
              <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>of {maxEp} episodes</div>
            </div>
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {(journey?.arcs ?? []).map((arc) => (
            <ArcGroup key={arc.id} arc={arc} expanded={openId === arc.id} onToggle={() => setExpanded(openId === arc.id ? "__none__" : arc.id)} />
          ))}
        </div>
      </div>
    </SeaChart>
  );
}
