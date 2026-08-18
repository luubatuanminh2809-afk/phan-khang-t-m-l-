import { forwardRef } from "react";
import { TypewriterText, type TypewriterHandle } from "./TypewriterText";

// A real cartoon thought cloud: a lumpy silhouette built from one rounded body plus a
// ring of overlapping circles, with a trail of shrinking dots pointing back at whoever
// is thinking. The shape alone says "this is a thought", so there is deliberately NO
// "<name> nghĩ" caption — a speech bubble carries a name, a thought cloud doesn't.
//
// Two details make the lumps read as one solid cloud instead of a pile of circles:
// every piece is fully opaque (semi-transparent fills would show darker seams where
// they overlap), and the shadow lives on the wrapper as a `drop-shadow` filter, which
// traces the merged silhouette rather than outlining each piece separately.
export const ThoughtBubble = forwardRef<
  TypewriterHandle,
  { text: string; tailSide?: "left" | "right"; compact?: boolean; onTypingDone?: () => void }
>(function ThoughtBubble({ text, tailSide = "right", compact = false, onTypingDone }, ref) {
  const puff = "absolute rounded-full bg-blue-50";
  return (
    <div className={`relative animate-pop drop-shadow-lg ${compact ? "" : "max-w-md"}`}>
      {/* lumps around the edge — same fill as the body, so they merge into one outline */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span className={`${puff} -top-2 left-[14%] h-5 w-5`} />
        <span className={`${puff} -top-3 left-[36%] h-7 w-7`} />
        <span className={`${puff} -top-2 right-[16%] h-6 w-6`} />
        <span className={`${puff} -left-2 top-[30%] h-5 w-5`} />
        <span className={`${puff} -right-2 top-[38%] h-5 w-5`} />
        <span className={`${puff} -bottom-2 left-[22%] h-5 w-5`} />
        <span className={`${puff} -bottom-2 right-[34%] h-4 w-4`} />
      </div>

      <div className={`relative rounded-[1.6rem] bg-blue-50 ${compact ? "px-3.5 py-2.5" : "px-5 py-4"}`}>
        <p className={`text-blue-900 italic font-medium ${compact ? "text-[11px] leading-snug" : "text-[15px] leading-relaxed"}`}>
          <TypewriterText ref={ref} text={text} onDone={onTypingDone} />
        </p>
      </div>

      {/* the classic trail of shrinking puffs, aimed back at the character thinking */}
      <div
        className={`absolute flex items-end gap-1 ${compact ? "-bottom-3.5" : "-bottom-5"} ${
          tailSide === "right" ? (compact ? "right-6" : "right-10") : compact ? "left-6" : "left-10"
        }`}
      >
        <span className={`rounded-full bg-blue-50 ${compact ? "h-2.5 w-2.5" : "h-3.5 w-3.5"}`} />
        <span className={`rounded-full bg-blue-50 ${compact ? "h-1.5 w-1.5" : "h-2 w-2"}`} />
      </div>
    </div>
  );
});
