export function Logo({ size = 28, withText = true, onClick }: { size?: number; withText?: boolean; onClick?: () => void }) {
  const s = size;
  return (
    <div
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 11, cursor: onClick ? "pointer" : "default", userSelect: "none" }}
    >
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="arcGrad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="var(--orange-deep)" />
            <stop offset="1" stopColor="var(--orange-hi)" />
          </linearGradient>
        </defs>
        <path d="M2.5 25 A 21 21 0 0 1 27 9.5" stroke="url(#arcGrad)" strokeWidth="3.4" strokeLinecap="round" fill="none" opacity="0.95" />
        <path d="M2.5 25 A 21 21 0 0 1 27 9.5" stroke="var(--orange)" strokeWidth="3.4" strokeLinecap="round" fill="none" strokeDasharray="2 40" opacity="0.5" />
        <circle cx="27" cy="9.5" r="4.4" fill="var(--orange-hi)" style={{ filter: "drop-shadow(0 0 7px var(--orange-glow))" }} />
        <circle cx="27" cy="9.5" r="1.7" fill="#fff" opacity="0.9" />
      </svg>
      {withText && (
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: s * 0.66, letterSpacing: "-0.03em", color: "var(--text)" }}>
          Arc<span style={{ color: "var(--orange)" }}>Ahead</span>
        </span>
      )}
    </div>
  );
}
