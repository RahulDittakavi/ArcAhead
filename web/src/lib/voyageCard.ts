export interface VoyageCardData {
  ep: number;
  maxEp: number;
  island: string;
  saga: string;
  pct: number;
  islandsDiscovered: number;
  watchedEps: number;
  streak: number;
  displayName: string;
}

const W = 1200;
const H = 630;
const PAD = 68;

// Hex approximations of the CSS oklch tokens
const C = {
  bg: "#08090C",
  surface2: "#181B22",
  surface3: "#20242E",
  orange: "#E07A1A",
  orangeHi: "#F5A441",
  text: "#F3F4F7",
  text2: "#A4AAB8",
  text3: "#6B7280",
  text4: "#444B58",
  line: "rgba(255,255,255,0.07)",
  line2: "rgba(255,255,255,0.12)",
};

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function hline(ctx: CanvasRenderingContext2D, x1: number, x2: number, y: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
}

function fmtHrs(eps: number): string {
  const h = Math.round((eps * 24) / 60);
  return h < 100 ? `${h}h` : `${Math.round(h / 24)}d`;
}

function islandFontSize(name: string): number {
  if (name.length > 22) return 40;
  if (name.length > 14) return 52;
  return 68;
}

export async function drawVoyageCard(canvas: HTMLCanvasElement, data: VoyageCardData): Promise<void> {
  canvas.width = W;
  canvas.height = H;

  await document.fonts.ready;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // ── background ──
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  // left-center orange glow
  const glow = ctx.createRadialGradient(PAD + 300, H / 2, 0, PAD + 300, H / 2, 480);
  glow.addColorStop(0, "rgba(224, 122, 26, 0.10)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // ── decorative compass rose (right background) ──
  const CX = W - 220, CY = H / 2 + 20, CR = 200;
  ctx.save();
  ctx.globalAlpha = 0.055;
  ctx.strokeStyle = C.orangeHi;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2;
    const inner = i % 2 === 0 ? CR * 0.2 : CR * 0.12;
    ctx.beginPath();
    ctx.moveTo(CX + Math.cos(a) * inner, CY + Math.sin(a) * inner);
    ctx.lineTo(CX + Math.cos(a) * CR, CY + Math.sin(a) * CR);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(CX, CY, CR * 0.28, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(CX, CY, CR * 0.65, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // ── branding row ──
  let y = PAD;

  // mini compass icon
  ctx.save();
  ctx.strokeStyle = C.orange;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.arc(PAD + 10, y + 8, 10, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(PAD + 10 + Math.cos(a) * 4, y + 8 + Math.sin(a) * 4);
    ctx.lineTo(PAD + 10 + Math.cos(a) * 10, y + 8 + Math.sin(a) * 10);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = C.text2;
  ctx.font = '600 13px "Space Grotesk", system-ui, sans-serif';
  ctx.fillText("ARCAHEAD", PAD + 28, y + 12);

  // "VOYAGE CARD" chip (right)
  const chipW = 132;
  const chipX = W - PAD - chipW;
  ctx.fillStyle = C.surface3;
  rrect(ctx, chipX, y - 2, chipW, 26, 99);
  ctx.fill();
  ctx.strokeStyle = C.line2;
  ctx.lineWidth = 1;
  rrect(ctx, chipX, y - 2, chipW, 26, 99);
  ctx.stroke();
  ctx.fillStyle = C.text3;
  ctx.font = '500 11px "Space Mono", monospace';
  ctx.textAlign = "center";
  ctx.fillText("VOYAGE CARD", chipX + chipW / 2, y + 13);
  ctx.textAlign = "left";

  y += 42;

  // separator
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1;
  hline(ctx, PAD, W - PAD, y);

  y += 38;

  // ── saga label ──
  ctx.fillStyle = C.text3;
  ctx.font = '500 12px "Space Mono", monospace';
  ctx.fillText(`CURRENTLY SAILING  ·  ${data.saga.toUpperCase()} SAGA`, PAD, y);

  y += 62;

  // ── island name ──
  const fs = islandFontSize(data.island);
  ctx.fillStyle = C.text;
  ctx.font = `bold ${fs}px "Space Grotesk", system-ui, sans-serif`;
  ctx.fillText(data.island, PAD, y);

  y += 28;

  // navigator name (only if signed in, i.e. not the fallback)
  if (data.displayName !== "navigator") {
    ctx.fillStyle = C.text3;
    ctx.font = '14px "Sora", system-ui, sans-serif';
    ctx.fillText(`${data.displayName}'s voyage`, PAD, y);
  }

  y += 36;

  // ── episode pill ──
  const pillW = 162;
  ctx.fillStyle = "rgba(224, 122, 26, 0.12)";
  rrect(ctx, PAD, y - 26, pillW, 40, 99);
  ctx.fill();
  ctx.strokeStyle = "rgba(245, 164, 65, 0.25)";
  ctx.lineWidth = 1;
  rrect(ctx, PAD, y - 26, pillW, 40, 99);
  ctx.stroke();
  ctx.fillStyle = C.orangeHi;
  ctx.font = 'bold 20px "Space Grotesk", system-ui, sans-serif';
  ctx.fillText(`EP ${data.ep}`, PAD + 18, y);

  y += 28;

  // ── progress bar ──
  const barW = 480;
  const barH = 8;
  const pctClamped = Math.min(100, Math.max(0, data.pct));
  const filled = Math.round((pctClamped / 100) * barW);

  ctx.fillStyle = C.surface3;
  rrect(ctx, PAD, y, barW, barH, 4);
  ctx.fill();

  if (filled > 2) {
    const grad = ctx.createLinearGradient(PAD, 0, PAD + filled, 0);
    grad.addColorStop(0, "#C45E0A");
    grad.addColorStop(1, C.orangeHi);
    ctx.fillStyle = grad;
    rrect(ctx, PAD, y, filled, barH, 4);
    ctx.fill();
  }

  ctx.fillStyle = C.orangeHi;
  ctx.font = 'bold 15px "Space Grotesk", system-ui, sans-serif';
  ctx.fillText(`${data.pct}%`, PAD + barW + 14, y + 8);

  ctx.fillStyle = C.text3;
  ctx.font = '12px "Sora", system-ui, sans-serif';
  ctx.fillText("of the Grand Line charted", PAD, y + 26);

  // ── progress ring (right side) ──
  const RCX = W - PAD - 156, RCY = H / 2 + 8, RR = 108;
  const ringAngle = (pctClamped / 100) * Math.PI * 2;
  const startA = -Math.PI / 2;

  // track
  ctx.beginPath();
  ctx.arc(RCX, RCY, RR, 0, Math.PI * 2);
  ctx.strokeStyle = C.surface3;
  ctx.lineWidth = 14;
  ctx.stroke();

  // filled arc
  if (filled > 0) {
    ctx.beginPath();
    ctx.arc(RCX, RCY, RR, startA, startA + ringAngle);
    ctx.strokeStyle = C.orangeHi;
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.lineCap = "butt";
  }

  // ring center text
  ctx.fillStyle = C.orangeHi;
  ctx.font = 'bold 38px "Space Grotesk", system-ui, sans-serif';
  ctx.textAlign = "center";
  ctx.fillText(`${data.pct}%`, RCX, RCY + 12);
  ctx.fillStyle = C.text3;
  ctx.font = '11px "Space Mono", monospace';
  ctx.fillText("OF VOYAGE", RCX, RCY + 34);
  ctx.textAlign = "left";

  // ── stats row ──
  const statsY = H - PAD - 60;

  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1;
  hline(ctx, PAD, W - PAD, statsY - 16);

  const stats: Array<{ val: string; lbl: string }> = [
    { val: String(data.islandsDiscovered), lbl: "islands charted" },
    { val: fmtHrs(data.watchedEps), lbl: "of One Piece" },
  ];
  if (data.streak >= 2) stats.push({ val: `${data.streak}-day`, lbl: "watch streak" });

  stats.forEach((s, i) => {
    const x = PAD + i * 188;
    if (i > 0) {
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 16, statsY);
      ctx.lineTo(x - 16, statsY + 50);
      ctx.stroke();
    }
    ctx.fillStyle = C.orangeHi;
    ctx.font = 'bold 26px "Space Grotesk", system-ui, sans-serif';
    ctx.fillText(s.val, x, statsY + 26);
    ctx.fillStyle = C.text3;
    ctx.font = '12px "Sora", system-ui, sans-serif';
    ctx.fillText(s.lbl, x, statsY + 48);
  });

  // ── footer URL ──
  ctx.fillStyle = C.text4;
  ctx.font = '12px "Space Mono", monospace';
  ctx.textAlign = "right";
  ctx.fillText("arcahead.onrender.com", W - PAD, H - PAD + 12);
  ctx.textAlign = "left";
}
