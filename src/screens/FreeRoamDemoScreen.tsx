import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowDown, ArrowUp, ArrowLeft as ArrowLeftIcon, ArrowRight, MessageCircleMore } from "lucide-react";
import { useGame } from "../state/gameContext";
import { CharacterPortrait } from "../components/illustrations/CharacterPortrait";
import { getCharacterKey } from "../data/assetMap";
import { SceneIllustration } from "../components/illustrations/SceneIllustration";
import { getAllSituations } from "../data/content";
import { SpeechBubble } from "../components/ui/SpeechBubble";
import { NarrationBox } from "../components/ui/NarrationBox";
import { Button } from "../components/ui/Button";
import { STYLE_META, type ResponseStyle } from "../types";

// Tech-demo scene for the free-roam exploration system described in GDD.md.
// Hands off to the existing dialogue system for the payoff once the player triggers
// it — see GDD.md section 3.5. Which situation plays is picked at random each time
// this screen mounts (restricted to ones set in a classroom, since the walkable
// area here is laid out as one) so replaying the demo doesn't always show the same beat.
function pickRandomClassroomSituation() {
  const pool = getAllSituations("student").filter((s) => s.location.startsWith("Lớp học"));
  return pool[Math.floor(Math.random() * pool.length)];
}

const AMBIENT_POOL = [
  "🔔 Chuông reo báo hiệu tiết học đầu tiên bắt đầu.",
  "📱 Điện thoại trong túi bạn khẽ rung.",
  "💬 Hùng: Ê, thầy Minh hôm nay đứng ngay cửa lớp đấy!",
  "😄 Vài bạn phía sau đang cười đùa nho nhỏ.",
  "📚 Có bạn đang lục cặp tìm sách giáo khoa.",
  "🖊️ Tiếng bút rơi xuống sàn ở dãy bàn bên cạnh.",
  "🌬️ Gió thổi nhẹ qua khung cửa sổ lớp học.",
  "👀 Thầy Minh đưa mắt nhìn quanh lớp.",
  "📢 Loa phát thanh trường vọng lại bản tin buổi sáng.",
  "🚶 Một bạn vội vã chạy vào lớp trước khi thầy điểm danh.",
  "✏️ Bạn cùng bàn gõ nhẹ bút xuống bàn, chờ tiết học bắt đầu.",
  "🎒 Có bạn đang xếp lại sách vở trong cặp.",
  "🪟 Ánh nắng sớm chiếu qua khung cửa sổ.",
  "🕰️ Kim đồng hồ lớp học nhích dần đến giờ vào tiết.",
  "🧹 Bạn trực nhật hôm nay đang lau lại bảng lần cuối.",
];

const UNLOCK_EVENT_COUNT = 12;
const MOVE_SPEED = 0.6;
const INTERACT_RADIUS = 13;

const STYLE_ICON_LABEL: Record<ResponseStyle, string> = { A: "1", B: "2", C: "3", D: "4" };

type Phase = "explore" | "dialogue" | "outcome" | "done";

