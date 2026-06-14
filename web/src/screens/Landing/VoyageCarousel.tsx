import { useEffect, useState } from "react";
import { PlaceImg } from "../../components/PlaceImg";

const slides = [
  { img: "LANDING_CAROUSEL_IMAGE_1", cap: "Set out from a quiet harbor" },
  { img: "LANDING_CAROUSEL_IMAGE_2", cap: "Cross seas no chart has named" },
  { img: "LANDING_CAROUSEL_IMAGE_3", cap: "Chase a horizon that never ends" },
];

export function VoyageCarousel() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, []);
  return (
    <div>
      <div style={{ position: "relative", borderRadius: "var(--r-xl)", overflow: "hidden", border: "1px solid var(--line)", aspectRatio: "8 / 5", background: "var(--surface)" }}>
        {slides.map((s, k) => (
          <div key={k} style={{ position: "absolute", inset: 0, opacity: k === i ? 1 : 0, transition: "opacity .9s var(--ease)" }}>
            <PlaceImg name={s.img} radius={0} style={{ position: "absolute", inset: 0 }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(8,9,12,0.82), transparent 55%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", left: 28, bottom: 26 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".2em", color: "var(--orange-hi)", marginBottom: 8 }}>
                LOG ENTRY · {String(k + 1).padStart(2, "0")}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(20px,2.6vw,30px)", maxWidth: 440 }}>{s.cap}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
        {slides.map((_, k) => (
          <button
            key={k}
            onClick={() => setI(k)}
            style={{ width: k === i ? 26 : 9, height: 9, borderRadius: 99, border: "none", cursor: "pointer", background: k === i ? "var(--orange)" : "var(--surface-3)", transition: "all .3s var(--ease)" }}
          />
        ))}
      </div>
    </div>
  );
}
