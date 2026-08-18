import { useEffect } from "react";
import { Home, Mail, Megaphone, RotateCcw, Sparkle, Sparkles } from "lucide-react";
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

  useEffect(() => {
    if (!session || !advice || !role) return;
    if (recordedSessions.has(session)) return;
    recordedSessions.add(session);
    addHistoryEntry({
      id: `H${Date.now().toString(36)}`,
      role,
      weekday: DAYS_PER_WEEK > 1 ? `${WEEK_ORDER[0]} - ${WEEK_ORDER[DAYS_PER_WEEK - 1]}` : WEEK_ORDER[0],
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
  const deviation = empathyPct - resistPct;
  const dominantMeta = STYLE_META[advice.dominant];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blue-50 to-white px-5 py-8">
      <SparkleField tone="sky" />
      <CloudField tone="sky" heightVh={24} />
      <div className="relative mx-auto max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30">
            <Sparkle size={28} />
          </div>
          <p className="text-xs font-bold uppercase tracking-wide text-blue-400">Đánh giá PKTL của bạn</p>
          <h2 className="text-2xl font-extrabold text-slate-800 mt-1">{advice.scoreLabel}</h2>
        </div>

        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <StatTile emoji="🎭" value={`${dominantPct}%`} label="Phong cách chính" valueClass={dominantMeta.color} borderClass="border-t-amber-400" delayMs={0} />
          <StatTile emoji="🤝" value={`${empathyPct}%`} label="Đồng cảm" valueClass="text-emerald-600" borderClass="border-t-emerald-400" delayMs={80} />
          <StatTile
            emoji="⚖️"
            value={`${deviation >= 0 ? "+" : ""}${deviation}%`}
            label="Độ lệch"
            valueClass={deviation >= 0 ? "text-sky-600" : "text-rose-600"}
            borderClass={deviation >= 0 ? "border-t-sky-400" : "border-t-rose-400"}
            delayMs={160}
          />
        </div>

        <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4 mb-4 flex gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white">
            <Megaphone size={15} />
          </span>
          <p className="text-sm text-indigo-900 leading-relaxed">
            <span className="font-bold">Giải thích dễ hiểu:</span> {advice.headline}. {advice.body}
          </p>
        </div>

        <Card className="p-5 mb-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Xu hướng phản ứng</h3>
          <StyleBarChart tally={tally} />
        </Card>

        <Card className="p-5 mb-4">
          <h3 className="flex items-center gap-1.5 font-extrabold text-slate-800 mb-3">
            📌 Lời khuyên dành cho bạn
          </h3>
          <ul className="space-y-3">
            {advice.tips.map((tip, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-lg leading-none mt-0.5">{tip.emoji}</span>
                <p className="text-sm text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800">{tip.title}:</span> {tip.text}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 mb-6 flex gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-white">
            <Sparkles size={15} />
          </span>
          <p className="text-sm text-amber-800 leading-relaxed">
            <span className="font-bold">Gợi ý thêm:</span> {advice.extraNote}
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
            onClick={() => dispatch({ type: "REPLAY_WEEK" })}
          >
            Chơi lại từ đầu
          </Button>
          <Button fullWidth variant="ghost" icon={<Home size={18} />} onClick={() => dispatch({ type: "GO_HOME" })}>
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatTile({
  emoji,
  value,
  label,
  valueClass,
  borderClass,
  delayMs,
}: {
  emoji: string;
  value: string;
  label: string;
  valueClass: string;
  borderClass: string;
  delayMs: number;
}) {
  return (
    <div
      className={`rounded-2xl bg-white shadow-sm border-t-4 ${borderClass} px-2 py-3 text-center animate-pop`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <p className={`text-xl font-black ${valueClass}`}>{value}</p>
      <p className="mt-1 text-[11px] font-semibold text-slate-500 leading-tight">
        {emoji} {label}
      </p>
    </div>
  );
}