export function FreeRoamDemoScreen() {
  const { dispatch } = useGame();
  const [situation] = useState(pickRandomClassroomSituation);

  const [playerPos, setPlayerPos] = useState({ x: 30, y: 78 });
  const [facingLeft, setFacingLeft] = useState(false);
  const [npcPos, setNpcPos] = useState({ x: 62, y: 38 });

  const [events, setEvents] = useState<{ id: number; text: string }[]>([]);
  const [eventCount, setEventCount] = useState(0);
  const eventIdRef = useRef(0);
  const shownRef = useRef<Set<number>>(new Set());

  const keysRef = useRef<Record<string, boolean>>({});
  const touchDirRef = useRef({ x: 0, y: 0 });

  const [phase, setPhase] = useState<Phase>("explore");
  const [beatIndex, setBeatIndex] = useState(0);
  const [outcome, setOutcome] = useState<ResponseStyle | null>(null);

  const beats = situation.beats ?? [];
  const unlocked = eventCount >= UNLOCK_EVENT_COUNT;
  const dist = Math.hypot(npcPos.x - playerPos.x, npcPos.y - playerPos.y);
  const canInteract = unlocked && dist < INTERACT_RADIUS;

  // player movement loop — keyboard + touch d-pad, both feed the same velocity vector.
  // uses setInterval rather than requestAnimationFrame: rAF is tied to actual paint
  // compositing, which some embedded/inactive-tab contexts suspend entirely, silently
  // freezing movement; a fixed-tick interval keeps this reliable everywhere.
  useEffect(() => {
    if (phase !== "explore") return;
    const TICK_MS = 16;
    const id = setInterval(() => {
      setPlayerPos((p) => {
        let vx = 0,
          vy = 0;
        if (keysRef.current["ArrowUp"] || keysRef.current["w"]) vy -= 1;
        if (keysRef.current["ArrowDown"] || keysRef.current["s"]) vy += 1;
        if (keysRef.current["ArrowLeft"] || keysRef.current["a"]) vx -= 1;
        if (keysRef.current["ArrowRight"] || keysRef.current["d"]) vx += 1;
        vx += touchDirRef.current.x;
        vy += touchDirRef.current.y;
        if (vx === 0 && vy === 0) return p;
        const len = Math.hypot(vx, vy) || 1;
        vx = (vx / len) * MOVE_SPEED;
        vy = (vy / len) * MOVE_SPEED;
        if (vx < -0.01) setFacingLeft(true);
        else if (vx > 0.01) setFacingLeft(false);
        return { x: Math.min(92, Math.max(4, p.x + vx)), y: Math.min(88, Math.max(24, p.y + vy)) };
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    function onDown(e: KeyboardEvent) {
      keysRef.current[e.key] = true;
    }
    function onUp(e: KeyboardEvent) {
      keysRef.current[e.key] = false;
    }
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  // NPC wander AI — picks a new nearby point every few seconds, CSS transition animates the move
  useEffect(() => {
    if (phase !== "explore") return;
    const id = setInterval(
      () => {
        setNpcPos({ x: 52 + Math.random() * 28, y: 26 + Math.random() * 22 });
      },
      2600 + Math.random() * 1600,
    );
    return () => clearInterval(id);
  }, [phase]);

  // ambient event feed — "at least 15 gameplay events before a choice" rule from the brief,
  // relaxed slightly for a short demo session (12) so it stays testable/playable
  useEffect(() => {
    if (phase !== "explore" || unlocked) return;
    const t = setTimeout(
      () => {
        let idx = Math.floor(Math.random() * AMBIENT_POOL.length);
        if (shownRef.current.size < AMBIENT_POOL.length) {
          while (shownRef.current.has(idx)) idx = Math.floor(Math.random() * AMBIENT_POOL.length);
        }
        shownRef.current.add(idx);
        const id = eventIdRef.current++;
        setEvents((evs) => [...evs.slice(-2), { id, text: AMBIENT_POOL[idx] }]);
        setEventCount((c) => c + 1);
        setTimeout(() => setEvents((evs) => evs.filter((e) => e.id !== id)), 2600);
      },
      1300 + Math.random() * 1100,
    );
    return () => clearTimeout(t);
  }, [eventCount, phase, unlocked]);

  function setTouchDir(x: number, y: number) {
    touchDirRef.current = { x, y };
  }

  function handleInteract() {
    if (!canInteract) return;
    setPhase("dialogue");
  }

  function handlePick(style: ResponseStyle) {
    setOutcome(style);
    setPhase("outcome");
  }

  return (
    <div className="relative min-h-screen bg-slate-900 overflow-hidden select-none">
      <SceneIllustration
        location={situation.location}
        context={situation.context}
        time={situation.time}
        seed={situation.id}
        className="absolute inset-0 h-full w-full"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/10" />

      <div className="relative flex items-center justify-between p-4">
        <button
          onClick={() => dispatch({ type: "GO_TO", screen: "explore" })}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-md text-slate-500 active:scale-90 transition"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="rounded-full bg-white/90 backdrop-blur px-3 py-1.5 shadow-md text-[11px] font-bold text-slate-600">
          🧪 Demo free-roam — {Math.min(eventCount, UNLOCK_EVENT_COUNT)}/{UNLOCK_EVENT_COUNT} sự kiện
        </div>
      </div>

      {phase === "explore" && (
        <>
          {/* ambient event toasts */}
          <div className="absolute top-16 left-0 right-0 flex flex-col items-center gap-1.5 px-4 pointer-events-none">
            {events.map((e) => (
              <p key={e.id} className="animate-pop rounded-full bg-black/50 backdrop-blur px-3 py-1 text-[11px] font-medium text-white/95 text-center">
                {e.text}
              </p>
            ))}
          </div>

          {/* NPC */}
          <div
            className="absolute transition-all duration-[1400ms] ease-in-out"
            style={{ left: `${npcPos.x}%`, top: `${npcPos.y}%`, transform: "translate(-50%, -100%)" }}
          >
            <div className="relative flex flex-col items-center">
              {canInteract && (
                <button
                  onClick={handleInteract}
                  className="animate-pop mb-1 flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1.5 text-[11px] font-extrabold text-amber-900 shadow-lg active:scale-95"
                >
                  <MessageCircleMore size={13} /> Chạm để nói chuyện
                </button>
              )}
              <CharacterPortrait charKey={getCharacterKey(situation.npcName)} mood="idle" className="h-24 w-16 drop-shadow-xl animate-char-bob" />
            </div>
          </div>

          {/* player */}
          <div
            className="absolute transition-[left,top] duration-100 ease-linear"
            style={{ left: `${playerPos.x}%`, top: `${playerPos.y}%`, transform: "translate(-50%, -100%)" }}
          >
            <CharacterPortrait
              charKey="student_boy"
              mood="idle"
              className={`h-24 w-16 drop-shadow-xl animate-char-bob ${facingLeft ? "-scale-x-100" : ""}`}
            />
          </div>

          {/* touch d-pad */}
          <div className="absolute bottom-6 left-6 grid grid-cols-3 grid-rows-3 gap-1 w-32 h-32">
            <span />
            <DpadBtn onDir={() => setTouchDir(0, -1)} onRelease={() => setTouchDir(0, 0)}>
              <ArrowUp size={18} />
            </DpadBtn>
            <span />
            <DpadBtn onDir={() => setTouchDir(-1, 0)} onRelease={() => setTouchDir(0, 0)}>
              <ArrowLeftIcon size={18} />
            </DpadBtn>
            <span />
            <DpadBtn onDir={() => setTouchDir(1, 0)} onRelease={() => setTouchDir(0, 0)}>
              <ArrowRight size={18} />
            </DpadBtn>
            <span />
            <DpadBtn onDir={() => setTouchDir(0, 1)} onRelease={() => setTouchDir(0, 0)}>
              <ArrowDown size={18} />
            </DpadBtn>
            <span />
          </div>

          {!unlocked && (
            <p className="absolute bottom-6 right-6 max-w-[140px] text-right text-[11px] font-medium text-white/80">
              Cứ đi lại quanh lớp — chuyện sẽ tự xảy ra, chưa cần làm gì cả.
            </p>
          )}
        </>
      )}

      {phase === "dialogue" && (
        <div className="relative flex min-h-[85vh] w-full flex-col items-center justify-end px-4 pb-8">
          {beatIndex < beats.length ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => setBeatIndex((i) => i + 1)}
              className="flex w-full flex-col items-center"
            >
              <div className="w-full max-w-md">
                {beats[beatIndex].speaker ? (
                  <SpeechBubble speaker={beats[beatIndex].speaker} text={beats[beatIndex].text} />
                ) : (
                  <NarrationBox text={beats[beatIndex].text} />
                )}
              </div>
              <p className="mt-3 text-[11px] font-semibold text-white/80">Chạm để tiếp tục</p>
            </div>
          ) : (
            <>
              <div className="w-full max-w-md mb-4">
                <SpeechBubble speaker={situation.npcName} text={situation.dialogue} />
              </div>
              <div className="w-full max-w-md space-y-2.5 rounded-3xl bg-white/95 backdrop-blur p-4 shadow-xl">
                {situation.options.map((opt) => {
                  const meta = STYLE_META[opt.id];
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handlePick(opt.id)}
                      className={`w-full flex items-center gap-3 rounded-2xl border-2 border-transparent bg-slate-50 p-3 text-left active:scale-[0.98] transition`}
                    >
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white ${meta.bg} ${meta.color}`}>
                        {STYLE_ICON_LABEL[opt.id]}
                      </span>
                      <span className={`flex-1 text-sm font-bold ${meta.color}`}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {phase === "outcome" && outcome && (
        <div className="relative flex min-h-[85vh] w-full flex-col items-center justify-center px-6 text-center">
          <div className="w-full max-w-md rounded-3xl bg-white/95 backdrop-blur p-6 shadow-xl animate-pop">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-400 mb-2">Demo kết thúc</p>
            <p className="text-sm text-slate-700 leading-relaxed mb-4">
              Bạn vừa trải nghiệm một cảnh với di chuyển tự do, NPC tự hành động, và{" "}
              {Math.min(eventCount, UNLOCK_EVENT_COUNT)} sự kiện nền trước khi lựa chọn hiện ra — thay vì hỏi ngay từ đầu.
            </p>
            <div className="rounded-2xl bg-blue-50 p-4 text-left mb-5">
              <p className="text-xs font-bold text-blue-500 mb-1">Nếu làm cho toàn bộ 36 tình huống:</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mỗi cảnh cần vùng chơi, pool sự kiện và NPC AI riêng — xem bảng đối chiếu trong GDD.md.
              </p>
            </div>
            <Button fullWidth onClick={() => dispatch({ type: "GO_TO", screen: "explore" })}>
              Quay lại Khám phá
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function DpadBtn({ onDir, onRelease, children }: { onDir: () => void; onRelease: () => void; children: ReactNode }) {
  return (
    <button
      onPointerDown={(e) => {
        e.preventDefault();
        onDir();
      }}
      onPointerUp={onRelease}
      onPointerLeave={onRelease}
      onPointerCancel={onRelease}
      className="flex items-center justify-center rounded-xl bg-white/80 backdrop-blur text-slate-700 shadow-md active:bg-white active:scale-95 transition"
    >
      {children}
    </button>
  );
}
