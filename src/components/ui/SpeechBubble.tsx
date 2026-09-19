import { forwardRef } from "react";
import { TypewriterText, type TypewriterHandle } from "./TypewriterText";

export const SpeechBubble = forwardRef<
  TypewriterHandle,
  {
    text: string;
    speaker?: string;
    tailSide?: "left" | "right" | "side-left";
    compact?: boolean;
    /** the line the four answers are answering: amber paper, black bold type, a thicker
     *  ring. Every other bubble on the screen is white, so the one being replied to is the
     *  one that catches the eye. */
    highlight?: boolean;
    onTypingDone?: () => void;
  }
>(function SpeechBubble({ text, speaker, tailSide = "right", compact = false, highlight = false, onTypingDone }, ref) {
  const skin = highlight ? "bg-amber-200/95" : "bg-white/95";
  return (
    <div className={`relative animate-pop ${compact ? "" : "max-w-md"}`}>
      <div
        className={`rounded-2xl ${skin} backdrop-blur ${
          highlight ? "shadow-2xl shadow-amber-900/20 ring-2 ring-amber-500" : "shadow-xl ring-1 ring-black/5"
        } ${compact ? "px-[clamp(10px,1.6dvh,18px)] py-[clamp(6px,1.15dvh,13px)]" : "px-5 py-4 rounded-3xl"}`}
      >
        {speaker && (
          <p
            className={`font-extrabold uppercase tracking-wide ${highlight ? "text-amber-900" : "text-blue-500"} ${
              compact ? "text-[clamp(9px,1.15dvh,12px)] mb-0.5" : "text-[11px] mb-1"
            }`}
          >
            {speaker}
          </p>
        )}
        <p
          className={`${highlight ? "font-black text-slate-900" : "font-medium text-slate-800"} ${
            compact ? "text-[clamp(11px,1.7dvh,17px)] leading-snug" : "text-[15px] leading-relaxed"
          }`}
        >
          <TypewriterText ref={ref} text={text} onDone={onTypingDone} />
        </p>
      </div>
      <div
        className={
          tailSide === "side-left"
            ? `absolute -left-1.5 top-[58%] h-3.5 w-3.5 rotate-45 rounded-sm ${skin}`
            : `absolute rotate-45 ${skin} ${compact ? "-bottom-1 h-2.5 w-2.5" : "-bottom-2 h-4 w-4"} ${
                tailSide === "right" ? (compact ? "right-4" : "right-8") : compact ? "left-4" : "left-8"
              }`
        }
      />
    </div>
  );
});
