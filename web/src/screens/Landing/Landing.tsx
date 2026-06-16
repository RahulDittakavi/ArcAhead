import { Icon } from "../../components/Icon";
import { Logo } from "../../components/Logo";
import { Eyebrow } from "../../components/primitives";
import { PlaceImg } from "../../components/PlaceImg";
import { BountyPoster } from "../../components/BountyPoster";
import { CompassRose } from "../../components/viz";
import { useNav } from "../../lib/nav";
import { useEpisode } from "../../lib/episode";
import { useApi } from "../../lib/useApi";
import { api } from "../../lib/api";
import { useIsMobile } from "../../lib/useIsMobile";

const navLink: React.CSSProperties = { fontSize: 14.5, color: "var(--text-2)", cursor: "pointer", fontWeight: 500 };

const features = [
  { icon: "shield-check", t: "Spoiler Shield", d: "Every screen knows the exact episode you're on. Anything past your log pose simply isn't shown — no slips, no \"oops\".", big: true },
  { icon: "map", t: "Grand Line Voyage Map", d: "Watch the sea route light up island by island as you sail — and the fog roll back ahead." },
  { icon: "scroll", t: "Safe Crew Lookup", d: "Look up any pirate. You only ever see what you've already earned the right to know." },
  { icon: "activity", t: "Crew Hype", d: "Feel how loud the room is getting — without a single word about why." },
  { icon: "anchor", t: "Reactions, Spoiler-Free", d: "Real crew energy, deliberately vague. The feeling, never the facts." },
];

const HIGHLIGHT_ARC_IDS = ["alabasta", "enies-lobby", "marineford", "wano"];

