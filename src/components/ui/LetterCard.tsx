import type { ReactNode, Ref } from "react";
import { LETTER_THEMES, STICKER_SLOT_CLASS } from "../../data/letterTemplates";
import type { LetterTheme } from "../../types";

/** one grid square, in px — also the value letterImage.ts draws with, so the exported
 *  PNG rules out to the same paper the player was writing on */
const CELL = 22;

// Everything here is plain divs, text and inline background gradients — no icon
// components or exotic CSS — because the same look is redrawn on a canvas for the
// "xuất ảnh" export, and the two have to agree.
export function LetterCard({
  theme,
  toWhom,
  stickers = [],
  signOff,
  dateLabel,
  children,
  cardRef,
}: {
  theme: LetterTheme;
  toWhom?: string;
  stickers?: string[];
  signOff?: string;
  dateLabel?: string;
  children: ReactNode;
  cardRef?: Ref<HTMLDivElement>;
}) {
  const t = LETTER_THEMES[theme];
  const { tint, grid, margin } = t.paper;

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-[1.75rem] py-7 pl-14 pr-7 shadow-[0_14px_40px_rgba(30,64,175,0.13)] ring-1 ${t.ring}`}
      style={{
        backgroundColor: tint,
        // squared exercise-book paper (giấy ô ly), ruled in both directions
        backgroundImage: `repeating-linear-gradient(to right, ${grid} 0 1px, transparent 1px ${CELL}px), repeating-linear-gradient(to bottom, ${grid} 0 1px, transparent 1px ${CELL}px)`,
      }}
    >
      {/* the double margin rule every Vietnamese exercise book has down its left edge */}
      <div className="absolute inset-y-0 left-[38px] w-px" style={{ backgroundColor: margin }} />
      <div className="absolute inset-y-0 left-[41px] w-px" style={{ backgroundColor: margin }} />

      {toWhom && (
        <p className={`relative mb-3 text-[11px] font-extrabold uppercase tracking-[0.12em] ${t.accent}`}>
          ✉️ Gửi đến {toWhom}
        </p>
      )}

      <div className="relative min-h-[140px] text-[15px] leading-[1.9] text-slate-700">{children}</div>

      {signOff && <p className="relative mt-5 whitespace-pre-line text-right text-sm font-semibold text-slate-500">{signOff}</p>}
      {dateLabel && <p className="relative mt-2 text-right text-[11px] italic text-slate-400">{dateLabel}</p>}

      {stickers.slice(0, 4).map((s, i) => (
        <span key={i} className={`absolute text-2xl drop-shadow-sm ${STICKER_SLOT_CLASS[i % STICKER_SLOT_CLASS.length]}`}>
          {s}
        </span>
      ))}
    </div>
  );
}
