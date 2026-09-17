import type { ResponseStyle, Role } from "../../types";
import { STYLE_META } from "../../types";

// Each bar is named in the words of the framework for the role that was played: a D from a
// student is an outright refusal, a D from a parent or teacher is a threat. One shared set
// used to label every D "Bất hợp tác / Phớt lờ", which told an adult who had threatened to
// smash a phone that they had shrugged it off.
const STUDENT_LABEL: Record<ResponseStyle, string> = {
  A: "Thương lượng",
  B: "Lách luật",
  C: "Chống đối công khai",
  D: "Bất hợp tác hoàn toàn",
};

const ADULT_LABEL: Record<ResponseStyle, string> = {
  A: "Tôn trọng tự chủ",
  B: "Giới hạn có thương lượng",
  C: "Cấm đoán & chỉ trích",
  D: "Áp đặt & đe doạ",
};

// nothing played yet, so no role to name the levels by
const PLAIN_LABEL: Record<ResponseStyle, string> = { A: "Mức A", B: "Mức B", C: "Mức C", D: "Mức D" };

const STYLE_BAR: Record<ResponseStyle, string> = {
  A: "bg-emerald-400",
  B: "bg-sky-400",
  C: "bg-amber-400",
  D: "bg-rose-400",
};

export function StyleBarChart({ tally, role }: { tally: Record<ResponseStyle, number>; role?: Role }) {
  const labels = !role ? PLAIN_LABEL : role === "student" ? STUDENT_LABEL : ADULT_LABEL;
  const max = Math.max(1, ...Object.values(tally));
  const total = Math.max(1, Object.values(tally).reduce((a, b) => a + b, 0));
  const order: ResponseStyle[] = ["A", "B", "C", "D"];
  return (
    <div className="space-y-3">
      {order.map((style) => (
        <div key={style}>
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className={STYLE_META[style].color}>{labels[style]}</span>
            <span className="text-slate-400">{tally[style]}/{total}</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full ${STYLE_BAR[style]} transition-all duration-700`}
              style={{ width: `${(tally[style] / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
