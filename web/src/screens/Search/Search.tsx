import { useEffect, useRef, useState } from "react";
import { Icon } from "../../components/Icon";
import { Card, Eyebrow } from "../../components/primitives";
import { SeaChart } from "../../components/viz";
import { useEpisode } from "../../lib/episode";
import { useNav } from "../../lib/nav";
import { useApi } from "../../lib/useApi";
import { api } from "../../lib/api";
import { useIsMobile } from "../../lib/useIsMobile";

export function Search() {
  const { ep } = useEpisode();
  const { openArc, openChar } = useNav();
  const isMobile = useIsMobile();
  const [q, setQ] = useState("");
  const [dq, setDq] = useState(""); // debounced query actually sent
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const t = setTimeout(() => setDq(q.trim()), 220);
    return () => clearTimeout(t);
  }, [q]);

  const { data, loading } = useApi(
    () => (dq.length >= 2 ? api.search(dq, ep) : Promise.resolve(null)),
    [dq, ep]
  );

  const arcs = data?.arcs ?? [];
  const chars = data?.characters ?? [];
  const hasResults = arcs.length > 0 || chars.length > 0;
  const searched = dq.length >= 2;

  return (
    <SeaChart>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: isMobile ? "12px 14px 32px" : "16px 32px 80px" }}>
        <Eyebrow>Search</Eyebrow>
        <h1 style={{ fontSize: "clamp(26px,3vw,38px)", marginBottom: 18 }}>Find your bearings</h1>

        {/* search input */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 14, padding: "12px 16px", marginBottom: 10 }}>
          <Icon name="search" size={18} color="var(--text-3)" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search islands and crew you've reached…"
            style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 16 }}
          />
          {q && (
            <button onClick={() => { setQ(""); inputRef.current?.focus(); }} title="Clear" style={{ background: "transparent", border: "none", cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-3)" }}>
              <Icon name="x" size={16} />
            </button>
          )}
        </div>

        {/* spoiler note */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: "var(--text-3)", marginBottom: 22 }}>
          <Icon name="shield-check" size={14} color="var(--green)" />
          Only islands and crew up to <strong style={{ color: "var(--text-2)" }}>Episode {ep}</strong> are searchable — everything ahead stays in the fog.
        </div>

        {/* states */}
        {!searched && (
          <div style={{ color: "var(--text-3)", fontSize: 14, padding: "30px 0", textAlign: "center" }}>
            Type at least 2 characters to search.
          </div>
        )}
        {searched && loading && (
          <div style={{ color: "var(--text-3)", fontSize: 14, padding: "30px 0", textAlign: "center" }}>Searching…</div>
        )}
        {searched && !loading && !hasResults && (
          <Card pad={28} style={{ textAlign: "center" }}>
            <Icon name="cloud-fog" size={26} color="var(--text-3)" />
            <div style={{ marginTop: 10, fontWeight: 600 }}>Nothing in your charted waters for “{dq}”.</div>
            <div style={{ marginTop: 6, fontSize: 13, color: "var(--text-3)" }}>
              It may lie ahead — keep watching and it’ll surface once you reach it.
            </div>
          </Card>
        )}

        {/* islands */}
        {arcs.length > 0 && (
          <section style={{ marginBottom: 26 }}>
            <div style={{ fontSize: 12.5, color: "var(--text-3)", marginBottom: 10, fontFamily: "var(--font-mono)", letterSpacing: ".06em" }}>
              ISLANDS · {arcs.length}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {arcs.map((a) => (
                <Card key={a.id} pad={0} hover onClick={() => openArc(a.id)} style={{ cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 18px" }}>
                    <Icon name="map-pin" size={18} color="var(--orange-hi)" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15.5 }}>{a.island}</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)" }}>{a.saga} · Ep {a.start}–{a.end}</div>
                    </div>
                    {a.classCounts.filler > 0 && (
                      <span style={{ fontSize: 11, color: "var(--blue)" }}>{a.classCounts.filler} filler</span>
                    )}
                    <Icon name="arrow-right" size={16} color="var(--text-3)" />
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* crew */}
        {chars.length > 0 && (
          <section>
            <div style={{ fontSize: 12.5, color: "var(--text-3)", marginBottom: 10, fontFamily: "var(--font-mono)", letterSpacing: ".06em" }}>
              CREW & CHARACTERS · {chars.length}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {chars.map((c) => (
                <Card key={c.id} pad={0} hover onClick={() => openChar(c.id)} style={{ cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 18px" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 99, background: `oklch(0.6 0.12 ${c.hue})`, display: "grid", placeItems: "center", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, flexShrink: 0 }}>
                      {c.name[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15.5 }}>{c.name}</div>
                      {c.epithet && <div style={{ fontSize: 12, color: "var(--text-3)" }}>{c.epithet}</div>}
                    </div>
                    <Icon name="arrow-right" size={16} color="var(--text-3)" />
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </SeaChart>
  );
}
