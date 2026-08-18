import { KeyRound } from "lucide-react";
import { DAYS_PER_WEEK } from "../../types";

const ALL_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const LABELS = ALL_LABELS.slice(0, DAYS_PER_WEEK);

export function WeekProgress({ completedDays, currentDay }: { completedDays: number; currentDay?: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-50">
        <KeyRound size={20} className={completedDays >= DAYS_PER_WEEK ? "text-amber-500 animate-key-glow" : "text-amber-400"} />
      </div>
      <div className="flex flex-1 justify-between gap-1">
        {LABELS.map((label, i) => {
          const done = i < completedDays;
          const isCurrent = currentDay === i;
          return (
            <span
              key={label}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                done
                  ? "bg-amber-400 text-white"
                  : isCurrent
                    ? "bg-white text-blue-500 ring-2 ring-blue-400"
                    : "bg-slate-100 text-slate-300"
              }`}
            >
              {done ? "✓" : label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
