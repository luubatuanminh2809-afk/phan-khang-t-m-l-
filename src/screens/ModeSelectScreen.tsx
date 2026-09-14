import { ArrowLeft, CalendarDays, ChevronRight, Sunrise, type LucideIcon } from "lucide-react";
import { useGame } from "../state/gameContext";
import { CloudField, SparkleField } from "../components/illustrations/AmbientBackdrop";
import {
  DAYS_PER_WEEK,
  SITUATIONS_IN_ONE_DAY,
  SITUATIONS_PER_DAY_MAX,
  SITUATIONS_PER_DAY_MIN,
  type PlayMode,
} from "../types";

// The two ways to play, picked before the role: the long run, with a code a day and the
// chest at the end of the week, or the quick one that goes straight to the evaluation as
// soon as its single day is over.
const MODES: { mode: PlayMode; icon: LucideIcon; title: string; badge: string; body: string; accent: string }[] = [
  {
    mode: "week",
    icon: CalendarDays,
    title: "Cả tuần",
    badge: `${DAYS_PER_WEEK} ngày`,
    body: `Mỗi ngày ${SITUATIONS_PER_DAY_MIN}–${SITUATIONS_PER_DAY_MAX} tình huống. Cuối mỗi ngày nhận một mã số, đủ ${DAYS_PER_WEEK} mã số thì mở rương xem kết quả đánh giá.`,
    accent: "from-blue-400 to-indigo-600",
  },
  {
    mode: "day",
    icon: Sunrise,
    title: "Một ngày",
    badge: "Chơi nhanh",
    body: `${SITUATIONS_IN_ONE_DAY} tình huống trải từ sáng tới tối, chơi xong là xem kết quả đánh giá luôn.`,
    accent: "from-amber-400 to-orange-500",
  },
];

export function ModeSelectScreen() {
  const { dispatch } = useGame();

  function choose(mode: PlayMode) {
    dispatch({ type: "SET_MODE", mode });
    dispatch({ type: "GO_TO", screen: "roleSelect" });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blue-50 to-white px-5 py-8">
      <SparkleField tone="sky" />
      <CloudField tone="sky" heightVh={30} />

      <div className="relative">
        <button
          onClick={() => dispatch({ type: "GO_TO", screen: "profile" })}
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md text-slate-500 active:scale-90 transition"
        >
          <ArrowLeft size={18} />
        </button>

        <h2 className="text-2xl font-extrabold text-slate-800 text-center">Bạn muốn chơi thế nào?</h2>
        <p className="text-center text-sm text-slate-400 mt-1 mb-8">
          Chọn độ dài lượt chơi — chơi xong sẽ có kết quả đánh giá
        </p>

        <div className="mx-auto max-w-md space-y-4">
          {MODES.map(({ mode, icon: Icon, title, badge, body, accent }) => (
            <button
              key={mode}
              onClick={() => choose(mode)}
              className="relative w-full overflow-hidden text-left flex items-center gap-4 rounded-3xl bg-white p-5 shadow-md ring-1 ring-black/5 active:scale-[0.98] transition"
            >
              <span
                className={`pointer-events-none absolute -right-4 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-gradient-to-br ${accent} opacity-10 blur-2xl`}
              />
              <span
                className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-md`}
              >
                <Icon size={30} />
              </span>
              <div className="relative flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-800">{title}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">{badge}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{body}</p>
              </div>
              <ChevronRight className="relative text-slate-300 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
