import type { CSSProperties } from "react";
import { Icon } from "./Icon";
import { ShieldCrest } from "./viz";

export type SpoilerStyle = "shield" | "frost" | "redacted";

export function LockedPanel({
  title,
  unlockEp,
  hint,
  spoilerStyle = "shield",
  compact = false,
}: {
  title: string;
  unlockEp: number;
  hint?: string;
  spoilerStyle?: SpoilerStyle;
  compact?: boolean;
}) {
  const base: CSSProperties = {
    position: "relative",
    borderRadius: "var(--r)",
    overflow: "hidden",
    border: "1px solid var(--line)",
    background: "var(--surface)",
    padding: compact ? 18 : 26,
    minHeight: compact ? 0 : 140,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    gap: 10,
  };

  if (spoilerStyle === "redacted") {
    return (
      <div style={{ ...base, background: "var(--surface-2)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, width: "100%", marginBottom: 6 }}>
          <span style={{ height: 11, width: "72%", background: "#000", borderRadius: 3 }} />
          <span style={{ height: 11, width: "94%", background: "#000", borderRadius: 3 }} />
          <span style={{ height: 11, width: "60%", background: "#000", borderRadius: 3 }} />
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--orange-hi)", display: "flex", alignItems: "center", gap: 7 }}>
          <Icon name="lock" size={13} /> UNCHARTED · EP {unlockEp}
        </span>
      </div>
    );
  }

  const frost = spoilerStyle === "frost";
  return (
    <div style={base}>
      {frost && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backdropFilter: "blur(7px)",
            background: "rgba(8,9,12,0.35)",
            backgroundImage: "linear-gradient(135deg, var(--surface-3) 0 1px, transparent 1px 9px)",
            opacity: 0.9,
          }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 9 }}>
        <ShieldCrest size={compact ? 34 : 44} />
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: compact ? 15 : 16.5 }}>{title}</div>
        {hint && !compact && <div style={{ fontSize: 12.5, color: "var(--text-3)", maxWidth: 230, lineHeight: 1.5 }}>{hint}</div>}
        <div
          style={{
            marginTop: 4,
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--orange-hi)",
            background: "var(--orange-faint)",
            padding: "6px 13px",
            borderRadius: 999,
          }}
        >
          <Icon name="flag" size={13} /> Reached at Episode {unlockEp}
        </div>
      </div>
    </div>
  );
}
