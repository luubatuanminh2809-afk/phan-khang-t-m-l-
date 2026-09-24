import { forwardRef } from "react";
import { TypewriterText, type TypewriterHandle } from "./TypewriterText";

export const NarrationBox = forwardRef<
  TypewriterHandle,
  { text: string; compact?: boolean; onTypingDone?: () => void }
>(function NarrationBox({ text, compact = false, onTypingDone }, ref) {
  return (
    <div className={`relative animate-pop ${compact ? "" : "max-w-md"}`}>
      <div
        className={`rounded-2xl bg-slate-900/80 backdrop-blur shadow-xl ring-1 ring-white/10 ${
          compact ? "px-3.5 py-2.5" : "px-5 py-4 rounded-3xl"
        }`}
      >
        {/* same size as the speech bubbles it alternates with: it was pinned at 11px while
            they grew with the screen, so on a laptop the narration read half their size */}
        <p className={`text-slate-100 italic ${compact ? "text-[clamp(13px,1.95dvh,19px)] leading-snug" : "text-[15px] leading-relaxed"}`}>
          <TypewriterText ref={ref} text={text} onDone={onTypingDone} />
        </p>
      </div>
    </div>
  );
});
