import { useState } from "react";
import { renderLetterToBlob } from "../lib/letterImage";
import { ArrowLeft, Check, ImageDown, Link2, Palette, Send, Sparkles } from "lucide-react";
import { useGame } from "../state/gameContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { LetterCard } from "../components/ui/LetterCard";
import { CloudField, HillField, SparkleField } from "../components/illustrations/AmbientBackdrop";
import { LETTER_THEMES, STICKER_OPTIONS, RECIPIENT_OPTIONS } from "../data/letterTemplates";
import { encodeLetter, buildLetterLink, newLetterId } from "../state/letterCode";
import { addSentLetter } from "../state/storage";
import type { Letter, LetterTheme } from "../types";

const THEME_KEYS = Object.keys(LETTER_THEMES) as LetterTheme[];

export function LetterWriteScreen() {
  const { dispatch, role } = useGame();
  // no templates any more: a pre-filled letter is the writer's words, not the player's,
  // and most people just tweak whatever is already in the box. Starting blank is the
  // point — the letter is supposed to be the one thing they say for themselves.
  const [theme, setTheme] = useState<LetterTheme>("blue");
  const [toWhom, setToWhom] = useState<string>(RECIPIENT_OPTIONS[0]);
  const [customName, setCustomName] = useState("");
  const [message, setMessage] = useState("");
  const [stickers, setStickers] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  // object URL of the rendered letter image, shown full-size so the player can save it
  // with their browser's own "save image" gesture — see handleExportImage
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const recipientLabel = toWhom === "Tự điền tên" ? customName.trim() : toWhom;
  const canSend = message.trim().length > 0 && recipientLabel.length > 0;
  const signOff = LETTER_THEMES[theme].signOff;
  const dateLabel = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  function toggleSticker(s: string) {
    setStickers((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : prev.length >= 4 ? prev : [...prev, s]));
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
      stickers,
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
        stickers,
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
        <button
          onClick={() => dispatch(role ? { type: "GO_TO", screen: "evaluation" } : { type: "GO_HOME" })}
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md text-slate-500 active:scale-90 transition"
        >
          <ArrowLeft size={18} />
        </button>

        {(
          <div className="mx-auto max-w-md">
            <div className="text-center mb-5">
              <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-lg ring-4 ring-blue-100">
                💌
              </span>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-slate-800">Viết thư</h2>
              <p className="text-xs text-slate-400 mt-1">Trang giấy để trắng — viết điều bạn thật sự muốn nói</p>
            </div>

            <Card className="p-4 mb-4">
              <label className="mb-2.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                <Send size={13} className="text-blue-500" /> Gửi cho
              </label>
              <div className="flex flex-wrap gap-2">
                {[...RECIPIENT_OPTIONS, "Tự điền tên"].map((r) => (
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

            <LetterCard theme={theme} toWhom={recipientLabel || undefined} stickers={stickers} signOff={signOff} dateLabel={dateLabel}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={7}
                placeholder="Viết những điều bạn muốn nói..."
                className="w-full resize-none bg-transparent leading-[1.9] outline-none placeholder:text-slate-400"
              />
            </LetterCard>

            <Card className="p-4 mt-4">
              <label className="mb-2.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                <Sparkles size={13} className="text-amber-400" /> Sticker
                <span className="ml-auto font-bold normal-case tracking-normal text-slate-400">{stickers.length}/4</span>
              </label>
              <div className="mb-5 flex flex-wrap gap-2">
                {STICKER_OPTIONS.map((s) => {
                  const on = stickers.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSticker(s)}
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl transition active:scale-90 ${
                        on ? "bg-blue-100 ring-2 ring-blue-400 scale-110 shadow-sm" : "bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

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
