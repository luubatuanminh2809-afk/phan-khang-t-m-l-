import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { playType } from "../../lib/sfx";

export interface TypewriterHandle {
  /** jump straight to the full text — used when the player taps while it's still typing */
  skip: () => void;
}

const CHARS_PER_TICK = 2;
const TICK_MS = 18;

export const TypewriterText = forwardRef<TypewriterHandle, { text: string; className?: string; onDone?: () => void }>(
  function TypewriterText({ text, className, onDone }, ref) {
    const [shown, setShown] = useState(0);
    const doneRef = useRef(false);
    const lastTickRef = useRef(0);

    useEffect(() => {
      setShown(0);
      doneRef.current = false;
    }, [text]);

    useEffect(() => {
      if (shown >= text.length) {
        if (!doneRef.current) {
          doneRef.current = true;
          onDone?.();
        }
        return;
      }
      const id = setInterval(() => {
        setShown((s) => {
          const next = Math.min(text.length, s + CHARS_PER_TICK);
          // soft typing tick, throttled so it doesn't fire on every single character
          if (Date.now() - lastTickRef.current > 55) {
            lastTickRef.current = Date.now();
            playType();
          }
          return next;
        });
      }, TICK_MS);
      return () => clearInterval(id);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shown, text]);

    useImperativeHandle(ref, () => ({
      skip: () => setShown(text.length),
    }));

    return <span className={className}>{text.slice(0, shown)}</span>;
  },
);
