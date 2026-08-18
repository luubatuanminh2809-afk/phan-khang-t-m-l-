import { ChevronLeft, Trophy } from "lucide-react";
import { useGame } from "../state/gameContext";
import { BottomNav } from "../components/ui/BottomNav";
import { Card } from "../components/ui/Card";

export function AchievementsScreen() {
  const { dispatch } = useGame();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-indigo-50 px-5 pb-32 pt-8">
      <div className="mx-auto max-w-md">
        <button
          onClick={() => dispatch({ type: "GO_TO", screen: "history" })}
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md text-slate-500 active:scale-90 transition"
        >
          <ChevronLeft size={18} />
        </button>

        <h1 className="text-2xl font-black text-blue-600 mb-1">Thành tích</h1>
        <p className="text-sm text-slate-400 mb-6">Huy hiệu cho những cột mốc bạn đạt được</p>

        <Card className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-400">
            <Trophy size={28} />
          </div>
          <p className="text-sm font-bold text-slate-700 mb-1">Tính năng đang được phát triển</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hệ thống huy hiệu thành tích sẽ sớm xuất hiện ở đây. Hiện tại bạn có thể xem tiến trình các lượt đã chơi ở
            màn Lịch trình.
          </p>
        </Card>
      </div>
      <BottomNav active="achievements" />
    </div>
  );
}
