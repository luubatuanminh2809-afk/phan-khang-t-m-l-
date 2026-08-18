import {
  BookOpen,
  Check,
  ChevronLeft,
  Cloud,
  Home,
  Lock,
  MessagesSquare,
  Play,
  Puzzle,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";
import { useGame } from "../state/gameContext";
import { BottomNav } from "../components/ui/BottomNav";
import { CharacterPortrait } from "../components/illustrations/CharacterPortrait";
import { PLAYER_CHARACTER_KEY } from "../data/assetMap";
import { CloudField, SparkleField } from "../components/illustrations/AmbientBackdrop";
import { WEEKDAY_NAMES } from "../data/content";
import { DAYS_PER_WEEK } from "../types";

const WEEK_THEMES = [
  { grad: "from-blue-400 to-blue-500", ring: "ring-blue-300", chip: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50" },
  { grad: "from-emerald-400 to-emerald-500", ring: "ring-emerald-300", chip: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50" },
  { grad: "from-violet-400 to-violet-500", ring: "ring-violet-300", chip: "bg-violet-500", text: "text-violet-600", light: "bg-violet-50" },
  { grad: "from-amber-400 to-amber-500", ring: "ring-amber-300", chip: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50" },
] as const;

const SIDEBAR_WEEKS = [
  { label: "Làm quen", icon: Cloud, theme: WEEK_THEMES[0], active: true },
  { label: "Gia đình", icon: Home, theme: WEEK_THEMES[1], active: false },
  { label: null, icon: Lock, theme: { grad: "from-violet-300 to-violet-400" }, active: false },
  { label: null, icon: Lock, theme: { grad: "from-amber-300 to-amber-400" }, active: false },
] as const;

type DayStatus = "done" | "current" | "locked";

interface DayCardData {
  number: number;
  day: string;
  icon: typeof BookOpen;
  title: string | null;
  status: DayStatus;
  showLockBadge: boolean;
  /** the first 2 days sit on solid ground (real cards); the rest are still lost in the
   *  clouds ahead — a soft, translucent blob instead of a flat grey rectangle, so a full
   *  week of "locked" doesn't read as a wall of identical white boxes */
  farLocked: boolean;
}

// a brand-new player hasn't finished anything yet — only day 1 is open to play,
// everything else stays locked until it's actually completed. A playthrough is
// DAYS_PER_WEEK (see types.ts) days long — this list is generated from that
// constant so it can't drift out of sync with the actual game loop again.
const DAY_ICONS = [BookOpen, MessagesSquare, Target, Home, Users, ShieldCheck, Puzzle, Sparkles];

// only day 1 (the unlocked one) actually shows its title — locked cards always
// render the generic "Khoá" copy instead, see DayCard below
const WEEK_DAYS: DayCardData[] = Array.from({ length: DAYS_PER_WEEK }, (_, i) => ({
  number: i + 1,
  day: WEEKDAY_NAMES[i % WEEKDAY_NAMES.length].toUpperCase(),
  icon: DAY_ICONS[i % DAY_ICONS.length],
  title: i === 0 ? "Nhận diện cảm xúc" : null,
  status: i === 0 ? "current" : "locked",
  showLockBadge: i !== 0,
  farLocked: i >= 2,
}));

function DayCard({
  data,
  theme,
  onClick,
}: {
  data: DayCardData;
  theme: (typeof WEEK_THEMES)[number];
  onClick?: () => void;
}) {
  const Icon = data.icon;
  const Comp = onClick ? "button" : "div";

  if (data.farLocked) {
    // a literal fluffy cloud (a cluster of overlapping circles, classic cartoon-cloud
    // construction) instead of a flat grey rectangle — far-future days read as "still
    // hidden up in the clouds" rather than a wall of repeated locked boxes
    return (
      <div className="relative flex flex-col items-center px-2 pt-5 pb-3 text-center">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-1/2 top-4 h-14 w-[92%] -translate-x-1/2 rounded-full bg-white/60 backdrop-blur-sm" />
          <div className="absolute left-0 top-6 h-11 w-11 rounded-full bg-white/60 backdrop-blur-sm" />
          <div className="absolute right-0 top-5 h-12 w-12 rounded-full bg-white/60 backdrop-blur-sm" />
          <div className="absolute left-1/2 top-0 h-10 w-10 -translate-x-1/2 rounded-full bg-white/60 backdrop-blur-sm" />
        </div>
        <span className="relative text-[9px] font-extrabold uppercase tracking-wide text-slate-500/80 mb-1.5">{data.day}</span>
        <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/70 mb-1.5">
          <Icon size={16} className="text-slate-400" />
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-white shadow">
            <Lock size={8} />
          </span>
        </div>
        <p className="relative text-[9px] font-bold text-slate-400">Khoá</p>
      </div>
    );
  }

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`relative flex w-full flex-col items-center rounded-3xl bg-white p-3.5 text-center shadow-md transition ${
        data.status === "current" ? `ring-2 ${theme.ring} active:scale-95 cursor-pointer` : ""
      }`}
    >
      <span className={`absolute top-2.5 left-2.5 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-extrabold text-white ${theme.chip}`}>
        {data.number}
      </span>
      <p className={`text-[9px] font-extrabold uppercase tracking-wide mb-2 mt-1 ${theme.text}`}>{data.day}</p>
      <div className={`relative flex h-12 w-12 items-center justify-center rounded-2xl mb-2 ${theme.light}`}>
        <Icon size={22} className={theme.text} />
        {data.showLockBadge && (
          <span className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-white shadow">
            <Lock size={10} />
          </span>
        )}
      </div>
      {data.status === "locked" ? (
        <>
          <p className="text-xs font-extrabold text-slate-400">Khoá</p>
          <p className="text-[9px] text-slate-400 mt-1 leading-snug">Hoàn thành ngày trước để mở khoá</p>
        </>
      ) : (
        <>
          <p className="flex min-h-[2rem] items-center justify-center text-xs font-extrabold text-slate-800 leading-snug">
            {data.title}
          </p>
          {data.status === "done" ? (
            <p className="flex items-center gap-1 text-[10px] font-bold mt-1.5 text-emerald-500">
              <Check size={12} /> Đã hoàn thành
            </p>
          ) : (
            <p className={`flex items-center gap-1 text-[10px] font-bold mt-1.5 ${theme.text}`}>
              <Play size={11} fill="currentColor" /> Bắt đầu ngay
            </p>
          )}
        </>
      )}
    </Comp>
  );
}

export function HistoryScreen() {
  const { dispatch } = useGame();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-100 via-amber-50 to-orange-50 pb-32">
      <SparkleField tone="sunset" />
      <CloudField tone="sunset" heightVh={46} />

      <div className="relative mx-auto max-w-4xl px-4 pt-8 pb-5 sm:px-6">
        <div className="flex items-start justify-between gap-3 mb-5">
          <button
            onClick={() => dispatch({ type: "GO_HOME" })}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-md text-slate-500 active:scale-90 transition"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-blue-600 flex items-center gap-1.5">
              LỊCH TRÌNH <Star size={15} className="text-amber-400" fill="currentColor" />
            </h1>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">
              Hành trình hiểu mình – Làm chủ cảm xúc 💙
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-white shadow-md px-3 py-2">
              <Star size={15} className="text-amber-400" fill="currentColor" />
              <span className="text-sm font-extrabold text-slate-700">0</span>
            </div>
            <div className="relative">
              <CharacterPortrait
                charKey={PLAYER_CHARACTER_KEY.student}
                className="h-11 w-11 rounded-full ring-2 ring-white shadow-md overflow-hidden bg-blue-50"
              />
              <span className="absolute -bottom-1 -right-1 rounded-full bg-blue-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 shadow">
                Lv. 1
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-3xl bg-white shadow-md px-5 py-4">
          <p className="text-xs sm:text-sm font-extrabold text-slate-700 shrink-0">TIẾN ĐỘ LƯỢT 1</p>
          <div className="relative h-2.5 max-w-[160px] flex-1 overflow-visible rounded-full bg-slate-100">
            <div className="h-full w-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
            {/* a little swing marks the player's current position on the progress bar —
                two ropes + a plank, echoing the reference art's ride-along character */}
            <div className="absolute -top-8 left-0 h-8 w-8 -translate-x-1/2">
              <div className="absolute left-1/2 top-0 h-4 w-[3px] origin-top -translate-x-[9px] rotate-[16deg] rounded-full bg-amber-700/70" />
              <div className="absolute left-1/2 top-0 h-4 w-[3px] origin-top translate-x-[6px] -rotate-[16deg] rounded-full bg-amber-700/70" />
              <div className="absolute left-1/2 top-[15px] h-[3px] w-6 -translate-x-1/2 rounded-full bg-amber-800/80" />
              <div className="absolute left-1/2 top-3 h-6 w-6 -translate-x-1/2 animate-char-bob">
                <CharacterPortrait
                  charKey={PLAYER_CHARACTER_KEY.student}
                  className="h-full w-full rounded-full ring-2 ring-white shadow-md overflow-hidden bg-blue-100"
                />
              </div>
            </div>
          </div>
          <span className="text-sm font-extrabold text-emerald-500 shrink-0">0%</span>
        </div>
      </div>

      <div className="relative mx-auto flex max-w-4xl gap-4 px-4 sm:px-6">
        <div className="flex shrink-0 flex-col items-center">
          {SIDEBAR_WEEKS.map((w, i) => {
            const Icon = w.icon;
            const Comp = w.active ? "button" : "div";
            return (
              <div key={i} className="flex flex-col items-center">
                <Comp
                  type={w.active ? "button" : undefined}
                  onClick={w.active ? () => dispatch({ type: "GO_TO", screen: "roleSelect" }) : undefined}
                  className={`flex h-24 w-20 flex-col items-center justify-center gap-1 rounded-[2rem] bg-gradient-to-b ${w.theme.grad} px-2 text-white shadow-lg transition ${
                    w.active ? "scale-105 ring-4 ring-white active:scale-95 cursor-pointer" : ""
                  }`}
                >
                  <span className="text-[10px] font-extrabold tracking-wide">LƯỢT</span>
                  <span className="text-xl font-black leading-none">{i + 1}</span>
                  {w.label && <p className="text-center text-[9px] font-bold leading-tight opacity-90">{w.label}</p>}
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25">
                    <Icon size={12} />
                  </span>
                </Comp>
                {i < SIDEBAR_WEEKS.length - 1 && <div className="my-1 h-5 w-0.5 rounded-full border-l-2 border-dashed border-blue-200" />}
              </div>
            );
          })}
        </div>

        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {WEEK_DAYS.map((d, i) => (
              <div key={d.number} className={i % 2 === 1 ? "sm:translate-y-4" : ""}>
                <DayCard
                  data={d}
                  theme={WEEK_THEMES[0]}
                  onClick={d.status === "current" ? () => dispatch({ type: "GO_TO", screen: "roleSelect" }) : undefined}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-8 max-w-4xl px-4 sm:px-6">
        <div className="flex items-center gap-3 rounded-3xl bg-white/80 backdrop-blur-sm px-5 py-4 shadow-sm">
          <span className="text-xl">💡</span>
          <p className="text-xs font-semibold leading-relaxed text-blue-700">
            Mỗi ngày là một bước tiến nhỏ giúp bạn hiểu mình hơn và xây dựng tâm lý vững vàng! 💕
          </p>
        </div>
      </div>

      <BottomNav active="history" />
    </div>
  );
}
