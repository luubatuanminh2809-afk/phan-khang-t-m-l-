import { useRef } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useGame } from "../state/gameContext";
import { roleMeta } from "../data/advice";
import { CharacterPortrait } from "../components/illustrations/CharacterPortrait";
import { playerCharacterKey } from "../data/assetMap";
import { Coachmark } from "../components/ui/Coachmark";
import { CloudField, SparkleField } from "../components/illustrations/AmbientBackdrop";
import { SITUATIONS_PER_DAY_MAX, SITUATIONS_PER_DAY_MIN, type Role } from "../types";

export function RoleSelectScreen() {
  const { dispatch, gender } = useGame();
  const cardsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blue-50 to-white px-5 py-8">
      <SparkleField tone="sky" />
      <CloudField tone="sky" heightVh={30} />

      <div className="relative">
        <button
          onClick={() => dispatch({ type: "GO_TO", screen: "history" })}
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md text-slate-500 active:scale-90 transition"
        >
          <ArrowLeft size={18} />
        </button>

        <h2 className="text-2xl font-extrabold text-slate-800 text-center">Bạn muốn hoá thân thành ai?</h2>
        <p className="text-center text-sm text-slate-400 mt-1 mb-8">
          Mỗi vai sẽ trải qua một ngày với {SITUATIONS_PER_DAY_MIN}-{SITUATIONS_PER_DAY_MAX} tình huống khác nhau
        </p>

        <div ref={cardsRef} className="mx-auto max-w-md space-y-4">
          {(Object.keys(roleMeta) as Role[]).map((role) => {
            const meta = roleMeta[role];
            return (
              <button
                key={role}
                onClick={() => dispatch({ type: "SELECT_ROLE", role })}
                className="relative w-full overflow-hidden text-left flex items-center gap-4 rounded-3xl bg-white p-4 shadow-md ring-1 ring-black/5 active:scale-[0.98] transition"
              >
                <span
                  className={`pointer-events-none absolute -right-4 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-gradient-to-br ${meta.accent} opacity-10 blur-2xl`}
                />
                <div
                  className={`relative flex h-20 w-16 shrink-0 items-end justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${meta.accent} pt-2`}
                >
                  <CharacterPortrait charKey={playerCharacterKey(role, gender)} mood="happy" className="h-full w-[82%] animate-char-bob" />
                </div>
                <div className="relative flex-1">
                  <h3 className="font-bold text-slate-800">{meta.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">{meta.tagline}</p>
                </div>
                <ChevronRight className="relative text-slate-300 shrink-0" />
              </button>
            );
          })}
        </div>
        <Coachmark id="role-select" targetRef={cardsRef} text="Chọn 1 vai để hoá thân vào tình huống hôm nay — bạn có thể thử vai khác vào lần chơi sau." />
      </div>
    </div>
  );
}
