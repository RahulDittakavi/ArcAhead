import { Logo } from "../../components/Logo";
import { Icon } from "../../components/Icon";
import { IMAGES } from "../../lib/images";
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
  logo: string; // registry key
  blurb?: string;
  grad: string;
  available: boolean;
}

const SERIES: SeriesCard[] = [
  {
    id: "one-piece",
    title: "One Piece",
    logo: "SERIES_LOGO_ONE_PIECE",
    blurb: "1100+ episodes · Spoiler Shield ready",
    grad: "linear-gradient(150deg, oklch(0.42 0.13 245), oklch(0.20 0.06 250))",
    available: true,
  },
  { id: "naruto", title: "Naruto", logo: "SERIES_LOGO_NARUTO", grad: "linear-gradient(150deg, oklch(0.46 0.13 55), oklch(0.22 0.06 50))", available: false },
  { id: "bleach", title: "Bleach", logo: "SERIES_LOGO_BLEACH", grad: "linear-gradient(150deg, oklch(0.44 0.12 25), oklch(0.20 0.05 270))", available: false },
  { id: "jojo", title: "JoJo's Bizarre Adventure", logo: "SERIES_LOGO_JOJO", grad: "linear-gradient(150deg, oklch(0.48 0.15 330), oklch(0.22 0.07 320))", available: false },
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
      {/* soft spotlight so the logo pops off the gradient */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 38%, rgba(255,255,255,0.12), transparent 60%)" }} />

      {/* the series logo, centered and contained (never stretched) */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: isMobile ? 0 : 54, display: "grid", placeItems: "center", padding: isMobile ? "26px 24px" : "30px 26px" }}>
        <img
          src={IMAGES[s.logo].src}
          alt={s.title}
          style={{ maxWidth: "86%", maxHeight: "86%", objectFit: "contain", filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.45))" }}
        />
      </div>

      {/* bottom scrim + status / CTA */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(8,9,12,0.85) 2%, transparent 38%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 14, left: 14, display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, backdropFilter: "blur(8px)", background: s.available ? "oklch(0.78 0.15 158 / 0.18)" : "rgba(8,9,12,0.55)", color: s.available ? "var(--green)" : "var(--text-2)", border: `1px solid ${s.available ? "oklch(0.78 0.15 158 / 0.35)" : "var(--line-2)"}` }}>
        <Icon name={s.available ? "shield-check" : "lock"} size={13} />
        {s.available ? "Available now" : "Coming soon"}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: isMobile ? "14px 18px" : "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{ fontSize: 12, color: "var(--text-2)" }}>{s.available ? s.blurb : "On the way"}</span>
        {s.available && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--orange-hi)", fontWeight: 700, fontSize: 13.5 }}>
            Enter <Icon name="arrow-right" size={16} />
          </span>
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
        <button className="btn btn-sm btn-primary" onClick={() => go("landing")}>Get started</button>
      </header>

      <main style={{ position: "relative", zIndex: 2, maxWidth: "var(--maxw)", margin: "0 auto", padding: isMobile ? "8px 18px 60px" : "30px 32px 90px" }}>
        <div style={{ maxWidth: 680, marginBottom: isMobile ? 26 : 40 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--orange)", marginBottom: 14 }}>
            Spoiler-free anime companions
          </div>
          <h1 style={{ fontSize: "clamp(30px,5vw,52px)", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            Choose your series.
          </h1>
          <p style={{ marginTop: 14, color: "var(--text-2)", fontSize: isMobile ? 15 : 16.5, lineHeight: 1.6, maxWidth: 560 }}>
            Track a long-running anime without getting spoiled — tell us your episode and everything ahead of it stays hidden. One Piece is live now, with more series on the way.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(220px, 1fr))", gap: isMobile ? 14 : 20 }}>
          {SERIES.map((s) => (
            <Poster key={s.id} s={s} isMobile={isMobile} onClick={() => go("landing")} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", marginTop: isMobile ? 30 : 44, fontSize: 13, color: "var(--text-3)" }}>
          <Icon name="shield-check" size={15} color="var(--green)" />
          Every series gets the same server-side Spoiler Shield.
        </div>
      </main>
    </div>
  );
}
