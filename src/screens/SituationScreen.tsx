import { useEffect, useRef, useState, type MouseEvent, type ReactNode, type Ref } from "react";
import { ArrowUp, CalendarDays, ChevronRight, Handshake, HandMetal, Lightbulb, Megaphone, MapPin, Pause, Eye, User, VenetianMask } from "lucide-react";
import { useGame } from "../state/gameContext";
import { getSituationsFor } from "../data/content";
import { SceneIllustration } from "../components/illustrations/SceneIllustration";
import { CharacterPortrait, type CharacterMood } from "../components/illustrations/CharacterPortrait";
import { FirstPersonFrame } from "../components/illustrations/FirstPersonFrame";
import { castAlongside, getCharacterKey, playerCharacterKey, type CharacterKey } from "../data/assetMap";
import { ProgressKey } from "../components/ui/ProgressKey";
import { SpeechBubble } from "../components/ui/SpeechBubble";
import { ThoughtBubble } from "../components/ui/ThoughtBubble";
import { NarrationBox } from "../components/ui/NarrationBox";
import { TypewriterText, type TypewriterHandle } from "../components/ui/TypewriterText";
import { ClosenessMeter } from "../components/ui/ClosenessMeter";
import { playTap, playChoice } from "../lib/sfx";
import { getSettings, saveSettings, hasSeenHint, type ViewMode } from "../state/storage";
import { Coachmark } from "../components/ui/Coachmark";
import type { ResponseStyle, SituationOption } from "../types";

