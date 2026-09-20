import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Compass, Home, Mail, Megaphone, RotateCcw, Sparkle, Sparkles } from "lucide-react";
import { useGame } from "../state/gameContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { StyleBarChart } from "../components/ui/Gauge";
import { addHistoryEntry } from "../state/storage";
import { STYLE_META, DAYS_PER_WEEK, type PlaySession, type ResponseStyle } from "../types";
import { WEEK_ORDER } from "../data/content";
import { CloudField, SparkleField } from "../components/illustrations/AmbientBackdrop";

// tracks sessions already written to history so navigating away and back
// (e.g. Evaluation -> LetterWrite -> Evaluation) never double-records
const recordedSessions = new WeakSet<PlaySession>();

export function EvaluationScreen() {
  const { role, dispatch, session, advice } = useGame();
  const [page, setPage] = useState<1 | 2>(1);

  // turning the page starts it at the top, not halfway down where the last one was left
  function goTo(next: 1 | 2) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    if (!session || !advice || !role) return;
    if (recordedSessions.has(session)) return;
    recordedSessions.add(session);
    addHistoryEntry({
      id: `H${Date.now().toString(36)}`,
      role,
      // a week is recorded as its span of days, a one-day run as the day it was
      weekday:
        session.mode === "day"
          ? `${session.days[0].weekday} · một ngày`
          : DAYS_PER_WEEK > 1
            ? `${WEEK_ORDER[0]} - ${WEEK_ORDER[DAYS_PER_WEEK - 1]}`
            : WEEK_ORDER[0],
      dominant: advice.dominant,
      scoreLabel: advice.scoreLabel,
      playedAt: new Date().toISOString(),
    });
  }, [role, session, advice]);

  if (!session || !advice) return null;

  const tally: Record<ResponseStyle, number> = { A: 0, B: 0, C: 0, D: 0 };
  session.choices.forEach((c) => (tally[c.style] += 1));
  const total = session.choices.length || 1;
  const dominantPct = Math.round((tally[advice.dominant] / total) * 100);
  const empathyPct = Math.round((tally.A / total) * 100);
  const resistPct = Math.round(((tally.C + tally.D) / total) * 100);
  const dominantMeta = STYLE_META[advice.dominant];

  // The report is two pages, the way the reference lays it out: who you were in these
  // situations, then what to do about it. One long scroll buried the advice under the
  // numbers, and the numbers under the advice on the way back up.
  const profilePage = (
    <>
        {/* the report's masthead: what this document is, then what it found */}
        <div className="mb-3 flex items-center gap-3 rounded-3xl bg-white/90 p-4 shadow-sm ring-1 ring-blue-100">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
            <Sparkle size={24} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-500">Hồ sơ phản kháng tâm lý</p>
            <h2 className="mt-0.5 text-[22px] font-black leading-tight text-slate-800">{advice.scoreLabel}</h2>
          </div>
        </div>

        {/* three readings of the same run: how the week leaned, how often it pushed back, and
            which level it sat on most */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          <MetricCard
            label={role === "student" ? "Thương lượng" : "Tôn trọng tự chủ"}
            value={empathyPct}
            tone="emerald"
            trend="up"
            delayMs={0}
          />
          <MetricCard label="Phản kháng khi bị ép" value={resistPct} tone="rose" trend="down" delayMs={80} />
          <MetricCard label="Phong cách chính" value={dominantPct} tone="sky" trend="flat" delayMs={160} />
        </div>

        {/* the portrait: the same two paragraphs the screen always had, laid out as findings
            so they can be read one at a time instead of as a block of text */}
        <Card className="mb-3 p-4">
          <h3 className="mb-2.5 flex items-center gap-1.5 text-[13px] font-extrabold text-slate-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <Megaphone size={13} />
            </span>
            Chân dung phản ứng của bạn
          </h3>
          <ul className="space-y-2.5">
            <Finding label="Xu hướng chủ đạo" tone="indigo" text={advice.headline} />
            <Finding label="Điểm dồn nén" tone="rose" text={advice.body} />
            <Finding
              label="Mức chọn nhiều nhất"
              tone="amber"
              text={`${dominantPct}% số lần bạn chọn mức này (${tally[advice.dominant]}/${total} tình huống).`}
              valueClass={dominantMeta.color}
            />
          </ul>
        </Card>

        <Button fullWidth icon={<ArrowRight size={18} />} onClick={() => goTo(2)}>
          Xem lời khuyên chiến lược
        </Button>
    </>
  );

  const advicePage = (
    <>
        <div className="mb-3 flex items-center gap-3 rounded-3xl bg-white/90 p-4 shadow-sm ring-1 ring-blue-100">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
            <Compass size={24} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-indigo-500">Định hướng phát triển</p>
            <h2 className="mt-0.5 text-[19px] font-black leading-tight text-slate-800">Xu hướng bản năng & lời khuyên</h2>
          </div>
        </div>

        <Card className="p-4 mb-3">
          <h3 className="mb-3 flex items-center gap-1.5 text-[13px] font-extrabold text-slate-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Sparkles size={13} />
            </span>
            Ma trận phản ứng tâm lý
          </h3>
          <StyleBarChart tally={tally} role={role ?? undefined} />
        </Card>

        <Card className="p-4 mb-3">
          <h3 className="mb-3 flex items-center gap-1.5 text-[13px] font-extrabold text-slate-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-600">📌</span>
            Lời khuyên dành riêng cho bạn
          </h3>
          <ul className="space-y-2.5">
            {advice.tips.map((tip, i) => (
              <li key={i} className="flex gap-2.5 rounded-2xl bg-slate-50 p-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm">{tip.emoji}</span>
                <p className="text-[13px] leading-relaxed text-slate-600">
                  <span className="font-extrabold text-slate-800">{tip.title}:</span> {tip.text}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        {/* the one line to walk away with */}
        <div className="mb-6 flex gap-2.5 rounded-2xl border-l-4 border-amber-400 bg-amber-50 p-3.5">
          <span className="text-base leading-none">✨</span>
          <p className="text-[13px] leading-relaxed text-amber-900">
            <span className="font-extrabold">Chiến lược cốt lõi:</span> {advice.extraNote}
          </p>
        </div>

        <div className="space-y-2.5">
          <Button fullWidth icon={<Mail size={18} />} onClick={() => dispatch({ type: "GO_TO", screen: "letterWrite" })}>
            Viết thư
          </Button>
          <Button
            fullWidth
            variant="secondary"
            icon={<RotateCcw size={18} />}
            onClick={() => dispatch({ type: "REPLAY_RUN" })}
          >
            Chơi lại từ đầu
          </Button>
          <Button fullWidth variant="ghost" icon={<Home size={18} />} onClick={() => dispatch({ type: "GO_HOME" })}>
            Về trang chủ
          </Button>
        </div>
    </>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blue-50 to-white px-5 py-8">
      <SparkleField tone="sky" />
      <CloudField tone="sky" heightVh={24} />
      <div className="relative mx-auto max-w-md">
        {/* which half of the report you are on, and the way back to the other one */}
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => goTo(1)}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-bold text-slate-500 shadow-sm ring-1 ring-slate-200 transition active:scale-95 disabled:opacity-0"
          >
            <ArrowLeft size={13} /> Hồ sơ
          </button>
          <div className="flex items-center gap-1.5">
            {[1, 2].map((n) => (
              <span
                key={n}
                className={`h-1.5 rounded-full transition-all ${page === n ? "w-5 bg-blue-500" : "w-1.5 bg-slate-300"}`}
              />
            ))}
            <span className="ml-1 text-[11px] font-bold text-slate-400">Trang {page}/2</span>
          </div>
        </div>

        {page === 1 ? profilePage : advicePage}
      </div>
    </div>
  );
}

const METRIC_TONE = {
  emerald: { card: "bg-emerald-50 ring-emerald-200", value: "text-emerald-600", bar: "bg-emerald-500", pill: "bg-emerald-100 text-emerald-700" },
  rose: { card: "bg-rose-50 ring-rose-200", value: "text-rose-600", bar: "bg-rose-500", pill: "bg-rose-100 text-rose-700" },
  sky: { card: "bg-sky-50 ring-sky-200", value: "text-sky-600", bar: "bg-sky-500", pill: "bg-sky-100 text-sky-700" },
} as const;

/** one reading of the run: a percentage, and the same percentage as a bar so three cards can
 *  be compared at a glance rather than by reading three numbers */
function MetricCard({
  label,
  value,
  tone,
  trend,
  delayMs,
}: {
  label: string;
  value: number;
  tone: keyof typeof METRIC_TONE;
  trend: "up" | "down" | "flat";
  delayMs: number;
}) {
  const t = METRIC_TONE[tone];
  return (
    <div className={`rounded-2xl p-2.5 ring-1 ${t.card} animate-pop`} style={{ animationDelay: `${delayMs}ms` }}>
      <div className="flex items-start justify-between gap-1">
        <p className="text-[10.5px] font-bold leading-tight text-slate-600">{label}</p>
        <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${t.pill}`}>
          {trend === "up" ? "↗" : trend === "down" ? "↘" : "◆"}
        </span>
      </div>
      <p className={`mt-1 text-2xl font-black leading-none ${t.value}`}>{value}%</p>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/70">
        <div className={`h-full rounded-full ${t.bar} transition-[width] duration-700`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/** a single finding in the portrait: a coloured label, then the sentence it introduces */
function Finding({ label, tone, text, valueClass }: { label: string; tone: "indigo" | "rose" | "amber"; text: string; valueClass?: string }) {
  const dot = tone === "indigo" ? "bg-indigo-500" : tone === "rose" ? "bg-rose-500" : "bg-amber-500";
  const chip = tone === "indigo" ? "bg-indigo-50 text-indigo-700" : tone === "rose" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700";
  return (
    <li className="flex gap-2">
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
      <p className="text-[13px] leading-relaxed text-slate-600">
        <span className={`mr-1 rounded-md px-1.5 py-0.5 text-[12px] font-extrabold ${chip}`}>{label}</span>
        <span className={valueClass}>{text}</span>
      </p>
    </li>
  );
}

