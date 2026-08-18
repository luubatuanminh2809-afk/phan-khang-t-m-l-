import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Gauge } from "lucide-react";
import { useGame } from "../state/gameContext";
import { SchoolPrototype } from "../three3d/SchoolPrototype";
import type { HudDialogueState } from "../three3d/interaction/DialogueSystem";

/** React shell for the Three.js first-person prototype — owns the canvas element and
 *  renders the minimal HUD on top as plain DOM (crosshair, prompts, dialogue/choices,
 *  the reactance meter, the tint overlay), while SchoolPrototype owns everything that
 *  actually happens in 3D. Kept intentionally thin: no game logic lives in this file. */
export function School3DScreen() {
  const { dispatch } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const protoRef = useRef<SchoolPrototype | null>(null);

  const [locked, setLocked] = useState(false);
  const [hud, setHud] = useState<HudDialogueState>({ phase: "none" });
  const [tint, setTint] = useState(0);
  const [reactance, setReactance] = useState(0);
  const [inspectPrompt, setInspectPrompt] = useState<string | null>(null);
  const [inspectResult, setInspectResult] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const proto = new SchoolPrototype(canvasRef.current, {
      onHud: setHud,
      onTint: setTint,
      onReactance: setReactance,
      onLockChange: setLocked,
      onInspectPrompt: setInspectPrompt,
      onInspectResult: setInspectResult,
    });
    protoRef.current = proto;
    return () => {
      proto.dispose();
      protoRef.current = null;
    };
  }, []);

  function handleExit() {
    dispatch({ type: "GO_TO", screen: "explore" });
  }

  const showDialogueBox = hud.phase === "line" || hud.phase === "choices" || hud.phase === "reaction";

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* reactance-cue tint — a cool, slightly desaturating overlay standing in for the
          "environment reacting to pressure" effect (no full post-processing pipeline
          in this rough prototype, so this is a cheap DOM-level approximation) */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          background: "radial-gradient(circle at 50% 55%, transparent 30%, rgba(10,14,26,0.85) 100%)",
          opacity: tint,
          mixBlendMode: "multiply",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-slate-900 transition-opacity duration-500"
        style={{ opacity: tint * 0.25 }}
      />

      {!locked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/70 text-center text-white">
          <p className="text-lg font-bold">Nhấp vào màn hình để bắt đầu</p>
          <p className="max-w-xs text-sm text-white/70">
            WASD di chuyển · Chuột xoay camera quanh nhân vật · Lăn chuột để zoom · Shift chạy · Space nhảy · E tương
            tác · F quan sát · ESC thoát khoá chuột
          </p>
          <button
            onClick={handleExit}
            className="mt-2 flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white/80"
          >
            <ArrowLeft size={14} /> Quay lại
          </button>
        </div>
      )}

      {locked && (
        <>
          {/* crosshair */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 shadow" />

          {/* task + reactance meter, top corners — small, never covering the view */}
          <div className="pointer-events-none absolute left-4 top-4 rounded-xl bg-black/35 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            Nhiệm vụ: Đi tới lớp học cuối hành lang
          </div>
          <div className="pointer-events-none absolute right-4 top-4 flex items-center gap-1.5 rounded-xl bg-black/35 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            <Gauge size={13} className="text-rose-300" />
            Phản kháng: {reactance}
          </div>

          {inspectPrompt && !showDialogueBox && (
            <div className="pointer-events-none absolute left-1/2 top-[62%] -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[11px] font-semibold text-white">
              {inspectPrompt}
            </div>
          )}
          {inspectResult && (
            <div className="pointer-events-none absolute left-1/2 top-[70%] -translate-x-1/2 max-w-xs rounded-xl bg-black/60 px-4 py-2 text-center text-xs text-white">
              {inspectResult}
            </div>
          )}

          {hud.phase === "approaching" && (
            <div className="pointer-events-none absolute left-1/2 bottom-24 -translate-x-1/2 text-xs font-semibold text-white/80">
              ...
            </div>
          )}

          {showDialogueBox && (
            <div className="absolute inset-x-0 bottom-0 z-10 mx-auto max-w-lg space-y-2 p-4">
              <div className="rounded-2xl bg-black/70 p-4 backdrop-blur-sm">
                {hud.speaker && <p className="mb-1 text-xs font-bold uppercase tracking-wide text-rose-300">{hud.speaker}</p>}
                <p className="text-sm leading-relaxed text-white">{hud.text}</p>
                {hud.phase === "line" && <p className="mt-2 text-[11px] font-semibold text-white/50">Nhấn E để tiếp tục</p>}
              </div>
              {hud.phase === "choices" && hud.choices && (
                <div className="space-y-1.5">
                  {hud.choices.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => protoRef.current?.choose(c.id)}
                      className="w-full rounded-xl bg-white/95 px-3.5 py-2.5 text-left text-sm font-semibold text-slate-800 shadow active:scale-[0.98] transition"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
