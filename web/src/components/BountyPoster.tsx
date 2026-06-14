import { useState, type CSSProperties } from "react";
import type { CharacterDto } from "../lib/types";
import { PlaceImg } from "./PlaceImg";

// Per-character mugshot framing so every poster crops to the face evenly.
const MUG_FRAME: Record<string, CSSProperties> = {
  luffy: { objectPosition: "center 30%" },
  zoro: { objectPosition: "center 32%" },
  nami: { objectPosition: "center 16%" },
  sanji: { objectPosition: "center 20%" },
  robin: { objectPosition: "center 30%" },
  chopper: { objectPosition: "center 30%", transform: "scale(1.55)", transformOrigin: "center 30%" },
};

export function BountyPoster({
  char,
  onClick,
  width = "100%",
  scale = 1,
}: {
  char: Pick<CharacterDto, "id" | "name" | "epithet" | "bounty" | "img">;
  onClick?: () => void;
  width?: string | number;
  scale?: number;
}) {
  const [h, setH] = useState(false);
  const lastName = char.name.split(" ").slice(-1)[0];
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width,
        cursor: onClick ? "pointer" : "default",
        transition: "transform .3s var(--ease)",
        transform: h && onClick ? "translateY(-4px) rotate(-0.6deg)" : "none",
      }}
    >
      <div
        style={{
          position: "relative",
          borderRadius: 6,
          overflow: "hidden",
          background: "linear-gradient(160deg, #efe2c4, #d9c7a0)",
          border: "1px solid #b89f73",
          boxShadow: h && onClick ? "0 26px 50px -22px rgba(0,0,0,.7)" : "0 14px 30px -20px rgba(0,0,0,.6)",
          padding: `${14 * scale}px ${12 * scale}px`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.5,
            backgroundImage:
              "radial-gradient(circle at 20% 12%, rgba(120,82,30,.18), transparent 40%), radial-gradient(circle at 86% 88%, rgba(120,82,30,.22), transparent 45%)",
          }}
        />
        <div style={{ position: "relative" }}>
          <div style={{ textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: ".08em", color: "#3a2913", fontSize: 17 * scale, lineHeight: 1 }}>
            WANTED
          </div>
          <div style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 8.5 * scale, letterSpacing: ".22em", color: "#6e5126", margin: `${3 * scale}px 0 ${9 * scale}px` }}>
            DEAD OR ALIVE
          </div>
          <div style={{ position: "relative", border: "2px solid #7c5e30", borderRadius: 3, overflow: "hidden", aspectRatio: "1 / 1.06", background: "#cdb890" }}>
            {char.img ? (
              <>
                <PlaceImg
                  name={char.img}
                  radius={0}
                  compact
                  style={{ position: "absolute", inset: 0 }}
                  imgStyle={{ filter: "sepia(0.72) saturate(0.82) contrast(1.06) brightness(1.04)", ...(MUG_FRAME[char.id] || { objectPosition: "center 26%" }) }}
                />
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(160deg, rgba(124,84,32,0.15), rgba(70,44,14,0.34))", mixBlendMode: "multiply" }} />
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: "inset 0 0 22px rgba(60,38,12,0.5)" }} />
              </>
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#7c5e30", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 52 * scale }}>
                {lastName[0]}
              </div>
            )}
          </div>
          <div style={{ textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 700, color: "#2c1f0e", fontSize: 15 * scale, marginTop: 9 * scale, lineHeight: 1.05, letterSpacing: "-.01em" }}>
            {char.name.toUpperCase()}
          </div>
          {char.epithet && (
            <div style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 9 * scale, color: "#6e5126", marginTop: 2 }}>"{char.epithet}"</div>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 9 * scale, borderTop: "1.5px solid #b89f73", paddingTop: 8 * scale }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "#3a2913", fontSize: 13 * scale }}>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>฿</span>&nbsp;{char.bounty ? char.bounty : "—"}
            </span>
          </div>
          <div style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 7.5 * scale, letterSpacing: ".18em", color: "#8a6c3c", marginTop: 4 }}>
            MARINE · WORLD GOVERNMENT
          </div>
        </div>
      </div>
    </div>
  );
}
