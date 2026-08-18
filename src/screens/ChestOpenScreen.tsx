import { useState } from "react";
import { Gift, Sparkles } from "lucide-react";
import { useGame } from "../state/gameContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { playSuccess, playReveal } from "../lib/sfx";
import { CloudField, SparkleField } from "../components/illustrations/AmbientBackdrop";
import { DAYS_PER_WEEK } from "../types";

// "đủ 7 ngày sẽ có 7 số để mở rương, khi đó 1 bảng đánh giá mức độ pktl và lời
// khuyên sẽ xuất hiện" (docs/GAME_DESCRIPTION.md section 6, steps 7-8) — the 7
// daily codes don't gate anything mechanically (there's nothing to "get wrong"
// here), they're a collectible payoff for finishing the whole week before the
// evaluation is revealed.
export function ChestOpenScreen() {
  const { dispatch, session } = useGame();
  const [opened, setOpened] = useState(false);
  if (!session) return null;

  const codes = session.dailyCodes;

  function handleOpen() {
    if (opened) return;
    playSuccess();
    setTimeout(playReveal, 300);
    setOpened(true);
  }

  function handleContinue() {
    dispatch({ type: "GO_TO", screen: "evaluation" });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-amber-50 via-blue-50 to-white flex items-center justify-center px-5 py-8">
      <SparkleField tone="sunset" />
      <CloudField tone="sunset" heightVh={45} />
      <Card className="relative w-full max-w-md p-6 animate-pop text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-amber-500 mb-1">Đủ {DAYS_PER_WEEK} mã số rồi!</p>
        <h2 className="text-xl font-extrabold text-slate-800 mb-4">Mở rương bí mật</h2>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {codes.map((code, i) => (
            <span
              key={i}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-lg font-black text-amber-600 shadow-sm animate-pop"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {code}
            </span>
          ))}
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={handleOpen}
          className={`mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-3xl transition-transform ${
            opened ? "bg-amber-400 scale-110 animate-key-glow" : "bg-amber-200 active:scale-95 cursor-pointer"
          }`}
        >
          {opened ? <Sparkles size={44} className="text-white" /> : <Gift size={44} className="text-amber-600" />}
        </div>

        {opened ? (
          <>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Rương đã mở! Bên trong là bảng đánh giá mức độ phản kháng tâm lý của bạn suốt {DAYS_PER_WEEK} ngày qua,
              cùng lời khuyên dành riêng cho bạn.
            </p>
            <Button fullWidth onClick={handleContinue}>
              Xem kết quả
            </Button>
          </>
        ) : (
          <p className="text-sm text-slate-400 mb-1">Chạm vào rương để mở ra xem bên trong có gì nhé.</p>
        )}
      </Card>
    </div>
  );
}
