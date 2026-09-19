import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { renderLetterToBlob } from "../lib/letterImage";
import { ArrowLeft, Check, ImageDown, Link2, Minus, PenLine, Plus, RotateCw, Trash2, Palette, Send, Sparkles } from "lucide-react";
import { useGame } from "../state/gameContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { LetterCard } from "../components/ui/LetterCard";
import { CloudField, HillField, SparkleField } from "../components/illustrations/AmbientBackdrop";
import { LETTER_THEMES, STICKER_OPTIONS, recipientOptionsFor } from "../data/letterTemplates";
import { encodeLetter, buildLetterLink, newLetterId } from "../state/letterCode";
import { addSentLetter, getProfile } from "../state/storage";
import type { Letter, LetterTheme, PlacedSticker } from "../types";

const THEME_KEYS = Object.keys(LETTER_THEMES) as LetterTheme[];
const MAX_STICKERS = 8;
// where a freshly tapped sticker lands before the player drags it: around the edges of the
// paper, clear of the writing, and never twice in the same place
const DROP_SPOTS = [
  { x: 0.84, y: 0.16, rotate: 10 },
  { x: 0.16, y: 0.18, rotate: -10 },
  { x: 0.86, y: 0.82, rotate: -8 },
  { x: 0.18, y: 0.84, rotate: 8 },
  { x: 0.5, y: 0.12, rotate: -4 },
  { x: 0.5, y: 0.88, rotate: 6 },
  { x: 0.9, y: 0.5, rotate: 12 },
  { x: 0.12, y: 0.5, rotate: -12 },
];

