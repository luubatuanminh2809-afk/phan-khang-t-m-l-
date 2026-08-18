import { LETTER_THEMES } from "../data/letterTemplates";
import type { LetterTheme } from "../types";

// Draws the finished letter straight onto a canvas instead of screenshotting the DOM.
//
// Both obvious library routes are dead ends here: html2canvas re-implements CSS parsing
// and rejects the `oklch()` colours Tailwind v4 emits, and html-to-image's SVG
// foreignObject never finishes loading in some embedded browsers. Drawing by hand keeps
// the export working everywhere, at the cost of restating the card's look in canvas
// calls — hence the `png` hex palette on each theme, mirroring the Tailwind classes.

const W = 760; // 2× the on-screen card, so the saved image stays crisp
const PAD = 56;
/** grid square and margin position, both 2x the on-screen values in LetterCard */
const CELL = 44;
const MARGIN_X = 76;
const TEXT_X = MARGIN_X + 36;
const RADIUS = 52;
const BODY_SIZE = 27;
const BODY_LINE = 46;

const FONT_STACK =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif';

/** splits text into rendered lines, honouring explicit newlines and wrapping the rest */
function layoutLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    let current = "";
    for (const word of paragraph.split(/\s+/)) {
      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth || !current) {
        current = candidate;
      } else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export interface LetterImageInput {
  theme: LetterTheme;
  toWhom?: string;
  message: string;
  signOff?: string;
  dateLabel?: string;
  stickers?: string[];
}

export function renderLetterToBlob(input: LetterImageInput): Promise<Blob | null> {
  const t = LETTER_THEMES[input.theme].png;
  const paper = LETTER_THEMES[input.theme].paper;
  const innerWidth = W - TEXT_X - PAD;

  // measure first so the canvas is exactly as tall as the letter needs
  const probe = document.createElement("canvas").getContext("2d")!;
  probe.font = `${BODY_SIZE}px ${FONT_STACK}`;
  const bodyLines = layoutLines(probe, input.message.trim(), innerWidth);
  const signOffLines = input.signOff ? input.signOff.split("\n") : [];

  const headerH = input.toWhom ? 58 : 0;
  const bodyH = Math.max(bodyLines.length * BODY_LINE, 230);
  const signH = signOffLines.length * 34 + (input.dateLabel ? 34 : 0);
  const H = Math.round(84 + headerH + bodyH + signH + PAD);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // squared exercise-book paper — the same ruling LetterCard shows on screen, at 2x
  roundedRect(ctx, 0, 0, W, H, RADIUS);
  ctx.fillStyle = paper.tint;
  ctx.fill();
  ctx.strokeStyle = t.ring;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.save();
  roundedRect(ctx, 0, 0, W, H, RADIUS);
  ctx.clip();
  ctx.strokeStyle = paper.grid;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = CELL; x < W; x += CELL) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
  }
  for (let y = CELL; y < H; y += CELL) {
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
  }
  ctx.stroke();

  // the double margin rule down the left edge
  ctx.strokeStyle = paper.margin;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(MARGIN_X, 0);
  ctx.lineTo(MARGIN_X, H);
  ctx.moveTo(MARGIN_X + 6, 0);
  ctx.lineTo(MARGIN_X + 6, H);
  ctx.stroke();
  ctx.restore();

  let y = 84;

  if (input.toWhom) {
    ctx.fillStyle = t.accent;
    ctx.font = `800 21px ${FONT_STACK}`;
    ctx.fillText(`✉️ GỬI ĐẾN ${input.toWhom.toUpperCase()}`, TEXT_X, y);
    y += headerH;
  }

  ctx.fillStyle = "#334155";
  ctx.font = `${BODY_SIZE}px ${FONT_STACK}`;
  for (const line of bodyLines) {
    ctx.fillText(line, TEXT_X, y);
    y += BODY_LINE;
  }

  y = H - PAD - signH + 14;
  if (signOffLines.length) {
    ctx.fillStyle = "#64748b";
    ctx.font = `600 25px ${FONT_STACK}`;
    ctx.textAlign = "right";
    for (const line of signOffLines) {
      ctx.fillText(line, W - PAD, y);
      y += 34;
    }
  }
  if (input.dateLabel) {
    ctx.fillStyle = "#94a3b8";
    ctx.font = `italic 21px ${FONT_STACK}`;
    ctx.textAlign = "right";
    ctx.fillText(input.dateLabel, W - PAD, y);
  }
  ctx.textAlign = "left";

  // stickers tucked into the corners, same slots as the on-screen card
  const slots: [number, number, number][] = [
    [W - PAD - 6, H - 40, 8],
    [PAD - 6, H - 40, -8],
    [W - PAD - 6, 78, 14],
    [PAD - 6, 78, -14],
  ];
  (input.stickers ?? []).slice(0, 4).forEach((sticker, i) => {
    const [sx, sy, deg] = slots[i % slots.length];
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate((deg * Math.PI) / 180);
    ctx.font = `40px ${FONT_STACK}`;
    ctx.textAlign = "center";
    ctx.fillText(sticker, 0, 0);
    ctx.restore();
  });

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}
