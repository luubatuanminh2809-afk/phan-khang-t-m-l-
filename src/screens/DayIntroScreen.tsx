import { ArrowLeft, CalendarDays } from "lucide-react";
import { useGame } from "../state/gameContext";
import { getSchedule } from "../data/content";
import { roleMeta } from "../data/advice";
import { Timeline } from "../components/ui/Timeline";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { WeekProgress } from "../components/ui/WeekProgress";
import { ClosenessMeter } from "../components/ui/ClosenessMeter";
import { CloudField, SparkleField } from "../components/illustrations/AmbientBackdrop";
import { DAYS_PER_WEEK } from "../types";

export function DayIntroScreen() {
  const { dispatch, role, session } = useGame();
  if (!role || !session) return null;
  const schedule = getSchedule(role);
  const meta = roleMeta[role];
  const day = session.days[session.dayIndex];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blue-50 to-white px-5 py-8">
      <SparkleField tone="sky" />
      <CloudField tone="sky" heightVh={30} />

      <button
        onClick={() => dispatch({ type: "GO_TO", screen: "roleSelect" })}
        className="relative mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md text-slate-500 active:scale-90 transition"
      >
        <ArrowLeft size={18} />
      </button>

      <div className="relative mx-auto max-w-md">
        <Card className="p-4 mb-5">
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
            Hành trình của bạn — Ngày {session.dayIndex + 1}/{DAYS_PER_WEEK}
          </p>
          <WeekProgress completedDays={session.dayIndex} currentDay={session.dayIndex} />
          {/* carried across the whole week, so the relationship reads as something that
              accumulates rather than resetting each morning */}
          {(role === "parent" || role === "teacher") && (
            <div className="mt-3 flex justify-center">
              <ClosenessMeter value={session.closeness} />
            </div>
          )}
        </Card>

        <div className={`rounded-3xl bg-gradient-to-br ${meta.accent} p-5 text-white shadow-lg mb-6`}>
          <div className="flex items-center gap-2 text-sm font-bold opacity-90">
            <CalendarDays size={16} />
            {day.weekday}
          </div>
          <h2 className="text-xl font-extrabold mt-1">Một ngày làm {meta.title.toLowerCase()}</h2>
          <p className="text-sm opacity-90 mt-1">{meta.tagline}</p>
        </div>

        <Card className="p-5">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Lịch trình hôm nay</h3>
          <Timeline items={schedule} />
        </Card>

        <p className="text-center text-xs text-slate-400 mt-5 mb-3">
          Trong ngày sẽ có {day.situationIds.length} tình huống bất ngờ đang chờ bạn — mỗi tình huống là một lựa chọn thật của cuộc sống.
        </p>
        <Button fullWidth onClick={() => dispatch({ type: "START_DAY" })}>
          Bắt đầu ngày
        </Button>
      </div>
    </div>
  );
}
