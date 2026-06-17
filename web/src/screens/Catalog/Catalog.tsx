import { Logo } from "../../components/Logo";
import { Icon } from "../../components/Icon";
import { PlaceImg } from "../../components/PlaceImg";
import { useNav } from "../../lib/nav";
import { useIsMobile } from "../../lib/useIsMobile";

/* The catalog is the front door: ArcAhead as a multi-series platform. Only One
   Piece is live (it routes into the app); the rest are "coming soon" — present
   so the vision reads clearly, but inert. We deliberately don't use real poster
   art for the unbuilt series (we don't have rights to it); a stylized gradient
   stands in. One Piece gets the real hero banner since it's the shipped title. */
interface SeriesCard {
  id: string;
  title: string;
  blurb: string;
  grad: string;
  available: boolean;
}

const SERIES: SeriesCard[] = [
  {
    id: "one-piece",
    title: "One Piece",
    blurb: "1100+ episodes · Spoiler Shield ready",
    grad: "linear-gradient(135deg, oklch(0.55 0.17 42), oklch(0.30 0.10 250))",
    available: true,
  },
  { id: "naruto", title: "Naruto", blurb: "Coming soon", grad: "linear-gradient(135deg, oklch(0.50 0.14 60), oklch(0.28 0.08 250))", available: false },
  { id: "bleach", title: "Bleach", blurb: "Coming soon", grad: "linear-gradient(135deg, oklch(0.45 0.13 25), oklch(0.22 0.04 280))", available: false },
  { id: "jojo", title: "JoJo's Bizarre Adventure", blurb: "Coming soon", grad: "linear-gradient(135deg, oklch(0.50 0.15 320), oklch(0.30 0.10 70))", available: false },
];

function Poster({ s, onClick, isMobile }: { s: SeriesCard; onClick?: () => void; isMobile: boolean }) {
  const clickable = s.available;
  return (
    <button
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
      className="fade-up"
      style={{
        position: "relative",
        aspectRatio: isMobile ? "16 / 9" : "3 / 4",
        borderRadius: "var(--r-xl)",
        overflow: "hidden",
        border: "1px solid var(--line-2)",
        padding: 0,
        cursor: clickable ? "pointer" : "default",
        textAlign: "left",
        background: s.grad,
        opacity: clickable ? 1 : 0.62,
        filter: clickable ? "none" : "grayscale(0.35)",
        transition: "transform .3s var(--ease), box-shadow .3s, border-color .3s",
        boxShadow: clickable ? "0 18px 50px -30px var(--orange-glow)" : "none",
      }}
      onMouseEnter={(e) => { if (clickable) { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "var(--orange)"; } }}
      onMouseLeave={(e) => { if (clickable) { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "var(--line-2)"; } }}
    >
      {/* real hero art only for the shipped title */}
      {s.available && <PlaceImg name="HERO_STRAWHAT_BANNER" radius={0} style={{ position: "absolute", inset: 0 }} />}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(8,9,12,0.92) 6%, rgba(8,9,12,0.35) 45%, transparent 75%)" }} />

      {/* status badge */}
      <div style={{ position: "absolute", top: 14, left: 14, display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, backdropFilter: "blur(8px)", background: s.available ? "oklch(0.78 0.15 158 / 0.18)" : "rgba(8,9,12,0.5)", color: s.available ? "var(--green)" : "var(--text-3)", border: `1px solid ${s.available ? "oklch(0.78 0.15 158 / 0.35)" : "var(--line-2)"}` }}>
        <Icon name={s.available ? "shield-check" : "lock"} size={13} />
        {s.available ? "Available now" : "Coming soon"}
      </div>

      {/* title block */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: isMobile ? "16px 18px" : "20px 22px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: isMobile ? 22 : 25, lineHeight: 1.1, letterSpacing: "-0.02em" }}>{s.title}</div>
        <div style={{ fontSize: 12.5, color: "var(--text-2)", marginTop: 5 }}>{s.blurb}</div>
        {s.available && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 14, color: "var(--orange-hi)", fontWeight: 600, fontSize: 14 }}>
            Enter <Icon name="arrow-right" size={17} />
          </div>
        )}
      </div>
    </button>
  );
}

export function Catalog() {
  const { go } = useNav();
  const isMobile = useIsMobile();

  return (
    <div style={{ position: "relative", overflowX: "hidden", minHeight: "100vh" }}>
      <div style={{ position: "absolute", top: -160, left: "50%", transform: "translateX(-50%)", width: "min(900px, 100%)", height: 520, background: "radial-gradient(ellipse at center, var(--orange-faint), transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

      <header style={{ position: "relative", zIndex: 3, maxWidth: "var(--maxw)", margin: "0 auto", padding: isMobile ? "20px 18px" : "26px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo />
        <button className="btn btn-sm btn-primary" onClick={() => go("landing")}>Set sail free</button>
      </header>

      <main style={{ position: "relative", zIndex: 2, maxWidth: "var(--maxw)", margin: "0 auto", padding: isMobile ? "8px 18px 60px" : "30px 32px 90px" }}>
        <div style={{ maxWidth: 680, marginBottom: isMobile ? 26 : 40 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--orange)", marginBottom: 14 }}>
            Spoiler-free anime companions
          </div>
          <h1 style={{ fontSize: "clamp(30px,5vw,52px)", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            Choose your voyage.
          </h1>
          <p style={{ marginTop: 14, color: "var(--text-2)", fontSize: isMobile ? 15 : 16.5, lineHeight: 1.6, maxWidth: 560 }}>
            Track the long-runners without getting spoiled. Tell us your episode and we chart what’s behind you while keeping everything ahead in the fog. One Piece is live now — more crews on the way.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(220px, 1fr))", gap: isMobile ? 14 : 20 }}>
          {SERIES.map((s) => (
            <Poster key={s.id} s={s} isMobile={isMobile} onClick={() => go("landing")} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", marginTop: isMobile ? 30 : 44, fontSize: 13, color: "var(--text-3)" }}>
          <Icon name="shield-check" size={15} color="var(--green)" />
          Every series ships with the same server-side Spoiler Shield.
        </div>
      </main>
    </div>
  );
}
