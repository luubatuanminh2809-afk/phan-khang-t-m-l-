import { useState } from "react";
import { ArrowLeft, Mail, MailOpen } from "lucide-react";
import { useGame } from "../state/gameContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { LetterCard } from "../components/ui/LetterCard";
import { decodeLetter, extractLetterCode } from "../state/letterCode";
import type { Letter } from "../types";

export function LetterReadScreen() {
  const { dispatch, readLetterCode, openedLetter } = useGame();
  const [error, setError] = useState(false);
  const [letter, setLetter] = useState<Letter | null>(null);

  const shown = openedLetter ?? letter;

  function handleDecode() {
    const result = decodeLetter(extractLetterCode(readLetterCode));
    if (!result) {
      setError(true);
      setLetter(null);
      return;
    }
    setError(false);
    setLetter(result);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-5 py-8">
      <button
        onClick={() => dispatch({ type: "GO_HOME" })}
        className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md text-slate-500 active:scale-90 transition"
      >
        <ArrowLeft size={18} />
      </button>

      <div className="mx-auto max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg">
            {shown ? <MailOpen size={24} /> : <Mail size={24} />}
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">{openedLetter ? "Bạn có một lá thư" : "Đọc thư"}</h2>
          {!openedLetter && <p className="text-sm text-slate-400 mt-1">Dán link hoặc mã mà người thân/học trò của bạn đã gửi</p>}
        </div>

        {!openedLetter && (
          <Card className="p-5">
            <textarea
              value={readLetterCode}
              onChange={(e) => dispatch({ type: "SET_READ_LETTER_CODE", code: e.target.value })}
              rows={3}
              placeholder="Dán link hoặc mã thư vào đây..."
              className="w-full rounded-2xl border-2 border-slate-100 p-3 text-xs font-mono text-slate-700 outline-none focus:border-blue-300 resize-none"
            />
            {error && <p className="text-xs text-rose-500 mt-2">Link/mã không hợp lệ, hãy kiểm tra lại.</p>}
            <div className="mt-4">
              <Button fullWidth disabled={!readLetterCode.trim()} onClick={handleDecode}>
                Mở thư
              </Button>
            </div>
          </Card>
        )}

        {shown && (
          <div className="mt-4 animate-pop">
            <LetterCard
              theme={shown.theme}
              toWhom={shown.toWhom}
              stickers={shown.stickers}
              signOff={shown.signOff}
              dateLabel={
                Number.isNaN(new Date(shown.createdAt).getTime())
                  ? undefined
                  : new Date(shown.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
              }
            >
              <p className="whitespace-pre-wrap">{shown.message}</p>
            </LetterCard>
          </div>
        )}
      </div>
    </div>
  );
}