export function LetterWriteScreen() {
  const { dispatch, role, letterReturn } = useGame();
  const recipientOptions = recipientOptionsFor(role);
  // no templates any more: a pre-filled letter is the writer's words, not the player's,
  // and most people just tweak whatever is already in the box. Starting blank is the
  // point — the letter is supposed to be the one thing they say for themselves.
  const [theme, setTheme] = useState<LetterTheme>("blue");
  const [toWhom, setToWhom] = useState<string>(recipientOptions[0]);
  const [customName, setCustomName] = useState("");
  const [message, setMessage] = useState("");
  // The letter used to sign itself — "Con của bố/mẹ" under every one, whoever was writing
  // and whoever it was for. It is their letter, so the name at the bottom is theirs to
  // type: their own, a nickname, or nothing at all.
  const [signature, setSignature] = useState(() => getProfile().name ?? "");
  const [placed, setPlaced] = useState<PlacedSticker[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  // object URL of the rendered letter image, shown full-size so the player can save it
  // with their browser's own "save image" gesture — see handleExportImage
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const recipientLabel = toWhom === "Tự điền tên" ? customName.trim() : toWhom;
  const canSend = message.trim().length > 0 && recipientLabel.length > 0;
  const signOff = signature.trim() ? `${LETTER_THEMES[theme].signOff}\n${signature.trim()}` : LETTER_THEMES[theme].signOff;
  const dateLabel = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  /** drops a new sticker somewhere free-ish, then lets the player drag it wherever */
  function addSticker(emoji: string) {
    if (placed.length >= MAX_STICKERS) return;
    const spot = DROP_SPOTS[placed.length % DROP_SPOTS.length];
    setPlaced((prev) => [...prev, { emoji, x: spot.x, y: spot.y, rotate: spot.rotate, scale: 1 }]);
    setSelected(placed.length);
  }

  function updateSelected(change: Partial<PlacedSticker>) {
    if (selected === null) return;
    setPlaced((prev) => prev.map((s, i) => (i === selected ? { ...s, ...change } : s)));
  }

  function removeSelected() {
    if (selected === null) return;
    setPlaced((prev) => prev.filter((_, i) => i !== selected));
    setSelected(null);
  }

  // dragging: the sticker follows the pointer within the paper, in fractions of the card so
  // the layout survives a different screen and the exported image
  function handleStickerDown(index: number, event: ReactPointerEvent<HTMLSpanElement>) {
    event.preventDefault();
    event.stopPropagation();
    setSelected(index);
    const card = cardRef.current;
    if (!card) return;
    const pointerId = event.pointerId;
    const move = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const rect = card.getBoundingClientRect();
      const x = Math.min(0.97, Math.max(0.03, (e.clientX - rect.left) / rect.width));
      const y = Math.min(0.97, Math.max(0.03, (e.clientY - rect.top) / rect.height));
      setPlaced((prev) => prev.map((s, i) => (i === index ? { ...s, x, y } : s)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }

  function buildLetter(): Letter {
    return {
      id: newLetterId(),
      // templates are gone; kept on the type for letters saved by older builds
      templateId: "free",
      theme,
      toWhom: recipientLabel,
      message: message.trim(),
      signOff,
      stickers: placed.map((s) => s.emoji),
      placed,
      createdAt: new Date().toISOString(),
    };
  }

  async function handleExportImage() {
    if (exporting || !canSend) return;
    setExporting(true);
    try {
      const blob = await renderLetterToBlob({
        theme,
        toWhom: recipientLabel || undefined,
        message,
        signOff,
        dateLabel,
        placed,
      });
      addSentLetter(buildLetter());
      setExporting(false);
      if (!blob) return;
      const file = new File([blob], "moralyn-thu.png", { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "Một lá thư từ Moralyn" });
          return;
        } catch {
          // user cancelled the share sheet — fall through to the preview below
        }
      }
      // no programmatic download here on purpose: a scripted save is inert inside a
      // sandboxed viewer anyway, and declaring the capability that would enable it
      // makes the whole page unshareable. Showing the finished image instead lets the
      // player save it the ordinary way (long-press on mobile, right-click on desktop).
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("[export] không tạo được ảnh thư:", err);
      setExporting(false);
    }
  }

  async function handleCopyLink() {
    if (!canSend) return;
    const letter = buildLetter();
    addSentLetter(letter);
    const code = encodeLetter(letter);
    try {
      await navigator.clipboard.writeText(buildLetterLink(code));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — the image export still works
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-100 via-blue-50 to-white px-5 py-8">
      <SparkleField tone="sky" />
      <CloudField tone="sky" heightVh={28} />
      <HillField />

      <div className="relative">
        {/* opened from the pause menu mid-run, the way back is to the game, not to an
            evaluation that has not happened yet */}
        <button
          onClick={() =>
            dispatch(letterReturn ? { type: "CLOSE_LETTER" } : role ? { type: "GO_TO", screen: "evaluation" } : { type: "GO_HOME" })
          }
          className={`mb-6 flex h-10 items-center justify-center gap-1.5 rounded-full bg-white shadow-md text-slate-500 active:scale-90 transition ${
            letterReturn ? "px-4 text-sm font-bold" : "w-10"
          }`}
        >
          <ArrowLeft size={18} />
          {letterReturn && "Quay lại chơi"}
        </button>

        {(
          <div className="mx-auto max-w-md">
            <div className="text-center mb-5">
              <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-lg ring-4 ring-blue-100">
                💌
              </span>
              {/* deliberately not font-serif: that stack reaches Georgia first, which has no
                  glyphs for ư or ạ, so the browser renders a Vietnamese word in two fonts at
                  once and the tone marks break away — "Viết thư" came out as "Viê ́t thư" */}
              <h2 className="text-3xl font-black tracking-tight text-slate-800">Viết thư</h2>
              <p className="text-xs text-slate-400 mt-1">Trang giấy để trắng — viết điều bạn thật sự muốn nói</p>
            </div>

            <Card className="p-4 mb-4">
              <label className="mb-2.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                <Send size={13} className="text-blue-500" /> Gửi cho
              </label>
              <div className="flex flex-wrap gap-2">
                {[...recipientOptions, "Tự điền tên"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setToWhom(r)}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-bold transition active:scale-95 ${
                      toWhom === r ? "bg-blue-500 text-white shadow-md shadow-blue-500/30" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {toWhom === "Tự điền tên" && (
                <input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Nhập tên người nhận..."
                  className="mt-3 w-full rounded-xl border-2 border-slate-100 p-2.5 text-sm text-slate-700 outline-none focus:border-blue-300"
                />
              )}
            </Card>

            <LetterCard
              theme={theme}
              toWhom={recipientLabel || undefined}
              placed={placed}
              selectedSticker={selected}
              onStickerDown={handleStickerDown}
              signOff={signOff}
              dateLabel={dateLabel}
              cardRef={cardRef}
            >
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={7}
                placeholder="Viết những điều bạn muốn nói..."
                className="w-full resize-none bg-transparent leading-[1.9] outline-none placeholder:text-slate-400"
              />
            </LetterCard>

            <Card className="p-4 mt-4">
              <label className="mb-1 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                <PenLine size={13} className="text-blue-500" /> Ký tên
              </label>
              <input
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Tên hoặc biệt danh của bạn..."
                className="mb-5 w-full rounded-xl border-2 border-slate-100 p-2.5 text-sm text-slate-700 outline-none focus:border-blue-300"
              />

              <label className="mb-1 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                <Sparkles size={13} className="text-amber-400" /> Sticker
                <span className="ml-auto font-bold normal-case tracking-normal text-slate-400">
                  {placed.length}/{MAX_STICKERS}
                </span>
              </label>
              <p className="mb-2.5 text-[11px] text-slate-400">Chạm để thêm, rồi kéo sticker trên thư tới chỗ bạn thích.</p>
              <div className="mb-3 flex flex-wrap gap-2">
                {STICKER_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => addSticker(s)}
                    disabled={placed.length >= MAX_STICKERS}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-xl transition hover:bg-slate-100 active:scale-90 disabled:opacity-40"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* the controls act on whichever sticker is selected — the one with the dashed
                  ring on the letter above */}
              {selected !== null && placed[selected] && (
                <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-2.5">
                  <span className="px-1 text-2xl">{placed[selected].emoji}</span>
                  <button
                    onClick={() => updateSelected({ scale: Math.min(2.4, (placed[selected].scale ?? 1) + 0.2) })}
                    aria-label="To hơn"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm active:scale-90"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => updateSelected({ scale: Math.max(0.6, (placed[selected].scale ?? 1) - 0.2) })}
                    aria-label="Nhỏ lại"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm active:scale-90"
                  >
                    <Minus size={16} />
                  </button>
                  <button
                    onClick={() => updateSelected({ rotate: ((placed[selected].rotate ?? 0) + 15) % 360 })}
                    aria-label="Xoay"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm active:scale-90"
                  >
                    <RotateCw size={16} />
                  </button>
                  <button
                    onClick={removeSelected}
                    aria-label="Xoá sticker"
                    className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl bg-white text-rose-500 shadow-sm active:scale-90"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              <label className="mb-2.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                <Palette size={13} className="text-violet-500" /> Màu giấy
              </label>
              <div className="flex gap-3">
                {THEME_KEYS.map((k) => (
                  <button
                    key={k}
                    onClick={() => setTheme(k)}
                    aria-label={`Màu ${k}`}
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${LETTER_THEMES[k].dot} transition active:scale-90 ${
                      theme === k ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "hover:scale-105"
                    }`}
                  >
                    {theme === k && <Check size={15} className="text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </Card>

            <Button fullWidth icon={<ImageDown size={18} />} disabled={!canSend || exporting} onClick={handleExportImage} className="mt-5">
              {exporting ? "Đang tạo ảnh..." : "Xuất ảnh để gửi"}
            </Button>
            <button
              disabled={!canSend}
              onClick={handleCopyLink}
              className="mt-3 w-full flex items-center justify-center gap-1.5 text-sm font-bold text-blue-500 disabled:opacity-40"
            >
              {copied ? <Check size={15} /> : <Link2 size={15} />}
              {copied ? "Đã sao chép link!" : "Hoặc sao chép link chia sẻ"}
            </button>

            {previewUrl && (
              <Card className="mt-5 p-4 text-center animate-pop">
                <p className="text-sm font-extrabold text-slate-800">Thư của bạn đã sẵn sàng! 🎉</p>
                <p className="mt-1 mb-3 text-xs text-slate-400 leading-snug">
                  Nhấn giữ (điện thoại) hoặc chuột phải (máy tính) vào ảnh bên dưới rồi chọn &ldquo;Lưu ảnh&rdquo; để gửi
                  cho người bạn muốn tặng nhé.
                </p>
                <img src={previewUrl} alt="Thư đã tạo" className="mx-auto w-full max-w-[320px] rounded-2xl shadow-md" />
                <button
                  onClick={() => {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }}
                  className="mt-3 text-sm font-bold text-slate-400"
                >
                  Đóng
                </button>
              </Card>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
