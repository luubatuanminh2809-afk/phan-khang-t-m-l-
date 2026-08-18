// first-person "you" hands — just a soft, blurred hint at the very edge of frame
// that you're looking through your own eyes, not a fully rendered illustration
function HandShape({ mirror, delay }: { mirror?: boolean; delay: string }) {
  return (
    <svg
      viewBox="0 0 100 140"
      className={`h-16 w-14 sm:h-20 sm:w-16 opacity-40 blur-[1.5px] animate-fp-hand-sway ${mirror ? "-scale-x-100" : ""}`}
      style={{ animationDelay: delay }}
    >
      <path d="M18 140 L13 58 Q12 18 44 13 Q76 9 80 46 L85 140 Z" fill="#eab98a" />
    </svg>
  );
}

// wraps a scene in a first-person "POV" frame: soft vignette, a slow handheld camera
// drift, and your own hands visible at the bottom of the shot — used anywhere the
// player is meant to feel like they're looking through their own eyes rather than
// watching their character on screen (SituationScreen, HallwayIntroScreen)
export function FirstPersonFrame() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-10 animate-fp-camera-sway"
        style={{ boxShadow: "inset 0 0 16vh 6vh rgba(10,10,20,0.28)" }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-1 sm:px-3 -mb-8 sm:-mb-9">
        <HandShape delay="0s" />
        <HandShape mirror delay="0.6s" />
      </div>
    </>
  );
}
