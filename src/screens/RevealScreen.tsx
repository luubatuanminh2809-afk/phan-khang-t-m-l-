import { useEffect, useRef, useState } from "react";
import { KeyRound, Quote } from "lucide-react";
import { useGame } from "../state/gameContext";
import { getSituationsFor } from "../data/content";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { CharacterPortrait } from "../components/illustrations/CharacterPortrait";
import { getCharacterKey } from "../data/assetMap";
import { Coachmark } from "../components/ui/Coachmark";
import { DAYS_PER_WEEK } from "../types";

export function RevealScreen() {
  const { dispatch, role, session, revealIndex, lastDailyCode } = useGame();
  // guards against a double-tap firing REVEAL_NEXT twice and skipping a card
  const [advancing, setAdvancing] = useState(false);
  useEffect(() => setAdvancing(false), [revealIndex]);
  const thoughtBoxRef = useRef<HTMLDivElement>(null);

  if (!role || !session) return null;

  const day = session.days[session.dayIndex];
  const situations = getSituationsFor(role, session.gender);
  const situation = situations.find((s) => s.id === day.situationIds[revealIndex]);
  if (!situation) return null;

  // C/D picks already got their insideThought immediately in SituationScreen, so this
  // recap only stops on A/B ones — "1/3" here means "1st of 3 recap cards", not raw
  // position in the day, since revealIndex can skip past already-shown C/D situations
  const situationsBeforeToday = session.days
    .slice(0, session.dayIndex)
    .reduce((sum, d) => sum + d.situationIds.length, 0);
  const revealableIndices = day.situationIds
    .map((_, i) => i)
    .filter((i) => {
      const style = session.choices[situationsBeforeToday + i]?.style;
      return style !== "C" && style !== "D";
    });
  const positionInRevealable = revealableIndices.indexOf(revealIndex) + 1;
  const isLastRevealable = positionInRevealable >= revealableIndices.length;

  function handleNext() {
    if (advancing) return;
    setAdvancing(true);
    dispatch({ type: "REVEAL_NEXT" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-blue-50 to-white flex items-center justify-center px-5 py-8">
      <Card className="w-full max-w-md p-6 animate-pop">
        {positionInRevealable === 1 && (
          <div className="text-center mb-5">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 animate-key-glow">
              <KeyRound size={30} className="text-amber-500" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-800">Chiếc chìa khoá đã hoàn chỉnh!</h2>
            <p className="text-sm text-slate-400 mt-1">
              Giờ hãy xem lại từng tình huống — lần này từ suy nghĩ thật của {situation.npcName}.
            </p>
            {lastDailyCode !== null && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600">
                🔢 Mã số hôm nay: <span className="text-base">{lastDailyCode}</span> — giữ lại để mở rương cuối tuần nhé!
              </p>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 mb-3">
          <CharacterPortrait
            charKey={getCharacterKey(situation.insideThoughtOwner)}
            mood="talking"
            className="h-16 w-16 animate-char-bob"
          />
          <div>
            <p className="text-sm font-bold text-slate-800">{situation.insideThoughtOwner}</p>
            <p className="text-xs text-slate-400">{situation.insideThoughtOwnerRole ?? situation.npcRole}</p>
          </div>
        </div>

        <div ref={thoughtBoxRef} className="rounded-2xl bg-blue-50 p-4 relative">
          <Quote className="text-blue-200 absolute -top-2 -left-2" size={28} />
          <p className="text-sm text-slate-700 leading-relaxed italic">{situation.insideThought}</p>
        </div>
        {positionInRevealable === 1 && (
          <Coachmark
            id="reveal-inside-thought"
            targetRef={thoughtBoxRef}
            text={`Đây là điều ${situation.insideThoughtOwner} thật sự nghĩ, chứ không phải điều đã nói ra — đọc để hiểu góc nhìn của họ.`}
          />
        )}

        <p className="text-xs text-slate-400 text-center mt-4 mb-1">
          Tình huống {positionInRevealable}/{revealableIndices.length}
        </p>
        <div className="flex gap-1.5 justify-center mb-5">
          {revealableIndices.map((i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full ${i <= revealIndex ? "bg-blue-400" : "bg-slate-200"}`}
            />
          ))}
        </div>

        <Button fullWidth onClick={handleNext} disabled={advancing}>
          {!isLastRevealable
            ? "Tiếp theo"
            : session.dayIndex >= DAYS_PER_WEEK - 1
              ? "Mở rương bí mật →"
              : "Kết thúc ngày"}
        </Button>
      </Card>
    </div>
  );
}
