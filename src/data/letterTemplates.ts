import type { LetterTheme } from "../types";

export interface LetterTemplate {
  id: string;
  name: string;
  description: string;
  emoji: string;
  theme: LetterTheme;
  starterText: string;
}

export const LETTER_TEMPLATES: LetterTemplate[] = [
  {
    id: "thanks",
    name: "Thư cảm ơn",
    description: "Gửi lời cảm ơn chân thành",
    emoji: "💐",
    theme: "blue",
    starterText: "Cảm ơn vì luôn ở bên con, đã yêu thương và ủng hộ con trên mọi chặng đường.\n\nCon yêu nhiều lắm!",
  },
  {
    id: "sorry",
    name: "Thư xin lỗi",
    description: "Gửi lời xin lỗi chân thành",
    emoji: "💙",
    theme: "blue",
    starterText: "Con xin lỗi vì lần đó đã làm bố/mẹ buồn. Con hứa sẽ sửa đổi và cố gắng hơn mỗi ngày.\n\nMong bố/mẹ tha lỗi cho con!",
  },
  {
    id: "encourage",
    name: "Thư động viên",
    description: "Tiếp thêm sức mạnh cho người nhận",
    emoji: "🌱",
    theme: "green",
    starterText:
      "Bố/mẹ ơi,\nCon biết bố/mẹ đã rất vất vả. Con mong bố/mẹ luôn giữ gìn sức khoẻ và vui vẻ mỗi ngày nhé!\n\nCon luôn ở đây và yêu bố/mẹ rất nhiều!",
  },
  {
    id: "share",
    name: "Thư chia sẻ",
    description: "Chia sẻ tâm tư, cảm xúc của bạn",
    emoji: "📚",
    theme: "amber",
    starterText:
      "Hôm nay có rất nhiều chuyện thú vị muốn kể với bố/mẹ... Con đã học được điều mới, có thêm bạn mới và cũng gặp một vài khó khăn nhỏ.\n\nCon muốn bố/mẹ ở bên để chia sẻ cùng con!",
  },
  {
    id: "congrats",
    name: "Thư chúc mừng",
    description: "Gửi lời chúc mừng đến người thân yêu",
    emoji: "🎁",
    theme: "pink",
    starterText:
      "Chúc mừng bố/mẹ vì những thành công tuyệt vời! Con tự hào về bố/mẹ rất nhiều.\n\nChúc bố/mẹ luôn thật hạnh phúc và thành công hơn nữa!",
  },
  {
    id: "free",
    name: "Thư tự do",
    description: "Tự viết theo cảm xúc của bạn",
    emoji: "🖊️",
    theme: "violet",
    starterText: "Đây là bức thư con muốn viết điều gì đó từ trái tim mình...\nGửi đến bố/mẹ, thầy cô, bạn bè hoặc bất kỳ ai con yêu quý!",
  },
];

/** `png` holds the same palette as plain hex, for drawing the exported image on a
 *  canvas — the Tailwind classes above resolve to `oklch()` at runtime, which the
 *  canvas API and every screenshot library choke on (see lib/letterImage.ts) */
export const LETTER_THEMES: Record<
  LetterTheme,
  {
    bg: string;
    tape: string;
    accent: string;
    ring: string;
    dot: string;
    signOff: string;
    /** plain hex, not Tailwind classes: the grid paper is painted through inline styles
     *  and onto a canvas for the export, and both choke on the oklch() Tailwind v4 emits */
    paper: { tint: string; grid: string; margin: string };
    png: { from: string; to: string; tape: string; accent: string; ring: string };
  }
> = {
  blue: {
    bg: "from-blue-50 via-white to-sky-50",
    tape: "bg-blue-200",
    accent: "text-blue-500",
    ring: "ring-blue-200",
    dot: "bg-blue-400",
    paper: { tint: "#f8fbff", grid: "#dbeafe", margin: "#93c5fd" },
    signOff: "Yêu thương,\nCon của bố/mẹ",
    png: { from: "#eff6ff", to: "#f0f9ff", tape: "#bfdbfe", accent: "#3b82f6", ring: "#bfdbfe" },
  },
  green: {
    bg: "from-emerald-50 via-white to-green-50",
    tape: "bg-emerald-200",
    accent: "text-emerald-600",
    ring: "ring-emerald-200",
    dot: "bg-emerald-400",
    paper: { tint: "#f7fdfa", grid: "#d1fae5", margin: "#6ee7b7" },
    signOff: "Yêu thương,\nCon của bố/mẹ",
    png: { from: "#ecfdf5", to: "#f0fdf4", tape: "#a7f3d0", accent: "#059669", ring: "#a7f3d0" },
  },
  amber: {
    bg: "from-amber-50 via-white to-orange-50",
    tape: "bg-amber-200",
    accent: "text-amber-600",
    ring: "ring-amber-200",
    dot: "bg-amber-400",
    paper: { tint: "#fffdf6", grid: "#fef3c7", margin: "#fcd34d" },
    signOff: "Yêu thương,\nCon của bố/mẹ",
    png: { from: "#fffbeb", to: "#fff7ed", tape: "#fde68a", accent: "#d97706", ring: "#fde68a" },
  },
  pink: {
    bg: "from-rose-50 via-white to-pink-50",
    tape: "bg-rose-200",
    accent: "text-rose-500",
    ring: "ring-rose-200",
    dot: "bg-rose-400",
    paper: { tint: "#fff9fb", grid: "#fce7f3", margin: "#f9a8d4" },
    signOff: "Yêu thương,\nCon của bố/mẹ",
    png: { from: "#fff1f2", to: "#fdf2f8", tape: "#fecdd3", accent: "#f43f5e", ring: "#fecdd3" },
  },
  violet: {
    bg: "from-violet-50 via-white to-purple-50",
    tape: "bg-violet-200",
    accent: "text-violet-600",
    ring: "ring-violet-200",
    dot: "bg-violet-400",
    paper: { tint: "#fbfaff", grid: "#ede9fe", margin: "#c4b5fd" },
    signOff: "Yêu thương,",
    png: { from: "#f5f3ff", to: "#faf5ff", tape: "#ddd6fe", accent: "#7c3aed", ring: "#ddd6fe" },
  },
};

export const STICKER_OPTIONS = ["❤️", "⭐", "☁️", "🌸", "🎀", "🌿", "😊", "✉️"];

export const STICKER_SLOT_CLASS = [
  "bottom-3 right-4 rotate-6",
  "bottom-3 left-4 -rotate-6",
  "top-3 right-4 rotate-12",
  "top-3 left-4 -rotate-12",
];

export const RECIPIENT_OPTIONS = ["Bố", "Mẹ", "Thầy/Cô", "Bạn bè"];
