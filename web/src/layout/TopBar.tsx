import { Icon } from "../components/Icon";
import { useEpisode } from "../lib/episode";
import { useApi } from "../lib/useApi";
import { api } from "../lib/api";

const miniStep: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 99,
  border: "none",
  background: "transparent",
  color: "var(--text-2)",
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
};

export function TopBar({ title }: { title: string }) {
  const { ep, maxEp, setEp } = useEpisode();
  // Mirrors the prototype TopBar: shows the current island under the title.
  const { data: journey } = useApi(() => api.journey(ep), [ep]);
  const island = journey?.current?.island ?? "—";

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 32px",
        borderBottom: "1px solid var(--line)",
        background: "color-mix(in oklab, var(--bg) 78%, transparent)",
        backdropFilter: "blur(14px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--orange-faint)", border: "1px solid var(--line-2)", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Icon name="compass" size={20} color="var(--orange-hi)" />
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, lineHeight: 1.1 }}>{title}</div>
          <div style={{ fontSize: 12, color: "var(--text-3)" }}>{island}</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 2, background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 999, padding: 4 }}>
          <button onClick={() => setEp(Math.max(1, ep - 1))} style={miniStep} title="Back one episode">
            <Icon name="minus" size={15} />
          </button>
          <div style={{ padding: "0 12px", textAlign: "center", minWidth: 92 }}>
            <div style={{ fontSize: 9.5, color: "var(--text-3)", letterSpacing: "0.5px", lineHeight: 1 }}>EPISODE</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--orange-hi)", lineHeight: 1.1 }}>{ep}</div>
          </div>
          <button onClick={() => setEp(Math.min(maxEp, ep + 1))} style={miniStep} title="Forward one episode">
            <Icon name="plus" size={15} />
          </button>
        </div>
        <button className="btn btn-sm btn-ghost">
          <Icon name="bell" size={16} />
        </button>
      </div>
    </header>
  );
}
