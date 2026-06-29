import { useEffect, useRef, useState } from "react";
import { Icon } from "../../components/Icon";
import { drawVoyageCard, type VoyageCardData } from "../../lib/voyageCard";

interface ShareModalProps {
  data: VoyageCardData;
  onClose: () => void;
}

export function ShareModal({ data, onClose }: ShareModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawVoyageCard(canvas, data).then(() => setReady(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function download() {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `arcahead-ep${data.ep}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  }

  async function share() {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `arcahead-ep${data.ep}.png`, { type: "image/png" });
      try {
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "My ArcAhead Voyage",
            text: `I'm on EP ${data.ep} of One Piece — ${data.pct}% through the Grand Line. No spoilers! 🗺️ arcahead.onrender.com`,
          });
        }
      } catch {
        // user dismissed share sheet — fine
      }
    }, "image/png");
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.origin).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  const canShareFiles = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(8,9,12,0.88)",
        backdropFilter: "blur(10px)",
        display: "grid", placeItems: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(680px, 100%)",
          borderRadius: "var(--r-xl)",
          border: "1px solid var(--line-2)",
          background: "var(--surface)",
          overflow: "hidden",
          boxShadow: "var(--shadow)",
        }}
      >
        {/* header */}
        <div style={{ padding: "18px 24px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>Share your voyage</div>
            <div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 3 }}>No spoilers included — safe to share anywhere.</div>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-ghost" style={{ padding: "6px 10px" }}>
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* canvas preview */}
        <div style={{ background: "#08090C", position: "relative", lineHeight: 0 }}>
          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              opacity: ready ? 1 : 0,
              transition: "opacity .4s",
            }}
          />
          {!ready && (
            <div style={{
              position: "absolute", inset: 0,
              display: "grid", placeItems: "center",
              color: "var(--text-3)", fontSize: 13,
              minHeight: 200,
            }}>
              Drawing your voyage…
            </div>
          )}
        </div>

        {/* actions */}
        <div style={{ padding: "16px 20px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn btn-sm btn-primary" onClick={download} disabled={!ready}>
            <Icon name="download" size={15} /> Download PNG
          </button>
          {canShareFiles && (
            <button className="btn btn-sm btn-ghost" onClick={share} disabled={!ready}>
              <Icon name="share-2" size={15} /> Share
            </button>
          )}
          <button className="btn btn-sm btn-ghost" onClick={copyLink}>
            <Icon name={copied ? "check" : "link"} size={15} />
            {copied ? "Copied!" : "Copy link"}
          </button>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-4)" }}>
            1200 × 630 · PNG
          </div>
        </div>
      </div>
    </div>
  );
}
