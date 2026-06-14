import { useState, type CSSProperties, type ReactNode } from "react";
import { Icon } from "./Icon";
import { IMAGES } from "../lib/images";

// ---------- Sea-chart background texture ----------
export function SeaChart({ children, style = {}, intensity = 1 }: { children: ReactNode; style?: CSSProperties; intensity?: number }) {
  return (
    <div style={{ position: "relative", ...style }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.55 * intensity,
          backgroundImage:
            "linear-gradient(color-mix(in oklab, var(--orange) 6%, transparent) 1px, transparent 1px)," +
            "linear-gradient(90deg, color-mix(in oklab, var(--orange) 6%, transparent) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 90% 80% at 50% 40%, #000 30%, transparent 85%)",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

// ---------- Compass rose ----------
export function CompassRose({ size = 120, opacity = 0.5, color = "var(--orange)" }: { size?: number; opacity?: number; color?: string }) {
  const c = size / 2,
    r = c - 4;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ opacity }} fill="none">
      <circle cx={c} cy={c} r={r} stroke={color} strokeWidth="1" strokeOpacity="0.5" />
      <circle cx={c} cy={c} r={r * 0.66} stroke={color} strokeWidth="1" strokeOpacity="0.3" />
      <line x1={c} y1={c - r} x2={c} y2={c + r} stroke={color} strokeWidth="1" strokeOpacity="0.4" />
      <line x1={c - r} y1={c} x2={c + r} y2={c} stroke={color} strokeWidth="1" strokeOpacity="0.4" />
      <polygon points={`${c},${c - r * 0.8} ${c - 7},${c} ${c + 7},${c}`} fill={color} fillOpacity="0.85" />
      <polygon points={`${c},${c + r * 0.8} ${c - 7},${c} ${c + 7},${c}`} fill={color} fillOpacity="0.28" />
      <circle cx={c} cy={c} r="3.5" fill={color} />
      <text x={c} y={c - r + 12} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill={color} fillOpacity="0.8">
        N
      </text>
    </svg>
  );
}

// ---------- Ship marker ----------
export function ShipMarker({ size = 46 }: { size?: number }) {
  const meta = IMAGES.SHIP_PROGRESS_IMAGE ?? {};
  const [failed, setFailed] = useState(false);
  if (meta.src && !failed) {
    return (
      <img
        src={meta.src}
        alt="SHIP_PROGRESS_IMAGE"
        onError={() => setFailed(true)}
        style={{ width: size, height: "auto", display: "block", filter: "drop-shadow(0 6px 12px rgba(0,0,0,.5))" }}
      />
    );
  }
  return (
    <div
      title="SHIP_PROGRESS_IMAGE"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        position: "relative",
        background: "radial-gradient(circle at 38% 32%, var(--orange-hi), var(--orange-deep))",
        boxShadow: "0 0 0 4px color-mix(in oklab, var(--orange) 18%, transparent), 0 8px 22px -6px var(--orange-glow)",
      }}
    >
      <Icon name="sailboat" size={size * 0.55} color="#1a0c03" />
    </div>
  );
}

// ---------- LogPose (circular progress as a compass dial) ----------
export function LogPose({ pct = 0, size = 138, stroke = 9, label, sub }: { pct?: number; size?: number; stroke?: number; label?: ReactNode; sub?: string }) {
  const r = (size - stroke) / 2;
  const ang = (pct / 100) * 360 - 90;
  const nx = size / 2 + Math.cos((ang * Math.PI) / 180) * (r - 14);
  const ny = size / 2 + Math.sin((ang * Math.PI) / 180) * (r - 14);
  const innerR = r - 12;
  const circ = 2 * Math.PI * innerR;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * 2 * Math.PI;
          const x1 = size / 2 + Math.cos(a) * (r + 1),
            y1 = size / 2 + Math.sin(a) * (r + 1);
          const x2 = size / 2 + Math.cos(a) * (r - (i % 6 === 0 ? 7 : 4)),
            y2 = size / 2 + Math.sin(a) * (r - (i % 6 === 0 ? 7 : 4));
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--text-4)" strokeWidth={i % 6 === 0 ? 1.6 : 1} strokeOpacity="0.6" />;
        })}
        <g style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}>
          <circle cx={size / 2} cy={size / 2} r={innerR} stroke="var(--surface-3)" strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={innerR}
            stroke="var(--orange)"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct / 100)}
            style={{ transition: "stroke-dashoffset 1s var(--ease)", filter: "drop-shadow(0 0 6px var(--orange-glow))" }}
          />
        </g>
        <line x1={size / 2} y1={size / 2} x2={nx} y2={ny} stroke="var(--orange-hi)" strokeWidth="2.5" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 4px var(--orange-glow))", transition: "all 1s var(--ease)" }} />
        <circle cx={size / 2} cy={size / 2} r="4.5" fill="var(--orange-hi)" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 6 }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: size * 0.24, lineHeight: 1 }}>{label}</span>
        {sub && <span style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 3, letterSpacing: "0.02em" }}>{sub}</span>}
      </div>
    </div>
  );
}

// ---------- Segmented hype meter ----------
export function HypeMeter({ value = 80, segments = 24, height = 12, showValue = true }: { value?: number; segments?: number; height?: number; showValue?: boolean }) {
  const lit = Math.round((value / 100) * segments);
  return (
    <div>
      <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height }}>
        {Array.from({ length: segments }).map((_, i) => {
          const on = i < lit;
          const t = i / segments;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: "100%",
                borderRadius: 3,
                background: on ? `oklch(${0.74 - t * 0.05} 0.175 ${52 - t * 18})` : "var(--surface-3)",
                boxShadow: on && i >= lit - 3 ? "0 0 10px var(--orange-glow)" : "none",
                transition: "background .4s var(--ease)",
              }}
            />
          );
        })}
      </div>
      {showValue && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 9, fontSize: 12, color: "var(--text-3)" }}>
          <span>Crew hype</span>
          <span style={{ color: "var(--orange-hi)", fontWeight: 700, fontFamily: "var(--font-display)" }}>
            {value}
            <span style={{ color: "var(--text-3)", fontWeight: 400 }}>/100</span>
          </span>
        </div>
      )}
    </div>
  );
}

// ---------- ShieldCrest (Log Pose seal) ----------
export function ShieldCrest({ size = 46, sealed = true }: { size?: number; sealed?: boolean }) {
  return (
    <div style={{ position: "relative", width: size, height: size, display: "grid", placeItems: "center" }}>
      <span style={{ position: "absolute", inset: -8, borderRadius: "50%", background: "radial-gradient(circle, var(--orange-faint), transparent 70%)" }} />
      <Icon name="shield" size={size} color="var(--orange)" style={{ filter: "drop-shadow(0 0 8px var(--orange-glow))" }} />
      <Icon name={sealed ? "anchor" : "check"} size={size * 0.4} color="var(--orange-hi)" style={{ position: "absolute" }} />
    </div>
  );
}
