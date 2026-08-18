import { ArrowLeft, ArrowRight, Box, FlaskConical, KeyRound, Mail, MessageCircleHeart, Sparkles } from "lucide-react";
import { useGame } from "../state/gameContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { CharacterPortrait } from "../components/illustrations/CharacterPortrait";
import { PLAYER_CHARACTER_KEY } from "../data/assetMap";
import { roleMeta } from "../data/advice";
import { DAYS_PER_WEEK, SITUATIONS_PER_DAY_MAX, SITUATIONS_PER_DAY_MIN, type Role } from "../types";

const STEPS = [
  {
    icon: MessageCircleHeart,
    title: `Trải nghiệm ${DAYS_PER_WEEK} ngày, chọn cách phản ứng`,
    body: `Hoá thân thành Học sinh, Phụ huynh hoặc Giáo viên và trải qua ${SITUATIONS_PER_DAY_MIN}-${SITUATIONS_PER_DAY_MAX} tình huống thật mỗi ngày, suốt ${DAYS_PER_WEEK} ngày.`,
  },
  {
    icon: KeyRound,
    title: `Trả lời hết ${SITUATIONS_PER_DAY_MIN}-${SITUATIONS_PER_DAY_MAX} tình huống mỗi ngày`,
    body: "Mỗi lựa chọn đưa bạn tiến gần hơn đến thử thách cuối ngày — nơi quyết định bạn có mở được khoá hay không.",
  },
  {
    icon: Sparkles,
    title: "Mở khoá góc nhìn đối phương",
    body: "Vượt qua thử thách, bạn sẽ thấy lại từng tình huống qua suy nghĩ thật của người đối diện, và nhận một mã số bí mật.",
  },
  {
    icon: Box,
    title: `Thu thập đủ ${DAYS_PER_WEEK} mã số`,
    body: `Mỗi ngày hoàn thành thêm 1 mã số — đủ ${DAYS_PER_WEEK} mã số sẽ mở được rương bí mật chứa đánh giá PKTL cuối cùng.`,
  },
  {
    icon: Mail,
    title: "Viết thư gửi người bạn thương",
    body: "Sau khi nhận lời khuyên, hãy viết một lá thư thật lòng và gửi ngay bằng ảnh hoặc link.",
  },
];

export function ExploreScreen() {
  const { dispatch } = useGame();
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 px-5 pt-8 pb-14">
        <button
          onClick={() => dispatch({ type: "GO_HOME" })}
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur text-white active:scale-90 transition"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="mx-auto max-w-md text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-blue-100">Khám phá Moralyn</p>
          <h2 className="mt-2 text-2xl font-extrabold text-white leading-snug">
            Một hành trình — nhìn từ hai phía
          </h2>
          <p className="mt-2 text-sm text-blue-100 leading-relaxed">
            Hoá thân, lựa chọn, và mở khoá những điều người khác chưa từng nói ra.
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -top-8 -left-8 h-28 w-28 rounded-full bg-white/10" />
      </div>

      <div className="mx-auto max-w-md px-5 -mt-8">
        <p className="text-center text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Bạn muốn hoá thân thành ai?</p>
        <div className="grid grid-cols-3 gap-2.5 mb-8">
          {(Object.keys(roleMeta) as Role[]).map((r) => {
            const meta = roleMeta[r];
            return (
              <Card key={r} className="p-2.5 text-center">
                <div className={`mx-auto mb-1.5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.accent} overflow-hidden`}>
                  <CharacterPortrait charKey={PLAYER_CHARACTER_KEY[r]} className="h-16 w-16" />
                </div>
                <p className="text-xs font-extrabold text-slate-700">{meta.title}</p>
              </Card>
            );
          })}
        </div>

        <h3 className="text-lg font-extrabold text-slate-800 mb-1">Moralyn chơi như thế nào?</h3>
        <p className="text-sm text-slate-400 mb-4">Năm bước để hiểu nhau hơn sau mỗi lượt chơi</p>
        <div className="space-y-3 mb-8">
          {STEPS.map((step, i) => (
            <Card key={i} className="p-4 flex gap-3 items-start">
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                <step.icon size={20} />
                <span className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-extrabold text-white">
                  {i + 1}
                </span>
              </span>
              <div>
                <p className="font-bold text-slate-800 text-sm">{step.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{step.body}</p>
              </div>
            </Card>
          ))}
        </div>

        <Button fullWidth icon={<ArrowRight size={18} />} onClick={() => dispatch({ type: "GO_TO", screen: "history" })} className="mb-4">
          Bắt đầu hành trình
        </Button>

        <button
          onClick={() => dispatch({ type: "GO_TO", screen: "freeRoamDemo" })}
          className="mb-10 w-full flex items-center gap-3 rounded-3xl border-2 border-dashed border-violet-200 bg-violet-50 p-4 text-left active:scale-[0.98] transition"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-500">
            <FlaskConical size={20} />
          </span>
          <div className="flex-1">
            <p className="font-bold text-violet-700 text-sm">Thử nghiệm: Di chuyển tự do</p>
            <p className="text-xs text-violet-400 mt-0.5 leading-relaxed">Bản demo 1 cảnh — đi lại thật, NPC tự hành động, chuyện tự xảy ra quanh bạn.</p>
          </div>
        </button>

        <button
          onClick={() => dispatch({ type: "GO_TO", screen: "school3dDemo" })}
          className="mb-10 w-full flex items-center gap-3 rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-left active:scale-[0.98] transition"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-200 text-slate-600">
            <Box size={20} />
          </span>
          <div className="flex-1">
            <p className="font-bold text-slate-700 text-sm">Thử nghiệm: Góc nhìn thứ nhất 3D (thô)</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Prototype Three.js — hành lang + 1 lớp học, hình khối cơ bản, để thử cơ chế trước khi làm bản đầy đủ.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