export function Landing() {
  const { go } = useNav();
  const isMobile = useIsMobile();
  const { ep } = useEpisode();
  const { data: chars } = useApi(() => api.characters(ep), [ep]);
  const { data: arcs } = useApi(() => api.arcs(ep), [ep]);

  const crew = (chars ?? []).filter((c) => c.crew);
  const highlightArcs = HIGHLIGHT_ARC_IDS.map((id) => (arcs ?? []).find((a) => a.id === id)).filter(Boolean) as NonNullable<typeof arcs>;

  return (
    // clip horizontal overflow from the decorative glows/compass — they bleed
    // wider than narrow viewports and were causing a scroll-right into blank.
    // Root height is auto, so clipping X can't create a nested scroll container.
    <div style={{ position: "relative", overflowX: "hidden" }}>
      <div style={{ position: "absolute", top: -160, left: "50%", transform: "translateX(-50%)", width: "min(900px, 100%)", height: 520, background: "radial-gradient(ellipse at center, var(--orange-faint), transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", top: 40, right: 60, opacity: 0.5, pointerEvents: "none", zIndex: 0 }}>
        <CompassRose size={150} opacity={0.4} />
      </div>

      <header style={{ position: "relative", zIndex: 3, maxWidth: "var(--maxw)", margin: "0 auto", padding: "26px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo />
        <nav style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 30 }}>
          {!isMobile && (
            <>
              <span className="lnk" style={navLink}>How it works</span>
              <span className="lnk" style={navLink}>The Crew</span>
              <span className="lnk" style={navLink}>Spoiler Shield</span>
              <button className="btn btn-sm btn-ghost" onClick={() => go("setup")}>Sign in</button>
            </>
          )}
          <button className="btn btn-sm btn-primary" onClick={() => go("setup")}>Set sail free</button>
        </nav>
      </header>

      {/* hero */}
      <section style={{ position: "relative", zIndex: 2, maxWidth: 1000, margin: "0 auto", padding: "48px 32px 0", textAlign: "center" }}>
        <div className="fade-up chip" style={{ marginBottom: 24 }}>
          <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--green)", boxShadow: "0 0 8px var(--green)" }} />
          The spoiler-free companion for first-time One Piece voyages
        </div>
        <h1 className="fade-up" style={{ fontSize: "clamp(40px, 6.6vw, 84px)", lineHeight: 0.99, fontWeight: 700, marginBottom: 22, animationDelay: ".05s" }}>
          Sail the Grand Line.
          <br />
          <span style={{ color: "var(--orange)" }}>Never</span> see it coming.
        </h1>
        <p className="fade-up" style={{ fontSize: "clamp(17px,2.1vw,21px)", color: "var(--text-2)", maxWidth: 560, margin: "0 auto 34px", lineHeight: 1.55, animationDelay: ".12s" }}>
          ArcAhead is your navigator through One Piece. Tell us your episode — we'll chart the islands behind you, light the next horizon, and keep everything past it lost in the fog.
        </p>
        <div className="fade-up" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", animationDelay: ".18s" }}>
          <button className="btn btn-lg btn-primary" onClick={() => go("setup")}>
            Start Your Voyage <Icon name="arrow-right" size={19} />
          </button>
          <button className="btn btn-lg btn-ghost" onClick={() => go("dashboard")}>
            <Icon name="play" size={17} /> See it in action
          </button>
        </div>
      </section>

      {/* hero banner */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1120, margin: "44px auto 0", padding: "0 32px" }}>
        <div className="fade-up" style={{ animationDelay: ".24s", position: "relative", borderRadius: "var(--r-xl)", overflow: "hidden", border: "1px solid var(--line-2)", boxShadow: "var(--shadow)", aspectRatio: "2 / 1" }}>
          <PlaceImg name="HERO_STRAWHAT_BANNER" radius={0} style={{ position: "absolute", inset: 0 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(8,9,12,0.9) 0%, rgba(8,9,12,0.4) 22%, transparent 52%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "0 14px 6px" }}>
            {/* sea route overlaid on the hero banner — imported lazily to keep this file lean */}
            <HeroRouteOverlay />
          </div>
          <div style={{ position: "absolute", top: 18, left: 20, display: "flex", gap: 8 }}>
            <span className="chip" style={{ background: "rgba(8,9,12,0.6)", backdropFilter: "blur(6px)", border: "1px solid var(--line-2)" }}>
              <Icon name="users" size={12} color="var(--orange-hi)" /> 248k navigators aboard
            </span>
          </div>
        </div>
      </section>

      {/* crew highlights */}
      <section style={{ position: "relative", zIndex: 2, maxWidth: "var(--maxw)", margin: "0 auto", padding: "70px 32px 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <div>
            <Eyebrow>Meet the crew — safely</Eyebrow>
            <h2 style={{ fontSize: "clamp(26px,3.4vw,40px)", maxWidth: 560 }}>Wanted posters that only reveal what you've already seen.</h2>
          </div>
          <span className="chip"><Icon name="shield" size={12} color="var(--green)" /> spoiler-safe for your episode</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(6, 1fr)", gap: 16 }}>
          {crew.map((c) => (
            <BountyPoster key={c.id} char={c} scale={0.9} onClick={() => go("setup")} />
          ))}
        </div>
      </section>

      {/* carousel */}
      <section style={{ position: "relative", zIndex: 2, maxWidth: 1000, margin: "0 auto", padding: "60px 32px 10px" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <Eyebrow>Moments from the voyage</Eyebrow>
          <h2 style={{ fontSize: "clamp(26px,3.4vw,40px)" }}>Every island earns its reveal.</h2>
        </div>
        <VoyageCarouselLazy />
      </section>

      {/* arc / island highlights */}
      <section style={{ position: "relative", zIndex: 2, maxWidth: "var(--maxw)", margin: "0 auto", padding: "70px 32px 20px" }}>
        <Eyebrow>Islands ahead</Eyebrow>
        <h2 style={{ fontSize: "clamp(26px,3.4vw,40px)", marginBottom: 28, maxWidth: 560 }}>Discovered islands light up. Distant ones stay in the fog.</h2>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 16 }}>
          {highlightArcs.map((a) => {
            const fog = a.status === "future";
            return (
              <div key={a.id} style={{ position: "relative", borderRadius: "var(--r-lg)", overflow: "hidden", border: "1px solid var(--line)" }}>
                <div style={{ position: "relative", aspectRatio: "16 / 11" }}>
                  {a.hasBanner && !fog ? (
                    <PlaceImg name={a.banner ?? ""} radius={0} style={{ position: "absolute", inset: 0 }} />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(155deg, oklch(0.42 0.13 32), oklch(0.16 0.05 32))" }} />
                  )}
                  {fog && (
                    <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(8px)", background: "rgba(8,9,12,0.45)", display: "grid", placeItems: "center" }}>
                      <Icon name="cloud-fog" size={30} color="var(--text-2)" />
                    </div>
                  )}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(8,9,12,0.85), transparent 60%)", pointerEvents: "none" }} />
                </div>
                <div style={{ position: "absolute", left: 16, right: 16, bottom: 14 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".12em", color: fog ? "var(--text-3)" : "var(--orange-hi)", marginBottom: 5 }}>
                    {fog ? "UNCHARTED" : "DISCOVERED"} · {a.saga.toUpperCase()}
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, filter: fog ? "blur(5px)" : "none" }}>{a.island}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* features bento */}
      <section style={{ position: "relative", zIndex: 2, maxWidth: "var(--maxw)", margin: "0 auto", padding: "70px 32px 30px" }}>
        <Eyebrow>What ArcAhead does</Eyebrow>
        <h2 style={{ fontSize: "clamp(28px,3.6vw,42px)", marginBottom: 36, maxWidth: 640 }}>Everything you need to enjoy the voyage — nothing you haven't reached yet.</h2>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(6, 1fr)", gap: 16 }}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                gridColumn: isMobile ? "auto" : f.big ? "span 3" : "span 2",
                background: f.big ? "linear-gradient(160deg, var(--surface-2), var(--surface))" : "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: "var(--r-lg)",
                padding: f.big ? 32 : 24,
                position: "relative",
                overflow: "hidden",
                minHeight: f.big ? 220 : 180,
              }}
            >
              {f.big && <div style={{ position: "absolute", top: -60, right: -40, width: 220, height: 220, background: "radial-gradient(circle, var(--orange-faint), transparent 70%)" }} />}
              <div style={{ position: "relative", display: "inline-flex", padding: 12, borderRadius: 14, marginBottom: f.big ? 20 : 16, background: f.big ? "var(--orange-faint)" : "var(--surface-3)", color: f.big ? "var(--orange-hi)" : "var(--text)" }}>
                <Icon name={f.icon} size={f.big ? 26 : 21} />
              </div>
              <h3 style={{ fontSize: f.big ? 24 : 18.5, marginBottom: 10 }}>{f.t}</h3>
              <p style={{ fontSize: f.big ? 16 : 14, color: "var(--text-2)", lineHeight: 1.55, maxWidth: f.big ? 360 : "none" }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* closing CTA */}
      <section style={{ position: "relative", zIndex: 2, maxWidth: "var(--maxw)", margin: "40px auto 0", padding: "0 32px 90px" }}>
        <div style={{ position: "relative", overflow: "hidden", borderRadius: "var(--r-xl)", padding: "64px 40px", textAlign: "center", background: "linear-gradient(160deg, var(--surface-2), var(--bg-2))", border: "1px solid var(--line)" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 120%, var(--orange-faint), transparent 60%)" }} />
          <div style={{ position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)", opacity: 0.5 }}>
            <CompassRose size={110} opacity={0.35} />
          </div>
          <div style={{ position: "relative" }}>
            <h2 style={{ fontSize: "clamp(30px,4.2vw,52px)", marginBottom: 16 }}>The greatest voyage deserves a careful first read.</h2>
            <p style={{ color: "var(--text-2)", fontSize: 18, marginBottom: 30, maxWidth: 480, margin: "0 auto 30px" }}>Set your episode once. We'll guard every horizon from here to the New World.</p>
            <button className="btn btn-lg btn-primary" onClick={() => go("setup")}>
              Start Your Voyage <Icon name="arrow-right" size={19} />
            </button>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 34, color: "var(--text-3)", fontSize: 13, flexWrap: "wrap", gap: 10 }}>
          <Logo size={22} />
          <span>Spoiler-free since episode one. · Series name is a factual reference; all artwork is yours to add.</span>
        </div>
      </section>
    </div>
  );
}

// Local re-exports to keep imports tidy at the top of the file.
import { HeroRoute as HeroRouteOverlay } from "./HeroRoute";
import { VoyageCarousel as VoyageCarouselLazy } from "./VoyageCarousel";
