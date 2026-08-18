import { useMemo, useState } from "react";
import { ArrowRight, PartyPopper } from "lucide-react";
import { useGame } from "../state/gameContext";
import { getSituationsFor } from "../data/content";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { WeekProgress } from "../components/ui/WeekProgress";
import { ClosenessMeter } from "../components/ui/ClosenessMeter";
import { CharacterPortrait } from "../components/illustrations/CharacterPortrait";
import { getCharacterKey } from "../data/assetMap";
import { CloudField, SparkleField } from "../components/illustrations/AmbientBackdrop";
import { DAYS_PER_WEEK } from "../types";

const TEASER_TEMPLATES = [
  (name: string) => `Ngày mai, ${name} sẽ có điều muốn nói với bạn...`,
  (name: string) => `Có một cuộc trò chuyện với ${name} đang chờ bạn vào ngày mai...`,
  (name: string) => `${name} sẽ xuất hiện vào ngày mai — bạn đã sẵn sàng chưa?`,
  (name: string, location: string) => `Ngày mai, một chuyện bất ngờ sẽ xảy ra ở ${location}, liên quan đến ${name}...`,
];

export function DayEndScreen() {
  const { dispatch, role, session } = useGame();
  const [advancing, setAdvancing] = useState(false);
  if (!role || !session) return null;

  function handleNextDay() {
    if (advancing) return; // guards against a double-tap firing NEXT_DAY twice and skipping a day
    setAdvancing(true);
    dispatch({ type: "NEXT_DAY" });
  }

  const completedDay = session.dayIndex;
  const tomorrow = session.days[session.dayIndex + 1];
  const teaserSituation = tomorrow
    ? getSituationsFor(role, session.gender).find((s) => s.id === tomorrow.situationIds[0])
    : undefined;

  const teaserText = useMemo(() => {
    if (!teaserSituation) return "";
    const template = TEASER_TEMPLATES[Math.floor(Math.random() * TEASER_TEMPLATES.length)];
    return template(teaserSituation.npcName, teaserSituation.location);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teaserSituation?.id]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-amber-50 via-blue-50 to-white flex items-center justify-center px-5 py-8">
      <SparkleField tone="sunset" />
      <CloudField tone="sunset" heightVh={45} />
      <Card className="relative w-full max-w-md p-6 animate-pop text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-500">
          <PartyPopper size={28} />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800">Ngày {completedDay + 1} hoàn thành!</h2>
        <p className="text-sm text-slate-400 mt-1 mb-5">
          Còn {DAYS_PER_WEEK - 1 - completedDay} ngày nữa là đủ mã số để mở rương bí mật.
        </p>

        <div className="rounded-2xl bg-slate-50 p-4 mb-5">
          <WeekProgress completedDays={completedDay + 1} currentDay={completedDay + 1} />
          {(role === "parent" || role === "teacher") && (
            <div className="mt-3 flex justify-center">
              <ClosenessMeter value={session.closeness} />
            </div>
          )}
        </div>

        {teaserSituation && (
          <div className="flex items-center gap-3 rounded-2xl bg-indigo-50 p-4 mb-6 text-left">
            <CharacterPortrait
              charKey={getCharacterKey(teaserSituation.npcName)}
              mood="talking"
              className="h-16 w-16 shrink-0 animate-char-bob"
            />
            <p className="text-sm text-indigo-900 leading-relaxed">
              <span className="font-bold">👀 Hé lộ ngày mai:</span> {teaserText}
            </p>
          </div>
        )}

        <Button fullWidth icon={<ArrowRight size={18} />} onClick={handleNextDay} disabled={advancing}>
          Sang ngày mới
        </Button>
        <button
          onClick={() => dispatch({ type: "GO_HOME" })}
          disabled={advancing}
          className="mt-4 text-sm font-bold text-slate-400 disabled:opacity-50"
        >
          Về trang chủ (tiến trình lượt này sẽ mất)
        </button>
      </Card>
    </div>
  );
}
