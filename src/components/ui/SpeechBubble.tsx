import { forwardRef } from "react";
import { TypewriterText, type TypewriterHandle } from "./TypewriterText";

export const SpeechBubble = forwardRef<
  TypewriterHandle,
  { text: string; speaker?: string; tailSide?: "left" | "right" | "side-left"; compact?: boolean; onTypingDone?: () => void }
>(function SpeechBubble({ text, speaker, tailSide = "right", compact = false, onTypingDone }, ref) {
  return (
    <div className={`relative animate-pop ${compact ? "" : "max-w-md"}`}>
      <div
        className={`rounded-2xl bg-white/95 backdrop-blur shadow-xl ring-1 ring-black/5 ${
          compact ? "px-[clamp(10px,1.6dvh,18px)] py-[clamp(6px,1.15dvh,13px)]" : "px-5 py-4 rounded-3xl"
        }`}
      >
        {speaker && (
          <p className={`font-extrabold uppercase tracking-wide text-blue-500 ${compact ? "text-[clamp(9px,1.15dvh,12px)] mb-0.5" : "text-[11px] mb-1"}`}>
            {speaker}
          </p>
        )}
        <p className={`text-slate-800 font-medium ${compact ? "text-[clamp(11px,1.7dvh,17px)] leading-snug" : "text-[15px] leading-relaxed"}`}>
          <TypewriterText ref={ref} text={text} onDone={onTypingDone} />
        </p>
      </div>
      <div
        className={
          tailSide === "side-left"
            ? "absolute -left-1.5 top-[58%] h-3.5 w-3.5 rotate-45 rounded-sm bg-white/95"
            : `absolute rotate-45 bg-white/95 ${compact ? "-bottom-1 h-2.5 w-2.5" : "-bottom-2 h-4 w-4"} ${
                tailSide === "right" ? (compact ? "right-4" : "right-8") : compact ? "left-4" : "left-8"
              }`
        }
      />
    </div>
  );
});
