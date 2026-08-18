import { Sparkles } from "lucide-react";

export type BackdropTone = "sky" | "sunset";

const CLOUD_COLORS: Record<BackdropTone, [string, string, string]> = {
  // cool pastel — blue/mint/peach, for the blue-toned screens (RoleSelect, DayIntro,
  // Evaluation)
  sky: ["#e0f2ff", "#d6f5ea", "#ffe4cf"],
  // warm pastel — cream/peach/coral, validated on HistoryScreen originally, reused
  // verbatim here for the amber-toned screens (DayEnd, ChestOpen)
  sunset: ["#fdecd8", "#fbdfbe", "#f7cfa0"],
};

const SPARKLE_COLOR: Record<BackdropTone, string> = {
  sky: "text-sky-300/70",
  sunset: "text-amber-300/70",
};

function CloudPuffs({ fill, cx, cy, r }: { fill: string; cx: number[]; cy: number[]; r: number[] }) {
  return (
    <>
      {cx.map((x, i) => (
        <circle key={i} cx={x} cy={cy[i]} r={r[i]} fill={fill} />
      ))}
    </>
  );
}

/** soft layered cloud silhouettes anchored to the bottom of the screen — a decorative
 *  backdrop instead of flat color, standing in for the "too much white space" complaint.
 *  Each layer is a smooth base wave PLUS a row of circles along its ridge — the circles
 *  are what turn a flat wavy horizon into a puffy, scalloped "cumulus cloud" silhouette. */
export function CloudField({ tone, heightVh = 42, className = "" }: { tone: BackdropTone; heightVh?: number; className?: string }) {
  const [back, mid, front] = CLOUD_COLORS[tone];
  return (
    <svg
      viewBox="0 0 1000 460"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 bottom-0 w-full ${className}`}
      style={{ height: `${heightVh}vh` }}
      aria-hidden="true"
    >
      {/* distant hill silhouette, sitting behind the clouds */}
      <path d="M680,460 L780,230 L845,305 L920,160 L1000,290 L1000,460 Z" fill="#bcd6d4" opacity="0.55" />
      <path d="M0,460 L70,300 L130,360 L190,260 L260,340 L260,460 Z" fill="#c7ddd6" opacity="0.4" />

      {/* a couple of small flying birds in the open sky */}
      <path d="M120,55 q9,-15 18,0 q9,-15 18,0" stroke="#64748b" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.45" />
      <path d="M800,35 q7,-12 14,0 q7,-12 14,0" stroke="#64748b" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />

      <path
        d="M0,200 C60,150 140,140 190,175 C225,110 320,100 365,160 C405,105 490,115 515,180 C555,130 630,140 660,190 C715,145 800,155 835,205 C885,165 955,175 1000,205 L1000,460 L0,460 Z"
        fill={back}
      />
      <CloudPuffs fill={back} cx={[40, 190, 340, 490, 640, 790, 940]} cy={[150, 120, 140, 160, 135, 150, 145]} r={[50, 58, 52, 60, 50, 55, 48]} />

      <path
        d="M0,260 C90,215 190,210 240,245 C280,200 375,195 415,235 C465,190 555,195 585,240 C635,205 715,210 755,245 C815,215 910,220 1000,255 L1000,460 L0,460 Z"
        fill={mid}
      />
      <CloudPuffs fill={mid} cx={[70, 220, 370, 520, 670, 820, 960]} cy={[225, 200, 220, 235, 210, 225, 215]} r={[55, 62, 56, 64, 54, 58, 52]} />

      <path
        d="M0,320 C110,285 230,285 285,310 C335,285 435,285 470,315 C520,285 620,290 655,315 C715,290 825,295 875,320 C925,300 965,305 1000,318 L1000,460 L0,460 Z"
        fill={front}
      />
      <CloudPuffs fill={front} cx={[100, 260, 410, 560, 700, 850, 970]} cy={[305, 285, 300, 315, 295, 305, 290]} r={[58, 65, 60, 68, 58, 62, 55]} />
    </svg>
  );
}

/** a handful of pulsing sparkle icons at fixed positions, purely ambient */
export function SparkleField({ tone, className = "" }: { tone: BackdropTone; className?: string }) {
  const sparkles = [
    { left: "8%", top: "14%", size: 12, delay: "0s" },
    { left: "22%", top: "42%", size: 8, delay: "0.6s" },
    { left: "88%", top: "20%", size: 10, delay: "1.1s" },
    { left: "72%", top: "50%", size: 8, delay: "0.3s" },
    { left: "48%", top: "10%", size: 9, delay: "0.9s" },
  ];
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {sparkles.map((s, i) => (
        <Sparkles
          key={i}
          size={s.size}
          className={`absolute animate-pulse ${SPARKLE_COLOR[tone]}`}
          style={{ left: s.left, top: s.top, animationDelay: s.delay }}
        />
      ))}
    </div>
  );
}

/** Soft pastel hills rolling across the bottom of the screen, warm on the right and cool
 *  on the left. Used where a screen would otherwise fade to plain white at the foot —
 *  the letter page, whose whole point is that it should feel like a nice place to sit
 *  and write something. Purely decorative, so it never takes pointer events. */
export function HillField({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-[26vh] overflow-hidden ${className}`}>
      <svg viewBox="0 0 400 160" preserveAspectRatio="none" className="h-full w-full">
        <path d="M0 96 Q 60 62 130 84 T 260 74 T 400 92 L400 160 L0 160 Z" fill="#bfe3f5" opacity="0.55" />
        <path d="M0 116 Q 70 88 150 106 T 290 98 T 400 114 L400 160 L0 160 Z" fill="#cfeacb" opacity="0.65" />
        <path d="M0 134 Q 90 112 180 128 T 400 130 L400 160 L0 160 Z" fill="#fbe6bd" opacity="0.7" />
        <path d="M0 148 Q 110 134 220 145 T 400 146 L400 160 L0 160 Z" fill="#f9d3d8" opacity="0.7" />
      </svg>
    </div>
  );
}
