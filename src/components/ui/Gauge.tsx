import { useEffect, useState } from "react";
import type { ResponseStyle, Role } from "../../types";

// Each level is named in the words of the framework for the role that was played: a D from a
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

// one line saying what the level actually looks like when someone does it, again in the
// words of the role played — the same four names mean different behaviour either side of
// the desk, and a matrix of bare labels left the player to guess which was which
const STUDENT_NOTE: Record<ResponseStyle, string> = {
  A: "Nói thẳng điều mình muốn, tìm điểm chung.",
  B: "Ngoài mặt làm theo, bên trong lách đi.",
  C: "Cãi lại ngay tại chỗ, kể cả trước lớp.",
  D: "Từ chối hẳn, chịu phạt cũng không làm.",
};

const PARENT_NOTE: Record<ResponseStyle, string> = {
  A: "Hỏi ý con rồi mới quyết, chừa chỗ cho con chọn.",
  B: "Cho phép, nhưng kèm giới hạn đã thoả thuận.",
  C: "Cấm thẳng, kèm lời chê trách.",
  D: "Ra lệnh, kèm doạ thu đồ hoặc cắt quyền.",
};

const TEACHER_NOTE: Record<ResponseStyle, string> = {
  A: "Hỏi trò muốn gì rồi cùng chốt cách làm.",
  B: "Cho linh động trong khuôn thầy cô đặt ra.",
  C: "Cấm và phê bình trước lớp.",
  D: "Ra lệnh, kèm điểm kém hoặc mời phụ huynh.",
};

const PLAIN_NOTE: Record<ResponseStyle, string> = {
  A: "Thương lượng để giữ được điều mình cần.",
  B: "Đi đường vòng thay vì đối mặt.",
  C: "Phản đối công khai, ngay lúc đó.",
  D: "Không hợp tác, chấp nhận hậu quả.",
};

const LEVEL_EMOJI: Record<ResponseStyle, string> = { A: "🤝", B: "🎭", C: "📣", D: "✋" };

// One hue per level, in the fixed order A→D — never cycled, never reassigned by rank, so the
// same colour means the same level on every screen. Checked with the palette validator:
// inside the lightness band, above the chroma floor, worst adjacent pair ΔE 9.4 for deuteranopia
// and 16.6 for normal vision, all four above 3:1 on this surface.
const LEVEL_FILL: Record<ResponseStyle, string> = {
  A: "bg-emerald-600",
  B: "bg-sky-600",
  C: "bg-amber-600",
  D: "bg-rose-600",
};

const LEVEL_SOFT: Record<ResponseStyle, string> = {
  A: "bg-emerald-50 ring-emerald-200",
  B: "bg-sky-50 ring-sky-200",
  C: "bg-amber-50 ring-amber-200",
  D: "bg-rose-50 ring-rose-200",
};

const ORDER: ResponseStyle[] = ["A", "B", "C", "D"];

/**
 * The run's answers as one spectrum, ôn hoà on the left and gay gắt on the right, rather than
 * four separate tracks: the shape of the whole bar is the finding — how far along it the
 * player's week sits — and the counts underneath carry the exact numbers. Four grey tracks
 * made every level look like its own unrelated score.
 */
export function StyleBarChart({ tally, role }: { tally: Record<ResponseStyle, number>; role?: Role }) {
  const labels = !role ? PLAIN_LABEL : role === "student" ? STUDENT_LABEL : ADULT_LABEL;
  const notes = !role ? PLAIN_NOTE : role === "student" ? STUDENT_NOTE : role === "parent" ? PARENT_NOTE : TEACHER_NOTE;
  const total = Math.max(1, ORDER.reduce((sum, s) => sum + tally[s], 0));
  const top = ORDER.reduce((best, s) => (tally[s] > tally[best] ? s : best), "A" as ResponseStyle);
  const pct = (style: ResponseStyle) => Math.round((tally[style] / total) * 100);
  // the bar draws itself out on arrival rather than appearing already finished, so the eye
  // follows it from ôn hoà towards gay gắt and lands on where the week actually sat
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-slate-400">
        <span>Ôn hoà</span>
        <span>Gay gắt</span>
      </div>

      {/* the spectrum: one bar, four segments, a 2px surface gap between them so neighbouring
          fills never blend into one another */}
      <div className="flex h-7 w-full gap-[2px] overflow-hidden rounded-full bg-slate-100">
        {ORDER.map((style) =>
          tally[style] === 0 ? null : (
            <div
              key={style}
              className={`flex items-center justify-center overflow-hidden ${LEVEL_FILL[style]} transition-[width] duration-[900ms] ease-out`}
              style={{ width: drawn ? `${(tally[style] / total) * 100}%` : "0%" }}
            >
              {pct(style) >= 10 && <span className="text-[11px] font-black text-white drop-shadow-sm">{tally[style]}</span>}
            </div>
          ),
        )}
      </div>

      {/* the matrix: every level named beside its own colour, with what it looks like in
          practice — identity never rests on the colour alone */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {ORDER.map((style) => {
          const isTop = style === top && tally[style] > 0;
          return (
            <div
              key={style}
              className={`relative rounded-2xl p-2.5 ring-1 ${isTop ? `${LEVEL_SOFT[style]} ring-2` : "bg-slate-50 ring-slate-100"}`}
            >
              <div className="flex items-start justify-between gap-1">
                <span className={`flex h-7 w-7 items-center justify-center rounded-xl text-sm ${LEVEL_SOFT[style]} ring-1`}>
                  {LEVEL_EMOJI[style]}
                </span>
                <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-500 ring-1 ring-slate-200">
                  {pct(style)}% · {tally[style]}/{total}
                </span>
              </div>
              <p className="mt-1.5 flex items-center gap-1 text-[12px] font-extrabold leading-tight text-slate-700">
                <span className={`h-2 w-2 shrink-0 rounded-full ${LEVEL_FILL[style]}`} />
                {labels[style]}
              </p>
              <p className="mt-0.5 text-[10.5px] leading-snug text-slate-500">{notes[style]}</p>
              {isTop && (
                <p className="mt-1 text-[9.5px] font-extrabold uppercase tracking-wide text-slate-500">★ Nhiều nhất</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
