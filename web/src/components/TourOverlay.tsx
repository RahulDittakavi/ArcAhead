import { useEffect, useState } from "react";
import { Icon } from "./Icon";

const STORAGE_KEY = "arcahead_setup_tour_v1";

interface Step {
  selector: string;
  title: string;
  body: string;
  placement: "top" | "bottom" | "left" | "right";
}

const STEPS: Step[] = [
  {
    selector: "[data-tour='ep-display']",
    title: "Your spoiler boundary",
    body: "This is your episode number — everything past it stays hidden in the fog. Set it to your last finished episode.",
    placement: "bottom",
  },
  {
    selector: "[data-tour='ep-stepper']",
    title: "Fine-tune it",
    body: "Tap + or − to nudge by one episode at a time.",
    placement: "left",
  },
  {
    selector: "[data-tour='ep-slider']",
    title: "Drag to jump",
    body: "Slide to quickly land on any episode without tapping forever.",
    placement: "top",
  },
  {
    selector: "[data-tour='ep-presets']",
    title: "Quick presets",
    body: "Common stopping points. Handy if you're just starting out or just finished a major arc.",
    placement: "top",
  },
  {
    selector: "[data-tour='begin-btn']",
    title: "Ready to set sail?",
    body: "Hit this once your episode looks right. You can always adjust it from the top bar later.",
    placement: "top",
  },
];

const TOOLTIP_W = 270;
const GAP = 16;
const PAD = 10;

interface Rect { top: number; left: number; width: number; height: number }

function getTooltipPos(rect: Rect, placement: Step["placement"]) {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let style: React.CSSProperties = { position: "fixed", width: TOOLTIP_W };

  if (placement === "bottom") {
    style.top = rect.top + rect.height + GAP;
    style.left = Math.max(PAD, Math.min(cx - TOOLTIP_W / 2, vw - TOOLTIP_W - PAD));
  } else if (placement === "top") {
    style.bottom = vh - rect.top + GAP;
    style.left = Math.max(PAD, Math.min(cx - TOOLTIP_W / 2, vw - TOOLTIP_W - PAD));
  } else if (placement === "left") {
    style.top = Math.max(PAD, cy - 80);
    style.right = vw - rect.left + GAP;
  } else {
    style.top = Math.max(PAD, cy - 80);
    style.left = rect.left + rect.width + GAP;
  }

  return style;
}

export function hasTourBeenSeen() {
  return !!localStorage.getItem(STORAGE_KEY);
}

export function markTourSeen() {
  localStorage.setItem(STORAGE_KEY, "1");
}

export function TourOverlay({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const current = STEPS[step];

  useEffect(() => {
    const el = document.querySelector(current.selector);
    if (!el) { setRect(null); return; }
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    // Small delay so scroll settles before we measure
    const t = setTimeout(() => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    }, 120);
    return () => clearTimeout(t);
  }, [step, current.selector]);

  const done = () => { markTourSeen(); onDone(); };
  const next = () => step < STEPS.length - 1 ? setStep(s => s + 1) : done();
  const prev = () => setStep(s => Math.max(0, s - 1));

  const tipStyle = rect ? getTooltipPos(rect, current.placement) : { position: "fixed" as const, top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: TOOLTIP_W };

  return (
    <>
      {/* Backdrop — blocks app interaction */}
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 9999, pointerEvents: "all" }} />

      {/* Spotlight ring over the current target */}
      {rect && (
        <div
          style={{
            position: "fixed",
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            borderRadius: 14,
            border: "2px solid var(--orange)",
            boxShadow: "0 0 0 5px color-mix(in oklab, var(--orange) 20%, transparent), 0 0 28px var(--orange-glow)",
            zIndex: 10000,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Tooltip */}
      <div
        style={{
          ...tipStyle,
          zIndex: 10001,
          background: "var(--surface-2)",
          border: "1px solid var(--line-2)",
          borderRadius: 16,
          padding: "18px 20px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          pointerEvents: "all",
        }}
      >
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".1em", color: "var(--orange-hi)", marginBottom: 6 }}>
          {step + 1} / {STEPS.length}
        </div>
        <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 7 }}>{current.title}</div>
        <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 16 }}>{current.body}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <button
            className="btn btn-sm btn-ghost"
            style={{ fontSize: 12, color: "var(--text-3)" }}
            onClick={done}
          >
            Skip tour
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            {step > 0 && (
              <button className="btn btn-sm btn-ghost" onClick={prev}>
                <Icon name="arrow-left" size={14} />
              </button>
            )}
            <button className="btn btn-sm btn-primary" onClick={next} style={{ minWidth: 82 }}>
              {step < STEPS.length - 1
                ? <><span>Next</span> <Icon name="arrow-right" size={14} /></>
                : "Got it!"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