// icon + colors per resistance style, matching the reference the user provided —
// shown directly on each option (icon, bold title, colored) plus its style name in
// parentheses underneath, same 4-icon language already used in KeyCipherGame
const OPTION_STYLE: Record<ResponseStyle, { icon: typeof Handshake; iconBg: string; iconColor: string; textColor: string }> = {
  A: { icon: Handshake, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", textColor: "text-emerald-600" },
  B: { icon: VenetianMask, iconBg: "bg-sky-100", iconColor: "text-sky-600", textColor: "text-sky-600" },
  C: { icon: Megaphone, iconBg: "bg-amber-100", iconColor: "text-amber-600", textColor: "text-amber-600" },
  D: { icon: HandMetal, iconBg: "bg-rose-100", iconColor: "text-rose-600", textColor: "text-rose-600" },
};

// how the NPC visibly reacts to the style of answer the player just picked
const STYLE_REACTION: Record<ResponseStyle, CharacterMood> = {
  A: "happy",
  B: "idle",
  C: "angry",
  D: "sad",
};

// small "the world keeps going" flavor line — purely ambient, never affects gameplay
const AMBIENT_DETAILS: Record<"school" | "home", string[]> = {
  school: [
    "🏃 Vài bạn đang chơi đá cầu ngoài sân.",
    "📚 Có bạn đang mượn sách ở góc lớp.",
    "😄 Tiếng cười đùa vọng lại từ hành lang.",
    "🧹 Một bạn trực nhật đang lau bảng.",
    "📢 Loa phát thanh trường vọng lại bản nhạc quen thuộc.",
    "💬 Vài bạn túm tụm bàn tán chuyện gì đó rôm rả.",
    "🚶 Có ai đó vội vã chạy ngang qua cửa lớp.",
  ],
  home: [
    "📺 Tiếng TV vọng ra từ phòng khách.",
    "🍲 Mùi cơm canh thoảng nhẹ từ bếp.",
    "🐶 Tiếng chó sủa vu vơ ngoài sân.",
    "🌱 Có người đang tưới cây ngoài ban công.",
    "🎵 Tiếng nhạc nhẹ phát ra từ phòng bên cạnh.",
    "🍃 Gió thổi khẽ qua khung cửa sổ đang hé mở.",
  ],
};

function pickAmbientDetail(context: "school" | "home") {
  const options = AMBIENT_DETAILS[context];
  return options[Math.floor(Math.random() * options.length)];
}

// shuffled per situation so the "nice-sounding" style isn't always in the same slot —
// otherwise players learn to tap position 1 without reading, which defeats the point
// of a psychological-reactance self-check
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// solo framing (first-person, or any moment with only one person in frame): one
// large centered character, matching the reference the user shared for that case
const CHAR_BOX_SOLO = "absolute left-[44%] -translate-x-1/2 bottom-0 w-[76%] sm:w-[52%] h-[92%] sm:h-[88%]";
// two-shot framing (third-person): player and NPC standing side by side at equal
// size, facing each other — matches the reference the user shared showing both
// people in a conversation on screen together, replacing the earlier small corner cameo
const CHAR_BOX_TWO_SHOT_LEFT = "absolute left-[2%] sm:left-[8%] bottom-0 w-[46%] sm:w-[38%] h-[86%] sm:h-[82%]";
const CHAR_BOX_TWO_SHOT_RIGHT = "absolute right-[2%] sm:right-[8%] bottom-0 w-[46%] sm:w-[38%] h-[86%] sm:h-[82%]";

// One beat of the scene. It's a fixed-height column, not a stack of overlays: the
// bubble (and any coach card or badge, all marked order-first) claims the top band at
// its natural height, and the art gets whatever is left below. Overlaying the bubble
// on the art — which is what this replaced — put it squarely over the character's
// face, and worse, a long line grew the bubble downwards and covered more of the face.
// Here a long line pushes the character down instead of hiding them.
const BEAT_FRAME = "relative flex h-[60vh] flex-col text-left sm:h-[56vh]";
/** stages fill the space the top band leaves them, rather than setting their own height */
const STAGE_FILL = "min-h-0 flex-1";

// a static cutout has no pose of its own, so motion stands in for body language:
// an active, slightly forward "making a point" loop while the NPC is delivering
// their line, vs. a calmer idle bob otherwise — so the character doesn't read as
// a passive mannequin next to lines that are meant to sound firm or urgent
function GroundedCharacter({
  charKey,
  mood,
  reacting,
  boxClass = CHAR_BOX_SOLO,
}: {
  charKey: CharacterKey;
  mood: CharacterMood;
  reacting: boolean;
  boxClass?: string;
}) {
  const baseAnim = mood === "talking" ? "animate-char-talk-emphasis" : "animate-char-bob";
  return (
    <div className={boxClass}>
      <div className="absolute bottom-1 left-1/2 h-2 w-3/5 -translate-x-1/2 rounded-full bg-black/30 blur-sm" />
      <CharacterPortrait
        charKey={charKey}
        mood={mood}
        className={`relative h-full w-full drop-shadow-xl ${baseAnim} ${reacting ? "animate-char-react" : ""}`}
      />
    </div>
  );
}

// gender comes from context rather than a prop: every stage that draws the player
// already threads `role` through two or three layers, and adding a parallel `gender`
// prop to each of them would only re-plumb the same value the provider already holds
function usePlayerKey(role: "student" | "parent" | "teacher"): CharacterKey {
  const { session, gender } = useGame();
  return playerCharacterKey(role, session?.gender ?? gender);
}

// `alongside` is the other person already standing in this frame — pass it so an NPC who
// happens to resolve to that same sprite gets re-cast instead of appearing as their twin
function SceneCharacter({
  name,
  mood,
  reacting,
  boxClass,
  alongside,
}: {
  name: string;
  mood: CharacterMood;
  reacting: boolean;
  boxClass?: string;
  alongside?: CharacterKey;
}) {
  const charKey = alongside ? castAlongside(name, alongside) : getCharacterKey(name);
  return <GroundedCharacter charKey={charKey} mood={mood} reacting={reacting} boxClass={boxClass} />;
}

// during narration (no speaker), show the player's own character standing in the scene
// instead of leaving the beat empty
function PlayerCharacter({ role, boxClass, mood = "idle" }: { role: "student" | "parent" | "teacher"; boxClass?: string; mood?: CharacterMood }) {
  return <GroundedCharacter charKey={usePlayerKey(role)} mood={mood} reacting={false} boxClass={boxClass} />;
}

// in first-person mode you wouldn't see yourself — the caller passes null instead of
// <PlayerCharacter/> for that case (a JSX element is always truthy even if the component
// it describes renders null internally, so the "no character" check has to happen here,
// before the element is created, not inside Stage)
function playerCharacterOrNone(viewMode: ViewMode, role: "student" | "parent" | "teacher") {
  return viewMode === "first" ? null : <PlayerCharacter role={role} />;
}

// the character standing large in the scene — the dialogue box (below, separate)
// carries the actual speech now, so this is just a positioned stage for the art
function Stage({ character, heightClass }: { character: ReactNode | null; heightClass: string }) {
  return <div className={`relative ${heightClass}`}>{character}</div>;
}

// third-person "two-shot": both people in the conversation stand on screen together,
// equal size, facing each other, instead of one dominant character with a small cameo
function TwoShotStage({
  npcName,
  npcMood,
  reacting,
  role,
  heightClass,
  playerMood = "idle",
}: {
  npcName: string;
  npcMood: CharacterMood;
  reacting: boolean;
  role: "student" | "parent" | "teacher";
  heightClass: string;
  playerMood?: CharacterMood;
}) {
  const playerKey = usePlayerKey(role);
  return (
    <div className={`relative ${heightClass}`}>
      <PlayerCharacter role={role} boxClass={CHAR_BOX_TWO_SHOT_LEFT} mood={playerMood} />
      <SceneCharacter
        name={npcName}
        mood={npcMood}
        reacting={reacting}
        boxClass={CHAR_BOX_TWO_SHOT_RIGHT}
        alongside={playerKey}
      />
    </div>
  );
}

// the player has no in-game name to display (role-agnostic across student/parent/
// teacher), so their own line in third-person is simply attributed to "Bạn" (you)
const PLAYER_LABEL = "Bạn";

// floats above the character's head, tap-to-advance. Speech (SpeechBubble), thought
// (ThoughtBubble) and narration (NarrationBox, no speaker) all need to read as visibly
// different things at a glance — spoken words, real inner thoughts, and scene
// description are three different kinds of information here, not variations on one look
function DialogueBox({
  speakerName,
  text,
  current,
  total,
  typingDone,
  nextLabel,
  typewriterRef,
  onTypingDone,
  align = "center",
  variant = "speech",
}: {
  speakerName?: string;
  text: string;
  current?: number;
  total?: number;
  typingDone: boolean;
  nextLabel: string;
  typewriterRef: Ref<TypewriterHandle>;
  onTypingDone: () => void;
  // "right" hovers the bubble over the NPC's head in the third-person two-shot (NPC
  // stands on the right); "left" hovers it over the player's own head (player stands
  // on the left); "center" is the solo/first-person framing
  align?: "center" | "left" | "right";
  // "thought" renders the NPC's real inner thought (ThoughtBubble) instead of
  // something they actually said out loud (SpeechBubble)
  variant?: "speech" | "thought";
}) {
  // sits in the frame's top band (order-first) rather than floating over the art, but
  // keeps the same left/right/centre offsets so it still reads as belonging to whoever
  // is standing underneath it
  const posClass =
    align === "right"
      ? "order-first z-20 mt-1 ml-auto mr-[3%] w-[56%] shrink-0 sm:mr-[6%] sm:w-[220px]"
      : align === "left"
        ? "order-first z-20 mt-1 mr-auto ml-[3%] w-[56%] shrink-0 sm:ml-[6%] sm:w-[220px]"
        : "order-first z-20 mt-1 ml-[44%] w-[68%] shrink-0 -translate-x-1/2 sm:w-[240px]";
  return (
    <div className={posClass}>
      {variant === "thought" ? (
        // a thought cloud carries no name — the shape is what marks it as unspoken
        <ThoughtBubble
          compact
          text={text}
          tailSide={align === "left" ? "right" : "left"}
          ref={typewriterRef}
          onTypingDone={onTypingDone}
        />
      ) : speakerName ? (
        <SpeechBubble
          compact
          speaker={speakerName}
          text={text}
          tailSide={align === "left" ? "right" : "left"}
          ref={typewriterRef}
          onTypingDone={onTypingDone}
        />
      ) : (
        <NarrationBox compact text={text} ref={typewriterRef} onTypingDone={onTypingDone} />
      )}
      <div className="mt-1 flex items-center justify-between rounded-full bg-black/30 backdrop-blur px-2.5 py-0.5">
        <span className="text-[9px] font-medium text-white/80">{total && total > 1 ? `${current}/${total}` : ""}</span>
        <span
          className={`flex items-center gap-1 text-[11px] font-bold text-white transition-opacity duration-300 ${
            typingDone ? "opacity-100" : "opacity-50"
          }`}
        >
          {typingDone ? nextLabel : "Bỏ qua"} <ChevronRight size={12} />
        </span>
      </div>
    </div>
  );
}

// speech (what they'd actually say, in quotes) and action (what they'd do, in italics)
// are shown as distinct lines instead of one blended sentence — most options are pure
// speech, some (student role) pair a line with a separate action; label is the
// pre-split fallback for any option that hasn't been categorized
function OptionContent({ opt, textColor }: { opt: SituationOption; textColor: string }) {
  if (opt.speech) {
    return (
      <>
        <span className={`block text-sm font-bold ${textColor}`}>&ldquo;{opt.speech}&rdquo;</span>
        {opt.action && <span className="block text-xs italic text-slate-500 mt-0.5">{opt.action}</span>}
      </>
    );
  }
  if (opt.action) {
    return <span className={`block text-sm italic font-bold ${textColor}`}>{opt.action}</span>;
  }
  return <span className={`block text-sm font-bold ${textColor}`}>{opt.label}</span>;
}

// the single line to put in the player's own third-person speech bubble — same
// speech-first, action-fallback priority as OptionContent above, just flattened to
// plain text instead of styled JSX
// ONLY the spoken line — never the action description. Falling back to `action` here
// would put narration like "Tỏ thái độ thách thức, tiếp tục dùng tài khoản thật..."
// inside a speech bubble, i.e. the character appears to say their own stage direction
// out loud. An option with nothing to say simply skips the player's line (see
// handleConfirm) rather than faking one.
function optionSpokenText(opt: SituationOption): string | undefined {
  return opt.speech;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

// Material-style expanding ripple on tap, purely visual click feedback
function useRipples() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const idRef = useRef(0);
  function addRipple(e: MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = idRef.current++;
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((r) => r.filter((ripple) => ripple.id !== id)), 600);
  }
  const layer = (
    <>
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current opacity-30 animate-ping-once"
          style={{ left: r.x, top: r.y }}
        />
      ))}
    </>
  );
  return { addRipple, RippleLayer: layer };
}

