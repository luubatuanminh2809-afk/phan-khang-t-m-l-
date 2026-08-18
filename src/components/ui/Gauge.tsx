import type { ResponseStyle } from "../../types";
import { STYLE_META } from "../../types";

const STYLE_LABEL: Record<ResponseStyle, string> = {
  A: "Hợp tác / Đồng cảm",
  B: "Né tránh / Áp đặt nhẹ",
  C: "Phản kháng / Gay gắt",
  D: "Bất hợp tác / Phớt lờ",
};

const STYLE_BAR: Record<ResponseStyle, string> = {
  A: "bg-emerald-400",
  B: "bg-sky-400",
  C: "bg-amber-400",
  D: "bg-rose-400",
};

export function StyleBarChart({ tally }: { tally: Record<ResponseStyle, number> }) {
  const max = Math.max(1, ...Object.values(tally));
  const total = Math.max(1, Object.values(tally).reduce((a, b) => a + b, 0));
  const order: ResponseStyle[] = ["A", "B", "C", "D"];
  return (
    <div className="space-y-3">
      {order.map((style) => (
        <div key={style}>
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className={STYLE_META[style].color}>{STYLE_LABEL[style]}</span>
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
