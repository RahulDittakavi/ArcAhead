export function HeroRoute() {
  const pts = [
    { x: 60, y: 300, s: "done" },
    { x: 180, y: 250, s: "done" },
    { x: 300, y: 214, s: "done" },
    { x: 430, y: 192, s: "done" },
    { x: 560, y: 184, s: "current" },
    { x: 690, y: 192, s: "future" },
    { x: 815, y: 214, s: "future" },
    { x: 930, y: 252, s: "future" },
  ];
  const path = "M40 320 C 200 250, 360 196, 560 184 C 760 196, 900 248, 1000 318";
  return (
    <svg viewBox="0 0 1040 380" style={{ width: "100%", height: "auto", display: "block", filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.7))" }} fill="none">
      <defs>
        <linearGradient id="route" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--orange)" stopOpacity="0.15" />
          <stop offset="0.5" stopColor="var(--orange-hi)" stopOpacity="1" />
          <stop offset="0.58" stopColor="var(--orange)" stopOpacity="0.5" />
          <stop offset="0.78" stopColor="var(--text-4)" stopOpacity="0.5" />
          <stop offset="1" stopColor="var(--text-4)" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d={path} stroke="url(#route)" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 12" />
      {pts.map((p, i) => {
        if (p.s === "done")
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="7" fill="var(--orange)" />
              <circle cx={p.x} cy={p.y} r="13" stroke="var(--orange)" strokeOpacity="0.25" strokeWidth="1.5" />
            </g>
          );
        if (p.s === "current")
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="26" fill="var(--orange)" opacity="0.12">
                <animate attributeName="r" values="20;30;20" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.18;0.05;0.18" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx={p.x} cy={p.y} r="11" fill="var(--orange-hi)" style={{ filter: "drop-shadow(0 0 10px var(--orange-glow))" }} />
              <circle cx={p.x} cy={p.y} r="4" fill="#fff" />
            </g>
          );
        return <circle key={i} cx={p.x} cy={p.y} r="5" fill="var(--text-4)" opacity={1 - (p.x - 560) / 600} />;
      })}
      <g transform="translate(560,140)">
        <rect x="-52" y="-15" width="104" height="26" rx="13" fill="var(--surface-2)" stroke="var(--line-2)" />
        <text x="0" y="3" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--orange-hi)" letterSpacing="1">
          YOU ARE HERE
        </text>
      </g>
    </svg>
  );
}
