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
          compact ? "px-3 py-2" : "px-5 py-4 rounded-3xl"
        }`}
      >
        <p className={`text-slate-100 italic ${compact ? "text-[11px] leading-snug" : "text-[14px] leading-relaxed"}`}>
          <TypewriterText ref={ref} text={text} onDone={onTypingDone} />
        </p>
      </div>
    </div>
  );
});