export function SituationScreen() {
  const { dispatch, role, session } = useGame();
  // passed to every NPC on screen, not just the two-shot: an NPC re-cast to avoid
  // clashing with the player must stay re-cast in the solo shots of the same scene too,
  // or they'd change sex between beats
  const playerKey = playerCharacterKey(role ?? "student", session?.gender);
  const day = role && session ? session.days[session.dayIndex] : undefined;
  const situation =
    role && day ? getSituationsFor(role, session!.gender).find((s) => s.id === day.situationIds[session!.currentIndex]) : undefined;

  const [outcome, setOutcome] = useState<ResponseStyle | null>(null);
  // the player's own chosen line, said out loud first — every pick is a two-way
  // exchange now, not just the NPC's side of it
  const [playerLineText, setPlayerLineText] = useState<string | null>(null);
  // the NPC's spoken answer, right after — completes the exchange
  const [argumentText, setArgumentText] = useState<string | null>(null);
  // C/D picks only: their real inside thought, shown right after — visually distinct
  // from argumentText (ThoughtBubble vs SpeechBubble) so speech and thought never look
  // like the same kind of thing. A/B picks skip both of these entirely and go straight
  // to the next situation — there's nothing to hide there, so nothing to reveal either.
  const [thoughtText, setThoughtText] = useState<string | null>(null);
  // adult roles only: the "what if you'd said it this way" re-enactment that plays
  // after the coaching tip — the same scene, run again with the negotiating line
  const [replay, setReplay] = useState<{ line: string; reaction: string; step: "line" | "reaction" } | null>(null);
  // resets to 0 each time this screen mounts fresh — the screen unmounts and
  // remounts on every situation->situation transition, so no extra reset effect
  // is needed when moving to the next situation.
  const [beatIndex, setBeatIndex] = useState(0);
  const [ambientDetail] = useState(() => pickAmbientDetail(situation?.context ?? "school"));
  const [viewMode, setViewMode] = useState<ViewMode>(() => getSettings().viewMode);

  function toggleViewMode() {
    const next: ViewMode = viewMode === "third" ? "first" : "third";
    setViewMode(next);
    saveSettings({ ...getSettings(), viewMode: next });
  }

  const [beatTypingDone, setBeatTypingDone] = useState(false);
  const [playerLineTypingDone, setPlayerLineTypingDone] = useState(false);
  const [argumentTypingDone, setArgumentTypingDone] = useState(false);
  const [thoughtTypingDone, setThoughtTypingDone] = useState(false);
  const [replayTypingDone, setReplayTypingDone] = useState(false);
  const [dialogueTypingDone, setDialogueTypingDone] = useState(false);
  const beatRef = useRef<TypewriterHandle>(null);
  const playerLineRef = useRef<TypewriterHandle>(null);
  const argumentRef = useRef<TypewriterHandle>(null);
  const thoughtRef = useRef<TypewriterHandle>(null);
  const replayRef = useRef<TypewriterHandle>(null);
  const dialogueRef = useRef<TypewriterHandle>(null);

  const dialogueBoxRef = useRef<HTMLDivElement>(null);
  const optionsPanelRef = useRef<HTMLDivElement>(null);
  const viewToggleRef = useRef<HTMLButtonElement>(null);
  // bumped whenever a coach-mark dismisses, purely to force a re-render — hasSeenHint()
  // reads localStorage directly, which React has no reactive way of knowing changed
  const [, forceHintRecheck] = useState(0);

  const optionRipples = useRipples();
  const [shuffledOptions] = useState(() => shuffle(situation?.options ?? []));

  // Space bar speeds up typing (skips straight to the full line), matching the
  // classic RPG-dialogue convention — whichever box is currently on screen gets it
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      e.preventDefault();
      playerLineRef.current?.skip();
      argumentRef.current?.skip();
      thoughtRef.current?.skip();
      beatRef.current?.skip();
      dialogueRef.current?.skip();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!role || !session || !day || !situation) return null;

  const beats = situation.beats ?? [];
  const inBeats = beatIndex < beats.length;
  const currentBeat = beats[beatIndex];

  // at most one coach-mark on screen at a time — first eligible, not-yet-seen hint wins.
  // each is scoped to the moment it's actually useful (e.g. the options hint waits until
  // the options are actually tappable), and tapping the highlighted element itself also
  // dismisses it (see Coachmark), so this naturally paces one hint per beat instead of
  // dumping the whole tutorial on the very first situation.
  const inMainDialogue = !inBeats && !outcome && !playerLineText && !argumentText && !thoughtText;
  // C and D are the openly defiant picks: those cut to third-person and end on the
  // NPC's hidden thought. A and B play out the same exchange, but in first person and
  // without a reveal — there is nothing being hidden to look behind.
  const defiant = outcome === "C" || outcome === "D";
  // playing a grown-up: the reveal is not "what were they hiding" but "what could you
  // have said", and the relationship itself is on screen as a meter
  const isAdultRole = role === "parent" || role === "teacher";
  // their retort has finished typing: the eye in the header turns into the way to look
  // past the anger, and an arrow points up at it
  const revealPending = defiant && !!argumentText && argumentTypingDone;
  const hintCandidates = [
    { id: "situation-dialogue-tap", ref: dialogueBoxRef, text: "Chạm vào lời thoại để đọc tiếp — chạm lần nữa để bỏ qua hiệu ứng gõ chữ.", active: inMainDialogue },
    {
      id: "situation-options",
      ref: optionsPanelRef,
      text: "Đọc kỹ rồi chọn phản ứng giống bạn nhất ngoài đời thật — không có đáp án đúng hay sai.",
      active: inMainDialogue && dialogueTypingDone,
    },
    { id: "situation-view-toggle", ref: viewToggleRef, text: "Bấm vào đây để đổi góc nhìn thứ nhất / thứ ba.", active: inMainDialogue },
  ];
  const activeHint = hintCandidates.find((h) => h.active && !hasSeenHint(h.id));

  function handlePick(style: ResponseStyle) {
    playChoice();
    setOutcome(style);
    // the rule text on screen doesn't change yet — just her face reacting and the
    // other 3 options disappearing, leaving only the picked one. Still first-person
    // here regardless of style — tapping that lone option (handleConfirm) is what
    // actually moves things forward, and that's the moment the two paths diverge.
  }

  function handleConfirm() {
    if (!outcome) return;
    playTap();
    // every pick now plays out as a real exchange — you say your line, they answer.
    // What differs is the framing: a defiant pick cuts to third-person so you watch
    // the argument from outside, while a cooperative one stays in your own eyes.
    if (defiant) setViewMode("third");
    const chosen = situation!.options.find((o) => o.id === outcome);
    const spoken = optionSpokenText(chosen!);
    if (!spoken) {
      // this option is a silent act with no line to deliver — skip straight to their
      // reaction rather than inventing words for the player
      setArgumentTypingDone(false);
      setArgumentText(chosen?.reaction ?? "");
      return;
    }
    setPlayerLineTypingDone(false);
    setPlayerLineText(spoken);
  }

  function handlePlayerLineTap() {
    if (!playerLineTypingDone) {
      playerLineRef.current?.skip();
      return;
    }
    playTap();
    setPlayerLineText(null);
    setArgumentTypingDone(false);
    const chosen = situation!.options.find((o) => o.id === outcome);
    setArgumentText(chosen?.reaction ?? "");
  }

  function handleArgumentTap() {
    if (!argumentTypingDone) {
      argumentRef.current?.skip();
      return;
    }
    // after a defiant pick, tapping the scene deliberately does nothing: the eye button
    // is the only way on, so choosing to look inside someone who just snapped at you is
    // an act the player performs rather than something that scrolls past
    if (defiant || !outcome) return;
    // a cooperative exchange has nothing hidden to reveal, so it simply ends here
    playTap();
    dispatch({ type: "CHOOSE_OPTION", style: outcome });
    setOutcome(null);
    setArgumentText(null);
  }

  function handleRevealThought() {
    playTap();
    setArgumentText(null);
    setThoughtTypingDone(false);
    // Playing a child, the payoff is seeing what the adult was really thinking. Playing
    // the adult, that framing would be backwards — you already know your own side, so
    // what's useful is the sentence that would have landed better.
    setThoughtText(
      isAdultRole && situation!.coachTip ? situation!.coachTip : situation!.insideThought
    );
  }

  function handleThoughtTap() {
    if (!thoughtTypingDone) {
      thoughtRef.current?.skip();
      return;
    }
    if (!outcome) return;
    playTap();
    // adult roles: rather than just being told a better sentence, watch it land —
    // the negotiating option is replayed as the scene that could have happened
    const kind = situation!.options.find((o) => o.id === "A");
    if (isAdultRole && situation!.coachTip && kind?.speech) {
      setThoughtText(null);
      setReplayTypingDone(false);
      setReplay({ line: kind.speech, reaction: kind.reaction ?? "", step: "line" });
      return;
    }
    dispatch({ type: "CHOOSE_OPTION", style: outcome });
    setOutcome(null);
    setThoughtText(null);
  }

  function handleReplayTap() {
    if (!replay) return;
    if (!replayTypingDone) {
      replayRef.current?.skip();
      return;
    }
    playTap();
    if (replay.step === "line") {
      setReplayTypingDone(false);
      setReplay({ ...replay, step: "reaction" });
      return;
    }
    if (!outcome) return;
    dispatch({ type: "CHOOSE_OPTION", style: outcome });
    setOutcome(null);
    setReplay(null);
  }

  function handleBeatTap() {
    if (!beatTypingDone) {
      beatRef.current?.skip();
      return;
    }
    playTap();
    setBeatTypingDone(false);
    setBeatIndex((i) => i + 1);
  }

  return (
    <div className="relative min-h-screen bg-slate-900">
      <SceneIllustration
        location={situation.location}
        context={situation.context}
        time={situation.time}
        seed={situation.id}
        className="absolute inset-0 h-full w-full"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-white" />
      {viewMode === "first" && <FirstPersonFrame />}

      <div className="relative flex items-start justify-between p-4">
        <div className="rounded-2xl bg-white/90 backdrop-blur px-3 py-2 shadow-md">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <CalendarDays size={13} className="text-blue-500" />
            {day.weekday}
            <span className="text-[10px] font-medium text-slate-400 ml-0.5">{situation.time}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-0.5">
            <MapPin size={13} className="text-blue-400" />
            {situation.location}
          </div>
        </div>
        <div className="relative flex items-center gap-2">
          {isAdultRole && <ClosenessMeter value={session.closeness} />}
          <ProgressKey collected={session.keyFragments} total={day.situationIds.length} />
          <button
            ref={viewToggleRef}
            onClick={revealPending ? handleRevealThought : toggleViewMode}
            title={revealPending ? "Bước vào thế giới khác" : viewMode === "third" ? "Góc nhìn người thứ ba" : "Góc nhìn người thứ nhất"}
            className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur shadow-md active:scale-90 transition ${
              revealPending ? "bg-blue-500 text-white ring-4 ring-blue-300 animate-pulse" : "bg-white/90 text-slate-500"
            }`}
          >
            {revealPending || viewMode === "first" ? <Eye size={16} /> : <User size={16} />}
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-md text-slate-500">
            <Pause size={16} />
          </button>

          {/* the argument has landed and the player is being invited to look past it —
              the arrow points up at the eye above rather than adding a competing button */}
          {revealPending && (
            <div className="absolute right-11 top-12 z-30 flex flex-col items-center animate-bounce">
              <ArrowUp size={20} className="text-blue-600 drop-shadow" />
              <span className="mt-0.5 whitespace-nowrap rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-extrabold text-white shadow-lg">
                Bước vào thế giới khác
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="relative px-4">
        <p className="inline-block rounded-full bg-black/25 backdrop-blur px-3 py-1 text-[11px] font-medium text-white/90">
          {ambientDetail}
        </p>
      </div>

      {playerLineText ? (
        <div role="button" tabIndex={0} onClick={handlePlayerLineTap} className={BEAT_FRAME}>
          {/* every pick plays out as a conversation between two people you can both see,
              cooperative or not — only the faces differ. Scowling rather than merely
              "talking" when the line being delivered is a confrontational one. */}
          <TwoShotStage
            npcName={situation.npcName}
            npcMood="idle"
            reacting={false}
            role={role}
            heightClass={STAGE_FILL}
            playerMood={defiant ? "angry" : "talking"}
          />
          <DialogueBox
            key={playerLineText}
            speakerName={PLAYER_LABEL}
            text={playerLineText}
            align="left"
            variant="speech"
            typingDone={playerLineTypingDone}
            nextLabel="Tiếp →"
            typewriterRef={playerLineRef}
            onTypingDone={() => setPlayerLineTypingDone(true)}
          />
        </div>
      ) : argumentText ? (
        <div role="button" tabIndex={0} onClick={handleArgumentTap} className={BEAT_FRAME}>
          {/* on a defiant pick both faces are hard: the other side is angry at being
              openly defied (C and D alike), and the player is angry too — they just said
              the confrontational line, so standing there placid would read as a different
              person. The next beat is where that anger drops away. On a cooperative pick
              the player has already softened, and the other face follows the answer. */}
          <TwoShotStage
            npcName={situation.npcName}
            npcMood={defiant ? "angry" : STYLE_REACTION[outcome!]}
            reacting
            role={role}
            heightClass={STAGE_FILL}
            playerMood={defiant ? "angry" : "idle"}
          />
          <DialogueBox
            key={argumentText}
            speakerName={situation.npcName}
            text={argumentText}
            align="right"
            variant="speech"
            typingDone={argumentTypingDone}
            nextLabel={defiant ? "Bước vào thế giới khác 👁" : "Tiếp →"}
            typewriterRef={argumentRef}
            onTypingDone={() => setArgumentTypingDone(true)}
          />
        </div>
      ) : replay ? (
        <div role="button" tabIndex={0} onClick={handleReplayTap} className={BEAT_FRAME}>
          {/* the same scene run back with the negotiating line: you speak calmly, and
              this time the answer comes back warm instead of sharp */}
          <TwoShotStage
            npcName={situation.npcName}
            npcMood={replay.step === "line" ? "idle" : "happy"}
            reacting={replay.step === "reaction"}
            role={role}
            heightClass={STAGE_FILL}
            playerMood={replay.step === "line" ? "talking" : "happy"}
          />
          <span className="order-first z-30 mx-auto mt-1 shrink-0 whitespace-nowrap rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-extrabold text-white shadow-lg">
            ↩ Nếu lúc nãy nói thế này
          </span>
          <DialogueBox
            key={replay.step + replay.line}
            speakerName={replay.step === "line" ? PLAYER_LABEL : situation.npcName}
            text={replay.step === "line" ? replay.line : replay.reaction}
            align={replay.step === "line" ? "left" : "right"}
            variant="speech"
            typingDone={replayTypingDone}
            nextLabel="Tiếp →"
            typewriterRef={replayRef}
            onTypingDone={() => setReplayTypingDone(true)}
          />
        </div>
      ) : thoughtText ? (
        <div role="button" tabIndex={0} onClick={handleThoughtTap} className={BEAT_FRAME}>
          {/* the anger has dropped — what's left underneath is closer to hurt */}
          <TwoShotStage npcName={situation.insideThoughtOwner} npcMood="sad" reacting={false} role={role} heightClass={STAGE_FILL} />
          {isAdultRole && situation.coachTip ? (
            // a card rather than a bubble: nobody is saying this, it's advice to the player
            <div className="order-first z-20 mx-[6%] mt-2 shrink-0 rounded-3xl bg-white/95 p-4 shadow-xl ring-2 ring-emerald-200 animate-pop">
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-emerald-600">
                <Lightbulb size={13} /> Thử nói thế này
              </p>
              <p className="text-[13px] leading-relaxed text-slate-700">
                <TypewriterText ref={thoughtRef} text={thoughtText} onDone={() => setThoughtTypingDone(true)} />
              </p>
              <p
                className={`mt-2 text-right text-[11px] font-bold text-emerald-600 transition-opacity duration-300 ${
                  thoughtTypingDone ? "opacity-100" : "opacity-40"
                }`}
              >
                {thoughtTypingDone ? "Tiếp →" : "Bỏ qua"}
              </p>
            </div>
          ) : (
            <DialogueBox
              key={thoughtText}
              text={thoughtText}
              align="right"
              variant="thought"
              typingDone={thoughtTypingDone}
              nextLabel="Tiếp →"
              typewriterRef={thoughtRef}
              onTypingDone={() => setThoughtTypingDone(true)}
            />
          )}
        </div>
      ) : inBeats ? (
        <div role="button" tabIndex={0} onClick={handleBeatTap} className={BEAT_FRAME}>
          <Stage
            heightClass={STAGE_FILL}
            character={
              currentBeat.speaker ? (
                <SceneCharacter name={currentBeat.speaker} mood="talking" reacting={false} alongside={playerKey} />
              ) : currentBeat.subjectIsNpc ? (
                <SceneCharacter name={situation.npcName} mood="idle" reacting={false} alongside={playerKey} />
              ) : (
                playerCharacterOrNone(viewMode, role)
              )
            }
          />
          <DialogueBox
            key={beatIndex}
            speakerName={currentBeat.speaker}
            text={currentBeat.text}
            current={beatIndex + 1}
            total={beats.length}
            typingDone={beatTypingDone}
            nextLabel="Tiếp →"
            typewriterRef={beatRef}
            onTypingDone={() => setBeatTypingDone(true)}
          />
        </div>
      ) : (
        <>
          <div
            ref={dialogueBoxRef}
            role="button"
            tabIndex={0}
            onClick={() => !dialogueTypingDone && dialogueRef.current?.skip()}
            className={BEAT_FRAME}
          >
            {viewMode === "third" ? (
              <TwoShotStage
                npcName={situation.npcName}
                npcMood={outcome ? STYLE_REACTION[outcome] : "talking"}
                reacting={outcome !== null}
                role={role}
                heightClass={STAGE_FILL}
              />
            ) : (
              <Stage
                character={
                  <SceneCharacter name={situation.npcName} mood={outcome ? STYLE_REACTION[outcome] : "talking"} reacting={outcome !== null} alongside={playerKey} />
                }
                heightClass={STAGE_FILL}
              />
            )}
            <DialogueBox
              speakerName={situation.npcName}
              text={situation.dialogue}
              key={situation.id}
              align={viewMode === "third" ? "right" : "center"}
              typingDone={dialogueTypingDone}
              nextLabel="Chọn phản ứng ↓"
              typewriterRef={dialogueRef}
              onTypingDone={() => setDialogueTypingDone(true)}
            />
            {situation.propCaption && (
              <p className="order-first mx-3 mt-1 shrink-0 text-right text-[11px] italic text-white/90 drop-shadow">{situation.propCaption}</p>
            )}
          </div>

          <div
            ref={optionsPanelRef}
            className={`relative -mt-28 sm:-mt-32 space-y-2.5 rounded-t-3xl bg-white/95 backdrop-blur px-4 pt-6 pb-6 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] transition-all duration-500 ${
              dialogueTypingDone ? "translate-y-0 opacity-100" : "translate-y-3 opacity-40 pointer-events-none"
            }`}
          >
            {shuffledOptions
              .filter((opt) => !outcome || outcome === opt.id)
              .map((opt) => {
                const isChosen = outcome === opt.id;
                const meta = OPTION_STYLE[opt.id];
                const Icon = meta.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={(e) => {
                      if (isChosen) {
                        handleConfirm();
                        return;
                      }
                      optionRipples.addRipple(e);
                      handlePick(opt.id);
                    }}
                    className={`relative overflow-hidden w-full flex items-center gap-3 rounded-full bg-white p-3 pr-4 text-left shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                      isChosen ? "ring-2 ring-blue-300 scale-[1.02] animate-pop" : "active:scale-[0.98]"
                    }`}
                  >
                    {optionRipples.RippleLayer}
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${meta.iconBg}`}>
                      <Icon size={20} className={meta.iconColor} />
                    </span>
                    <span className="flex-1 min-w-0 leading-snug">
                      <OptionContent opt={opt} textColor={meta.textColor} />
                      <span className="block text-xs text-slate-400">({opt.sublabel})</span>
                    </span>
                    <ChevronRight size={18} className="shrink-0 text-slate-300" />
                  </button>
                );
              })}
          </div>
        </>
      )}

      {activeHint && (
        <Coachmark
          key={activeHint.id}
          id={activeHint.id}
          targetRef={activeHint.ref}
          text={activeHint.text}
          onDismiss={() => forceHintRecheck((n) => n + 1)}
        />
      )}
    </div>
  );
}
