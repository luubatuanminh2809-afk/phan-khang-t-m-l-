import { useRef } from "react";
import { useGame } from "../state/gameContext";
import { Coachmark } from "../components/ui/Coachmark";

// size the cover art was drawn at (cover.jpg is the same picture upscaled, so the
// ratio is unchanged) — used to keep the artwork's aspect ratio locked so the
// invisible hit-areas below stay aligned to the drawing
const COVER_W = 1672;
const COVER_H = 941;

interface Hotspot {
  label: string;
  top: number;
  left: number;
  width: number;
  height: number;
  onClick: () => void;
}

export function CoverScreen() {
  const { dispatch } = useGame();
  const playRef = useRef<HTMLButtonElement>(null);

  // Hotspot boxes come from the artwork itself — the play button's blue fill, the white
  // pills, the two round buttons — never from eyeballing, and each one is checked by drawing
  // it back over the cover. They are percentages of the 1672x941 drawing, so they line up on
  // the upscaled cover.jpg at any width. Re-measure them whenever the cover art changes.
  const hotspots: Hotspot[] = [
    {
      label: "Khám phá",
      top: 3.4,
      left: 1.44,
      width: 15.31,
      height: 7.66,
      onClick: () => dispatch({ type: "GO_TO", screen: "explore" }),
    },
    {
      label: "Chơi ngay",
      top: 52.77,
      left: 40.43,
      width: 22.25,
      height: 9.36,
      // goes through the profile screen first, which offers "chơi tiếp" when a saved
      // run exists instead of silently restarting the week
      onClick: () => dispatch({ type: "GO_TO", screen: "profile" }),
    },
    {
      label: "Viết thư",
      top: 63.83,
      left: 42.11,
      width: 18.66,
      height: 6.81,
      onClick: () => dispatch({ type: "GO_TO", screen: "letterWrite" }),
    },
    {
      label: "Cài đặt",
      top: 72.6,
      left: 42.11,
      width: 18.66,
      height: 6.81,
      onClick: () => dispatch({ type: "GO_TO", screen: "settings" }),
    },
    {
      label: "Thành tích",
      top: 82.13,
      left: 44.26,
      width: 5.74,
      height: 10.21,
      onClick: () => dispatch({ type: "GO_TO", screen: "achievements" }),
    },
    {
      label: "Lịch trình",
      top: 82.13,
      left: 52.15,
      width: 5.74,
      height: 10.21,
      onClick: () => dispatch({ type: "GO_TO", screen: "history" }),
    },
  ];

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900"
      style={{
        backgroundImage: "url(/images/cover.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "none",
      }}
    >
      <div className="absolute inset-0 backdrop-blur-2xl opacity-40" />
      <div
        className="relative"
        style={{
          aspectRatio: `${COVER_W} / ${COVER_H}`,
          width: `min(100%, calc(100vh * ${COVER_W} / ${COVER_H}))`,
        }}
      >
        <img src="/images/cover.jpg" alt="Moralyn" className="h-full w-full object-contain select-none" draggable={false} />
        {hotspots.map((h) => (
          <button
            key={h.label}
            ref={h.label === "Chơi ngay" ? playRef : undefined}
            type="button"
            aria-label={h.label}
            onClick={h.onClick}
            className="absolute rounded-full transition active:scale-95 active:bg-white/10"
            style={{ top: `${h.top}%`, left: `${h.left}%`, width: `${h.width}%`, height: `${h.height}%` }}
          />
        ))}
      </div>
      <Coachmark id="cover-play" targetRef={playRef} text="Bấm vào đây để bắt đầu chơi nhé!" />
    </div>
  );
}
