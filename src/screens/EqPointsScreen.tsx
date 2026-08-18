import { ChevronLeft, Heart, Star } from "lucide-react";
import { useGame } from "../state/gameContext";
import { getHistory } from "../state/storage";
import { BottomNav } from "../components/ui/BottomNav";
import { Card } from "../components/ui/Card";
import { StyleBarChart } from "../components/ui/Gauge";
import type { ResponseStyle } from "../types";

export function EqPointsScreen() {
  const { dispatch, session } = useGame();
  const history = getHistory();

  const totalPoints = history.length * 35 + (session?.choices.length ?? 0);
  const level = Math.floor(totalPoints / 50) + 1;

  const weekTally: Record<ResponseStyle, number> = { A: 0, B: 0, C: 0, D: 0 };
  history.forEach((h) => {
    weekTally[h.dominant as ResponseStyle] += 1;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-indigo-50 px-5 pb-32 pt-8">
      <div className="mx-auto max-w-md">
        <button
          onClick={() => dispatch({ type: "GO_TO", screen: "history" })}
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md text-slate-500 active:scale-90 transition"
        >
          <ChevronLeft size={18} />
        </button>

        <h1 className="text-2xl font-black text-blue-600 mb-1 flex items-center gap-2">
          <Heart className="text-rose-400" fill="currentColor" size={22} /> Điểm EQ
        </h1>
        <p className="text-sm text-slate-400 mb-6">Điểm tích luỹ từ hành trình của bạn</p>

        <Card className="p-6 text-center mb-4">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <Star size={28} className="text-amber-400" fill="currentColor" />
          </div>
          <p className="text-3xl font-black text-slate-800">{totalPoints}</p>
          <p className="text-xs font-bold text-slate-400 mt-1">điểm EQ · Level {level}</p>
        </Card>

        {history.length > 0 ? (
          <Card className="p-5">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
              Xu hướng qua các lượt đã chơi
            </h3>
            <StyleBarChart tally={weekTally} />
          </Card>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-xs text-slate-400 leading-relaxed">
              Hoàn thành trọn lượt chơi đầu tiên để bắt đầu tích điểm EQ và xem xu hướng phản ứng của bạn ở đây nhé.
            </p>
          </Card>
        )}
      </div>
      <BottomNav active="eqPoints" />
    </div>
  );
}
