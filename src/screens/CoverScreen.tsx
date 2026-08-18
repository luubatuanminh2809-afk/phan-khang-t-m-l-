import { useRef } from "react";
import { useGame } from "../state/gameContext";
import { Coachmark } from "../components/ui/Coachmark";

// natural size of public/images/cover.jpg — used to keep the artwork's aspect
// ratio locked so the invisible hit-areas below stay aligned to the drawing
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

  // hotspot boxes were located by sampling the actual pixel art (public/images/cover.jpg,
  // 1672x941) for the button-fill colors, not eyeballed — see chat history.
  const hotspots: Hotspot[] = [
    {
      label: "Khám phá",
      top: 3.19,
      left: 1.79,
      width: 15.19,
      height: 8.29,
      onClick: () => dispatch({ type: "GO_TO", screen: "explore" }),
    },
    {
      label: "Chơi ngay",
      top: 47.29,
      left: 41.09,
      width: 20.75,
      height: 9.99,
      // goes through the profile screen first, which offers "chơi tiếp" when a saved
      // run exists instead of silently restarting the week
      onClick: () => dispatch({ type: "GO_TO", screen: "profile" }),
    },
    {
      label: "Viết thư",
      top: 59.72,
      left: 42.58,
      width: 18.0,
      height: 7.65,
      onClick: () => dispatch({ type: "GO_TO", screen: "letterWrite" }),
    },
    {
      label: "Cài đặt",
      top: 69.08,
      left: 42.7,
      width: 17.16,
      height: 8.18,
      onClick: () => dispatch({ type: "GO_TO", screen: "settings" }),
    },
    {
      label: "Thành tích",
      top: 79.81,
      left: 44.02,
      width: 6.16,
      height: 10.84,
      onClick: () => dispatch({ type: "GO_TO", screen: "achievements" }),
    },
    {
      label: "Lịch trình",
      top: 79.81,
      left: 52.33,
      width: 6.1,
      height: 10.84,
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
