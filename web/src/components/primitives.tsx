import { useState, type CSSProperties, type ReactNode } from "react";
import { Icon } from "./Icon";

// ---------- Button ----------
type BtnVariant = "primary" | "ghost";
type BtnSize = "lg" | "md" | "sm";
export function Button({
  variant = "primary",
  size = "md",
  children,
  onClick,
  style,
  type = "button",
}: {
  variant?: BtnVariant;
  size?: BtnSize;
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  type?: "button" | "submit";
}) {
  return (
    <button type={type} onClick={onClick} className={`btn btn-${size} btn-${variant}`} style={style}>
      {children}
    </button>
  );
}

// ---------- Chip ----------
export function Chip({
  children,
  onClick,
  active,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  style?: CSSProperties;
}) {
  return (
    <span
      className="chip"
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
        ...(active
          ? { background: "var(--orange-faint)", color: "var(--orange-hi)", borderColor: "var(--orange)" }
          : {}),
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ---------- Card ----------
export function Card({
  children,
  pad = 24,
  style = {},
  hover = false,
  onClick,
  glow = false,
}: {
  children: ReactNode;
  pad?: number;
  style?: CSSProperties;
  hover?: boolean;
  onClick?: () => void;
  glow?: boolean;
}) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r)",
        padding: pad,
        position: "relative",
        transition: "transform .3s var(--ease), border-color .3s, box-shadow .3s",
        transform: hover && h ? "translateY(-3px)" : "none",
        borderColor: hover && h ? "var(--line-2)" : "var(--line)",
        boxShadow: glow ? "0 24px 60px -34px var(--orange-glow)" : hover && h ? "var(--shadow)" : "none",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ---------- Eyebrow ----------
export function Eyebrow({ children, color = "var(--orange)" }: { children: ReactNode; color?: string }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color,
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

// ---------- Stars ----------
export function Stars({ rating, max = 10 }: { rating: number; max?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-display)", fontWeight: 700 }}>
      <Icon name="star" size={15} color="var(--orange-hi)" style={{ filter: "drop-shadow(0 0 5px var(--orange-glow))" }} />
      {rating.toFixed(1)}
      <span style={{ color: "var(--text-4)", fontWeight: 400, fontSize: 13 }}>/{max}</span>
    </span>
  );
}

// ---------- SafeBadge ----------
export function SafeBadge({ ep, size = "md" }: { ep: number; size?: "md" | "lg" }) {
  const big = size === "lg";
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: big ? 10 : 7,
        padding: big ? "10px 18px" : "6px 12px",
        borderRadius: 999,
        background: "oklch(0.78 0.15 158 / 0.13)",
        border: "1px solid oklch(0.78 0.15 158 / 0.3)",
        color: "var(--green)",
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        fontSize: big ? 16 : 12.5,
      }}
    >
      <Icon name="shield-check" size={big ? 19 : 14} />
      Safe for Episode {ep}
    </div>
  );
}
