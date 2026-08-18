import { CalendarDays, Heart, Home, Settings, Trophy } from "lucide-react";
import { useGame } from "../../state/gameContext";
import type { Screen } from "../../types";

const ITEMS: { key: Screen | "home"; label: string; icon: typeof Home }[] = [
  { key: "home", label: "Trang chủ", icon: Home },
  { key: "history", label: "Lịch trình", icon: CalendarDays },
  { key: "achievements", label: "Thành tích", icon: Trophy },
  { key: "eqPoints", label: "Điểm EQ", icon: Heart },
  { key: "settings", label: "Cài đặt", icon: Settings },
];

export function BottomNav({ active }: { active: Screen | "home" }) {
  const { dispatch } = useGame();

  return (
    <div className="fixed bottom-0 inset-x-0 z-20 flex justify-center px-3 pb-3">
      <div className="flex w-full max-w-md justify-around rounded-3xl bg-white/95 backdrop-blur px-1.5 py-2 shadow-[0_-6px_24px_rgba(0,0,0,0.1)] ring-1 ring-black/5">
        {ITEMS.map((item) => {
          const isActive = item.key === active;
          return (
            <button
              key={item.key}
              onClick={() =>
                item.key === "home" ? dispatch({ type: "GO_HOME" }) : dispatch({ type: "GO_TO", screen: item.key })
              }
              className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-1.5 text-[10px] font-bold transition-colors ${
                isActive ? "bg-blue-50 text-blue-600" : "text-slate-400"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
