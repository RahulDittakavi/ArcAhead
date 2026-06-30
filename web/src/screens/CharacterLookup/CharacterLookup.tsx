import { useEffect, useState } from "react";
import { Icon } from "../../components/Icon";
import { Card, Eyebrow, SafeBadge } from "../../components/primitives";
import { SeaChart, ShieldCrest } from "../../components/viz";
import { BountyPoster } from "../../components/BountyPoster";
import { LockedPanel } from "../../components/LockedPanel";
import { useEpisode } from "../../lib/episode";
import { useApi } from "../../lib/useApi";
import { api } from "../../lib/api";
import { useIsMobile } from "../../lib/useIsMobile";

function InfoHead({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
      <Icon name={icon} size={17} color="var(--orange-hi)" />
      <h3 style={{ fontSize: 17 }}>{title}</h3>
    </div>
  );
}

/** Last word of a name — "Monkey D. Luffy" → "Luffy", "Nico Robin" → "Robin" */
function shortName(name: string) {
  return name.split(" ").slice(-1)[0];
}

export function CharacterLookup({ initialCharId }: { initialCharId: string | null }) {
  const { ep } = useEpisode();
  const isMobile = useIsMobile();
  const { data: chars } = useApi(() => api.characters(ep), [ep]);
  const all = chars ?? [];

  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!initialCharId || !all.length) return;
    const c = all.find((x) => x.id === initialCharId);
    if (c) { setSelectedId(c.id); setQ(shortName(c.name)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCharId, all.length]);

  function handleQuery(val: string) {
    setQ(val);
    setSelectedId(null);
  }

  function select(c: (typeof all)[0]) {
    setSelectedId(c.id);
    setQ(shortName(c.name));
  }

  const trimmed = q.trim().toLowerCase();
  const searchResults = trimmed.length > 0
    ? all.filter((c) => c.name.toLowerCase().includes(trimmed))
    : [];

  const match = selectedId ? (all.find((c) => c.id === selectedId) ?? null) : null;
  const introducedYet = !!match && match.introduced;
  const showResults = trimmed.length > 0 && !selectedId;
  const suggestions = all.filter((c) => c.introduced);

  return (
    <SeaChart>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: isMobile ? "12px 16px 32px" : "16px 32px 80px" }}>
        <Eyebrow>Safe crew lookup</Eyebrow>
        <h1 style={{ fontSize: "clamp(26px,3.2vw,40px)", marginBottom: 18 }}>Pull anyone's wanted poster — safely.</h1>

        <div style={{ position: "relative", maxWidth: 520, marginBottom: 4 }}>
          <Icon name="search" size={18} color="var(--text-3)" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={q}
            onChange={(e) => handleQuery(e.target.value)}
            placeholder="Search a pirate… try 'Luffy', 'L', 'Red Hair'"
            style={{
              width: "100%",
              padding: "14px 16px 14px 44px",
              borderRadius: showResults ? "20px 20px 0 0" : 999,
              border: "1px solid var(--line-2)",
              borderBottom: showResults ? "none" : undefined,
              background: "var(--surface)",
              color: "var(--text)",
              fontSize: 15,
              fontFamily: "var(--font-body)",
              outline: "none",
            }}
          />
        </div>

        {/* live search results */}
        {showResults && (
          <div style={{
            maxWidth: 520,
            border: "1px solid var(--line-2)",
            borderRadius: "0 0 20px 20px",
            background: "var(--surface)",
            overflow: "hidden",
            marginBottom: 24,
          }}>
            {searchResults.length === 0 ? (
              <div style={{ padding: "14px 20px", color: "var(--text-3)", fontSize: 14 }}>
                No pirate found for "{q}"
              </div>
            ) : (
              searchResults.map((c) => (
                <div
                  key={c.id}
                  onClick={() => select(c)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", cursor: "pointer", borderTop: "1px solid var(--line)", transition: "background 0.1s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 99, background: `oklch(0.5 0.12 ${(c as any).hue ?? 30})`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                    {c.introduced
                      ? <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#fff" }}>{c.name[0]}</span>
                      : <Icon name="lock" size={13} color="rgba(255,255,255,0.5)" />
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: c.introduced ? "var(--text)" : "var(--text-3)" }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-4)", marginTop: 1 }}>
                      {c.introduced
                        ? [(c as any).role, (c as any).affil].filter(Boolean).join(" · ")
                        : `Appears around ep ${c.epaffirst}`
                      }
                    </div>
                  </div>
                  {c.introduced && <Icon name="arrow-right" size={14} color="var(--text-4)" />}
                </div>
              ))
            )}
          </div>
        )}

        {/* suggestion chips (visible when not in search mode) */}
        {!showResults && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32, marginTop: 10 }}>
            {suggestions.map((c) => (
              <button
                key={c.id}
                onClick={() => select(c)}
                className="chip"
                style={{ cursor: "pointer", background: match?.id === c.id ? "var(--orange-faint)" : "var(--surface-2)", color: match?.id === c.id ? "var(--orange-hi)" : "var(--text-2)" }}
              >
                {shortName(c.name)}
              </button>
            ))}
          </div>
        )}

        {!match && !showResults && (
          <Card pad={40} style={{ textAlign: "center", color: "var(--text-3)" }}>
            Search a pirate above to view their dossier.
          </Card>
        )}

        {match && !introducedYet && (
          <Card pad={40} style={{ textAlign: "center" }}>
            <div style={{ display: "inline-block", marginBottom: 16 }}><ShieldCrest size={54} /></div>
            <h2 style={{ fontSize: 24, marginBottom: 10 }}>You haven't crossed paths yet</h2>
            <p style={{ color: "var(--text-2)", maxWidth: 380, margin: "0 auto", lineHeight: 1.55 }}>
              <b>{match.name}</b> first appears around episode {match.epaffirst}. We'll keep their poster sealed until you get there.
            </p>
            <div style={{ marginTop: 18, display: "inline-flex" }}>
              <span className="chip" style={{ color: "var(--orange-hi)", background: "var(--orange-faint)", borderColor: "var(--orange)" }}>
                <Icon name="flag" size={13} /> Reached at Episode {match.epaffirst}
              </span>
            </div>
          </Card>
        )}

        {match && introducedYet && (
          <div>
            <div style={{ display: "flex", gap: 28, alignItems: "stretch", marginBottom: 28, flexWrap: "wrap" }}>
              <div style={{ width: 210, flexShrink: 0 }}>
                <BountyPoster char={match} />
              </div>
              <div style={{ flex: 1, minWidth: 240, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: "1.5px", color: "var(--text-3)", marginBottom: 8 }}>
                  {((match as any).role ?? "").toUpperCase()} · {((match as any).affil ?? "").toUpperCase()}
                </div>
                <h2 style={{ fontSize: "clamp(28px,3.4vw,44px)", marginBottom: 6 }}>{match.name}</h2>
                {(match as any).epithet && <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--orange-hi)", marginBottom: 16 }}>"{(match as any).epithet}"</div>}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
                  <SafeBadge ep={ep} size="lg" />
                  {(match as any).bounty && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 999, background: "var(--orange-faint)", border: "1px solid color-mix(in oklab, var(--orange) 32%, transparent)", color: "var(--orange-hi)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>
                      <Icon name="scroll" size={17} /> ฿ {(match as any).bounty}
                    </div>
                  )}
                </div>
                <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.6, maxWidth: 520 }}>{(match as any).overview}</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <Card pad={26}>
                <InfoHead icon="flag" title="Affiliations" />
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 11 }}>
                  {((match as any).affiliations ?? []).map((a: string, i: number) => (
                    <li key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: "var(--text-2)" }}>
                      <Icon name="dot" size={16} color="var(--orange-hi)" style={{ marginTop: 1, flexShrink: 0 }} /> {a}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card pad={26}>
                <InfoHead icon="eye" title="Sightings so far" />
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 11 }}>
                  {((match as any).appearances ?? []).map((a: string, i: number) => (
                    <li key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: "var(--text-2)" }}>
                      <Icon name="clapperboard" size={15} color="var(--text-3)" style={{ marginTop: 2, flexShrink: 0 }} /> {a}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card pad={26}>
                <InfoHead icon="heart-handshake" title="Bonds" />
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 11 }}>
                  {((match as any).relationships ?? []).map((a: string, i: number) => (
                    <li key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: "var(--text-2)" }}>
                      <Icon name="anchor" size={14} color="var(--text-3)" style={{ marginTop: 2, flexShrink: 0 }} /> {a}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card pad={26}>
                <InfoHead icon="map-pin" title="First sighting" />
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 34, color: "var(--orange-hi)" }}>Ep {match.epaffirst}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 8, lineHeight: 1.5 }}>The episode where you first crossed wakes with this character.</p>
              </Card>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 9, margin: "26px 0 16px" }}>
              <Icon name="cloud-fog" size={16} color="var(--text-3)" />
              <h3 style={{ fontSize: 17 }}>Still in the fog</h3>
              <span style={{ fontSize: 13, color: "var(--text-3)" }}>· revealed as you sail on</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 16 }}>
              {((match as any).locked ?? []).map((l: { title: string; hint: string; unlockEp: number }, i: number) => (
                <LockedPanel key={i} title={l.title} hint={l.hint} unlockEp={l.unlockEp} spoilerStyle="shield" />
              ))}
            </div>
          </div>
        )}
      </div>
    </SeaChart>
  );
}
