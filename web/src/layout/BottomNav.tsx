import { Icon } from "../components/Icon";
import { useNav, type Screen } from "../lib/nav";

const items: { key: Screen; icon: string; label: string }[] = [
  { key: "dashboard", icon: "compass", label: "Voyage" },
  { key: "episodes", icon: "list-checks", label: "Episodes" },
  { key: "arc", icon: "map", label: "Map" },
  { key: "character", icon: "scroll", label: "Crew" },
];

export const BOTTOM_NAV_H = 62;

/** Fixed bottom tab bar — the mobile replacement for the 232px sidebar. */
export function BottomNav() {
  const { screen, go } = useNav();
  return (
    <nav
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        height: BOTTOM_NAV_H,
        display: "flex",
        borderTop: "1px solid var(--line)",
        background: "color-mix(in oklab, var(--bg) 88%, transparent)",
        backdropFilter: "blur(14px)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {items.map((it) => {
        const active = screen === it.key || (it.key === "dashboard" && screen === "setup");
        return (
          <button
            key={it.key}
            onClick={() => go(it.key)}
            style={{
              flex: 1,
              minHeight: 44,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: active ? "var(--orange-hi)" : "var(--text-3)",
              fontFamily: "var(--font-body)",
              fontSize: 10.5,
              fontWeight: 500,
            }}
          >
            <Icon name={it.icon} size={21} />
            {it.label}
          </button>
        );
      })}
    </nav>
  );
}
