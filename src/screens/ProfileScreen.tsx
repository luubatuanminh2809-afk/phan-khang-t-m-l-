import { useState } from "react";
import { ArrowLeft, LogIn, Play, RotateCcw, UserRound } from "lucide-react";
import { useGame } from "../state/gameContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { CloudField, SparkleField } from "../components/illustrations/AmbientBackdrop";
import { getProfile, saveProfile, getSavedRun, clearSavedRun } from "../state/storage";
import { CharacterPortrait } from "../components/illustrations/CharacterPortrait";
import { PLAYER_CHARACTER_BY_GENDER } from "../data/assetMap";
import { DAYS_PER_WEEK, type PlayerGender } from "../types";
import { roleMeta } from "../data/advice";

/**
 * "Đăng nhập" here is a local profile, not an account. The game has no server — it is
 * one offline HTML file — so a run is stored in this browser under whatever name the
 * player types. That is said plainly on screen rather than hidden, because a login box
 * that silently fails to follow you to another device is worse than no login at all.
 */
export function ProfileScreen() {
  const { dispatch } = useGame();
  const [name, setName] = useState(() => getProfile().name === "Người chơi" ? "" : getProfile().name);
  const [gender, setGender] = useState<PlayerGender>("female");
  const saved = getSavedRun();
  const [confirmingNew, setConfirmingNew] = useState(false);

  function startFresh() {
    const clean = name.trim();
    if (!clean) return;
    saveProfile({ name: clean });
    clearSavedRun();
    dispatch({ type: "SET_GENDER", gender });
    dispatch({ type: "GO_TO", screen: "roleSelect" });
  }

  function resume() {
    if (!saved) return;
    saveProfile({ name: saved.playerName });
    dispatch({ type: "RESUME_RUN", role: saved.role, session: saved.session });
  }

  const savedDate = saved
    ? new Date(saved.savedAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
    : "";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-100 via-blue-50 to-white px-5 py-8">
      <SparkleField tone="sky" />
      <CloudField tone="sky" heightVh={30} />

      <div className="relative mx-auto max-w-md">
        <button
          onClick={() => dispatch({ type: "GO_HOME" })}
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md text-slate-500 active:scale-90 transition"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="text-center mb-6">
          <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white text-blue-500 shadow-lg ring-4 ring-blue-100">
            <UserRound size={30} />
          </span>
          <h2 className="text-2xl font-black text-slate-800">Người chơi</h2>
          <p className="text-sm text-slate-400 mt-1">Đặt tên để lần sau chơi tiếp, không phải làm lại từ đầu</p>
        </div>

        {saved && (
          <Card className="p-5 mb-4 ring-2 ring-blue-200">
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-blue-500 mb-1">Lượt chơi đang dở</p>
            <p className="font-bold text-slate-800">{saved.playerName}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Vai {roleMeta[saved.role].title} · Ngày {saved.session.dayIndex + 1}/{DAYS_PER_WEEK} · lưu {savedDate}
            </p>
            <Button fullWidth icon={<Play size={18} />} onClick={resume} className="mt-4">
              Chơi tiếp
            </Button>
          </Card>
        )}

        <Card className="p-5">
          <label className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-slate-500">
            {saved ? "Hoặc bắt đầu lượt mới" : "Tên của bạn"}
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên của bạn..."
            maxLength={24}
            className="w-full rounded-xl border-2 border-slate-100 p-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
          />

          <label className="mt-4 mb-2 block text-xs font-extrabold uppercase tracking-wide text-slate-500">
            Bạn sẽ hoá thân thành
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(["female", "male"] as PlayerGender[]).map((g) => {
              const on = gender === g;
              return (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex flex-col items-center rounded-2xl p-3 transition active:scale-95 ${
                    on ? "bg-blue-50 ring-2 ring-blue-400" : "bg-slate-50 ring-1 ring-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {/* shows the actual sprite they'll play as, so the choice is concrete
                      rather than an abstract label */}
                  <CharacterPortrait
                    charKey={PLAYER_CHARACTER_BY_GENDER[g].student}
                    mood="happy"
                    className="h-20 w-16"
                  />
                  <span className={`mt-1.5 text-sm font-extrabold ${on ? "text-blue-700" : "text-slate-500"}`}>
                    {g === "female" ? "Nữ" : "Nam"}
                  </span>
                </button>
              );
            })}
          </div>

          {saved && !confirmingNew ? (
            <Button
              variant="secondary"
              fullWidth
              icon={<RotateCcw size={18} />}
              disabled={!name.trim()}
              onClick={() => setConfirmingNew(true)}
              className="mt-3"
            >
              Bắt đầu lượt mới
            </Button>
          ) : saved && confirmingNew ? (
            <div className="mt-3">
              <p className="mb-2 text-xs font-semibold text-rose-500">
                Lượt đang dở của {saved.playerName} sẽ bị xoá. Chắc chưa?
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" fullWidth onClick={() => setConfirmingNew(false)}>
                  Thôi
                </Button>
                <Button fullWidth onClick={startFresh}>
                  Xoá &amp; chơi mới
                </Button>
              </div>
            </div>
          ) : (
            <Button fullWidth icon={<LogIn size={18} />} disabled={!name.trim()} onClick={startFresh} className="mt-3">
              Bắt đầu
            </Button>
          )}

          <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
            Tiến trình được lưu ngay trên máy này, không cần mạng và không gửi đi đâu cả. Đổi sang máy khác hoặc
            trình duyệt khác sẽ không thấy lượt chơi này.
          </p>
        </Card>
      </div>
    </div>
  );
}
