import { useLayoutEffect, useState, type RefObject } from "react";
import { hasSeenHint, markHintSeen } from "../../state/storage";

interface Props {
  /** stable id — once dismissed, this hint never shows again on this device */
  id: string;
  targetRef: RefObject<HTMLElement | null>;
  text: string;
  /** called right after this hint is marked seen — lets a caller juggling several
   *  candidate hints (like SituationScreen) force itself to re-render and pick the
   *  next eligible one, since `hasSeenHint` is a plain localStorage read the parent
   *  otherwise has no reason to re-check */
  onDismiss?: () => void;
}

// a rounded-rect spotlight around the target element, built from 4 dimmed strips
// (top/bottom/left/right) rather than a single overlay + box-shadow trick — this way
// the area directly over the target has no element covering it at all, so a tap there
// both dismisses the hint AND still reaches the real button underneath in one motion,
// instead of swallowing the first tap.
export function Coachmark({ id, targetRef, text, onDismiss }: Props) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [dismissed, setDismissed] = useState(() => hasSeenHint(id));

  useLayoutEffect(() => {
    if (dismissed) return;
    function measure() {
      const el = targetRef.current;
      if (el) setRect(el.getBoundingClientRect());
    }
    measure();
    // re-measure once more after mount-in animations (dialogue box slide-in, etc.) settle
    const t = setTimeout(measure, 350);
    window.addEventListener("resize", measure);
    // the target itself has no overlay on top of it (see the 4-strip layout below), so a
    // tap straight on the highlighted element — the natural thing to do — must also mark
    // the hint as seen, not just tapping the dim backdrop or the bubble
    const el = targetRef.current;
    function onTargetInteract() {
      markHintSeen(id);
      setDismissed(true);
      onDismiss?.();
    }
    el?.addEventListener("click", onTargetInteract);
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(t);
      el?.removeEventListener("click", onTargetInteract);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dismissed, targetRef, id]);

  if (dismissed || !rect || rect.width === 0) return null;

  function dismiss() {
    markHintSeen(id);
    setDismissed(true);
    onDismiss?.();
  }

  const pad = 8;
  const top = Math.max(rect.top - pad, 0);
  const left = Math.max(rect.left - pad, 0);
  const right = Math.min(rect.right + pad, window.innerWidth);
  const bottom = Math.min(rect.bottom + pad, window.innerHeight);
  const dimClass = "fixed z-[100] bg-slate-900/70";
  const spaceBelow = window.innerHeight - bottom;
  const bubbleOnTop = spaceBelow < 150;

  return (
    <>
      <div className={dimClass} style={{ top: 0, left: 0, right: 0, height: top }} onClick={dismiss} />
      <div className={dimClass} style={{ top: bottom, left: 0, right: 0, bottom: 0 }} onClick={dismiss} />
      <div className={dimClass} style={{ top, left: 0, width: left, height: bottom - top }} onClick={dismiss} />
      <div className={dimClass} style={{ top, left: right, right: 0, height: bottom - top }} onClick={dismiss} />
      <div
        className="fixed z-[101] rounded-2xl border-[3px] border-amber-300 animate-pop pointer-events-none"
        style={{ top, left, width: right - left, height: bottom - top, boxShadow: "0 0 0 4px rgba(251,191,36,0.25)" }}
      />
      <div
        className="fixed z-[101] max-w-[260px] cursor-pointer rounded-2xl bg-white px-4 py-3 shadow-2xl animate-pop"
        style={{
          left: Math.min(Math.max(left, 12), window.innerWidth - 272),
          top: bubbleOnTop ? undefined : bottom + 12,
          bottom: bubbleOnTop ? window.innerHeight - top + 12 : undefined,
        }}
        onClick={dismiss}
      >
        <p className="text-sm font-semibold leading-snug text-slate-700">{text}</p>
        <p className="mt-1.5 text-[11px] font-bold text-blue-500">Đã hiểu →</p>
      </div>
    </>
  );
}
