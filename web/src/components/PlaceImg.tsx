import type { CSSProperties, ReactNode } from "react";
import { IMAGES } from "../lib/images";
import { Icon } from "./Icon";

/* Labelled image placeholder — renders the real image once a `src` is set in
   the IMAGES registry, otherwise an obvious placeholder card printing the key
   + recommended dimensions (the prototype's PlaceImg, ported). */
export function PlaceImg({
  name,
  radius = 14,
  fit = "cover",
  compact = false,
  overlay = null,
  style = {},
  imgStyle = {},
  children,
}: {
  name: string;
  radius?: number;
  fit?: CSSProperties["objectFit"];
  compact?: boolean;
  overlay?: ReactNode;
  style?: CSSProperties;
  imgStyle?: CSSProperties;
  children?: ReactNode;
}) {
  const meta = IMAGES[name] ?? ({} as (typeof IMAGES)[string]);
  const base: CSSProperties = { position: "relative", overflow: "hidden", borderRadius: radius, width: "100%", height: "100%", ...style };

  if (meta.src) {
    return (
      <div style={base}>
        <img src={meta.src} alt={name} style={{ width: "100%", height: "100%", objectFit: fit, display: "block", ...imgStyle }} />
        {overlay}
        {children}
      </div>
    );
  }

  return (
    <div
      data-img-placeholder={name}
      title={`IMAGE PLACEHOLDER · ${name}`}
      style={{
        ...base,
        background: "linear-gradient(150deg, var(--surface-2), var(--surface))",
        border: "1.5px dashed color-mix(in oklab, var(--orange) 42%, var(--line-2))",
        display: "grid",
        placeItems: "center",
        minHeight: compact ? 0 : 60,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.5,
          pointerEvents: "none",
          backgroundImage:
            "repeating-linear-gradient(135deg, color-mix(in oklab, var(--orange) 9%, transparent) 0 1px, transparent 1px 11px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          fontFamily: "var(--font-mono)",
          fontSize: 8.5,
          letterSpacing: ".1em",
          color: "#1a0c03",
          background: "var(--orange)",
          padding: "2px 8px",
          borderBottomRightRadius: 8,
          fontWeight: 700,
        }}
      >
        IMG
      </div>
      <div style={{ position: "relative", textAlign: "center", padding: compact ? "8px" : "14px 16px", maxWidth: "94%" }}>
        <Icon name="image" size={compact ? 18 : 26} color="var(--orange)" style={{ opacity: 0.9, marginBottom: compact ? 4 : 8 }} />
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: compact ? 10 : 12.5,
            color: "var(--orange-hi)",
            letterSpacing: ".02em",
            lineHeight: 1.25,
            wordBreak: "break-word",
          }}
        >
          {name}
        </div>
        {!compact && meta.dims && (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-3)", marginTop: 5 }}>{meta.dims}</div>
        )}
        {!compact && meta.type && (
          <div style={{ fontSize: 10.5, color: "var(--text-4)", marginTop: 6, lineHeight: 1.35, maxWidth: 220 }}>{meta.type}</div>
        )}
      </div>
      {overlay}
      {children}
    </div>
  );
}
