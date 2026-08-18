import { useState } from "react";
import { ArrowLeft, HelpCircle, Music, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useGame } from "../state/gameContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { getSettings, resetAllProgress, resetSeenHints, saveSettings } from "../state/storage";
import { startMusic, stopMusic } from "../lib/music";

export function SettingsScreen() {
  const { dispatch } = useGame();
  const [settings, setSettings] = useState(getSettings());
  const [resetDone, setResetDone] = useState(false);
  const [hintsResetDone, setHintsResetDone] = useState(false);

  function toggleSound() {
    const next = { ...settings, soundOn: !settings.soundOn };
    setSettings(next);
    saveSettings(next);
  }

  function toggleMusic() {
    const on = settings.musicOn !== false;
    const next = { ...settings, musicOn: !on };
    setSettings(next);
    saveSettings(next);
    if (next.musicOn) startMusic();
    else stopMusic();
  }

  function handleReset() {
    resetAllProgress();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 1500);
  }

  function handleResetHints() {
    resetSeenHints();
    setHintsResetDone(true);
    setTimeout(() => setHintsResetDone(false), 1500);
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
        <h2 className="text-2xl font-extrabold text-slate-800 mb-6">Cài đặt</h2>

        <Card className="p-5 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.soundOn ? <Volume2 className="text-blue-500" /> : <VolumeX className="text-slate-400" />}
            <div>
              <p className="font-bold text-slate-800 text-sm">Âm thanh</p>
              <p className="text-xs text-slate-400">Bật/tắt hiệu ứng âm thanh trong game</p>
            </div>
          </div>
          <button
            onClick={toggleSound}
            className={`h-7 w-12 rounded-full transition-colors relative ${settings.soundOn ? "bg-blue-500" : "bg-slate-200"}`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                settings.soundOn ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </Card>

        <Card className="p-5 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music className={settings.musicOn === false ? "text-slate-400" : "text-violet-500"} />
            <div>
              <p className="font-bold text-slate-800 text-sm">Nhạc nền</p>
              <p className="text-xs text-slate-400">Giai điệu nhẹ không lời, phát trong lúc chơi</p>
            </div>
          </div>
          <button
            onClick={toggleMusic}
            className={`h-7 w-12 rounded-full transition-colors relative ${settings.musicOn === false ? "bg-slate-200" : "bg-violet-500"}`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                settings.musicOn === false ? "translate-x-1" : "translate-x-6"
              }`}
            />
          </button>
        </Card>

        <Card className="p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <HelpCircle className="text-blue-500" />
            <div>
              <p className="font-bold text-slate-800 text-sm">Xem lại hướng dẫn</p>
              <p className="text-xs text-slate-400">
                Các mẹo chỉ dẫn (chạm vào đâu để làm gì) chỉ hiện 1 lần rồi thôi — bấm đây để chúng hiện lại từ đầu.
              </p>
            </div>
          </div>
          <Button variant="secondary" fullWidth onClick={handleResetHints}>
            {hintsResetDone ? "Đã bật lại hướng dẫn!" : "Xem lại hướng dẫn"}
          </Button>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <RotateCcw className="text-rose-500" />
            <div>
              <p className="font-bold text-slate-800 text-sm">Đặt lại tiến trình</p>
              <p className="text-xs text-slate-400">Xoá lịch sử chơi và thư đã gửi trên máy này</p>
            </div>
          </div>
          <Button variant="secondary" fullWidth onClick={handleReset}>
            {resetDone ? "Đã đặt lại!" : "Đặt lại"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
