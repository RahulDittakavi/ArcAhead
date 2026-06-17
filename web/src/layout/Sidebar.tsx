import { Icon } from "../components/Icon";
import { Logo } from "../components/Logo";
import { useNav, type Screen } from "../lib/nav";

const items: { key: Screen; icon: string; label: string }[] = [
  { key: "dashboard", icon: "compass", label: "Voyage" },
  { key: "episodes", icon: "list-checks", label: "Episode Log" },
  { key: "arc", icon: "map", label: "Grand Line Map" },
  { key: "character", icon: "scroll", label: "The Crew" },
];

export function Sidebar() {
  const { screen, go } = useNav();
  return (
    <aside
      style={{
        width: 232,
        flexShrink: 0,
        borderRight: "1px solid var(--line)",
        padding: "26px 18px",
        position: "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-2)",
      }}
    >
      <div style={{ padding: "0 8px 24px" }}>
        <Logo size={26} onClick={() => go("catalog")} />
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((it) => {
          const active = screen === it.key || (it.key === "dashboard" && screen === "setup");
          return (
            <button
              key={it.key}
              onClick={() => go(it.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 14px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: 14.5,
                fontWeight: 500,
                textAlign: "left",
                background: active ? "var(--orange-faint)" : "transparent",
                color: active ? "var(--orange-hi)" : "var(--text-2)",
                transition: "background .2s, color .2s",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "var(--surface-2)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon name={it.icon} size={19} /> {it.label}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ padding: 14, borderRadius: "var(--r)", background: "var(--surface)", border: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 99, background: "var(--orange-faint)", display: "grid", placeItems: "center" }}>
              <Icon name="shield-check" size={16} color="var(--green)" />
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Log Pose locked</div>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-3)", lineHeight: 1.45 }}>Every island past your episode stays in the fog.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 6px" }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 99,
              background: "linear-gradient(135deg, oklch(0.6 0.13 30), oklch(0.5 0.12 280))",
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              color: "#fff",
              fontSize: 14,
            }}
          >
            N
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>navigator</div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>Free crew</div>
          </div>
          <button onClick={() => go("settings")} title="Settings" style={{ background: "transparent", border: "none", cursor: "pointer", display: "grid", placeItems: "center", padding: 4 }}>
            <Icon name="settings" size={16} color="var(--text-3)" />
          </button>
        </div>
      </div>
    </aside>
  );
}
