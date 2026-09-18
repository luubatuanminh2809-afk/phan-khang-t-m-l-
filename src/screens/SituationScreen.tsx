import { useEffect, useRef, useState, type MouseEvent, type ReactNode, type Ref } from "react";
import { ArrowUp, CalendarDays, ChevronRight, Eye, Lightbulb, Mail, MapPin, MessageCircle, Pause, Play, User } from "lucide-react";
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
import { Button } from "../components/ui/Button";
import type { ExchangeBeat, ResponseStyle, SituationOption } from "../types";

// Colours for the four answer cards. They used to be fixed per resistance level — a green
// handshake for A, a red raised hand for D — which told the player which answer was the
// "good" one before they had read a word, in a game whose whole job is to catch the answer
// they would really give. The palette is shuffled per situation and follows card position,
// so colour carries nothing about the level. Red and green are left out altogether: they
// read as wrong and right on their own, so a polite line landing on red would look rude.
// Text uses the 700 shade — teal and fuchsia at 600 fall under comfortable contrast on white.
const OPTION_PALETTE = [
  { iconBg: "bg-sky-100", iconColor: "text-sky-600", textColor: "text-sky-700" },
  { iconBg: "bg-violet-100", iconColor: "text-violet-600", textColor: "text-violet-700" },
  { iconBg: "bg-teal-100", iconColor: "text-teal-600", textColor: "text-teal-700" },
  { iconBg: "bg-fuchsia-100", iconColor: "text-fuchsia-600", textColor: "text-fuchsia-700" },
];

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
// Every frame height below is capped at the viewport minus 300px, the room the header, the
// ambient line and a speech bubble need above the figure. Uncapped, a short screen (a small
// phone, the app's side panel) squeezed the stage while the art kept its full height, so
// the heads rose into the band the bubble sits in and got covered by it.
const CHAR_BOX_SOLO = "absolute left-[44%] -translate-x-1/2 bottom-[calc(-1*var(--sink))] w-[82%] h-[min(52dvh,calc(100dvh_-_300px))]";
/** solo figure when its speech bubble stands beside it: pulled left so the bubble on the
 *  right covers the air next to the character, not the character. On a narrow screen the
 *  figure is proportionally wider and its head rises into the corner the day/place chip
 *  sits in, so there it is drawn smaller and further left; from sm up it matches the
 *  reference layout — head level with the chips, well clear of them sideways. */
const CHAR_BOX_BESIDE_BUBBLE =
  "absolute left-[26%] -translate-x-1/2 bottom-[calc(-1*var(--sink))] w-[82%] h-[37dvh] sm:left-[40%] sm:h-[52dvh]";
// two-shot framing (third-person): player and NPC standing side by side at equal
// size, facing each other — matches the reference the user shared showing both
// people in a conversation on screen together, replacing the earlier small corner cameo
// Wide enough that the art is limited by the stage height rather than by the box width,
// which is what kept the two-shot characters a third shorter than the same character
// standing alone. The boxes overlap in the middle; the drawings do not, because each PNG
// carries 20-38% transparent margin on either side of the body.
const CHAR_BOX_TWO_SHOT_LEFT = "absolute left-[-6%] bottom-[calc(-1*var(--sink))] w-[78%] h-[min(62dvh,calc(100dvh_-_300px))]";
const CHAR_BOX_TWO_SHOT_RIGHT = "absolute right-[-6%] bottom-[calc(-1*var(--sink))] w-[78%] h-[min(62dvh,calc(100dvh_-_300px))]";

// One beat of the scene. It's a fixed-height column, not a stack of overlays: the
// bubble (and any coach card or badge, all marked order-first) claims the top band at
// its natural height, and the art gets whatever is left below. Overlaying the bubble
// on the art — which is what this replaced — put it squarely over the character's
// face, and worse, a long line grew the bubble downwards and covered more of the face.
// Here a long line pushes the character down instead of hiding them.
// The frame takes whatever the header and the answer sheet leave it, so the screen adds
// up to exactly one viewport and never scrolls. What it does NOT do is size the character
// off that leftover — see the two stage constants below.
const BEAT_FRAME = "relative flex min-h-0 flex-1 flex-col justify-end text-left";
/** The band is the full height of the drawing, so the feet land on the floor of the frame
 *  and nothing is sawn off at the bottom edge. The answer sheet is short enough now — two
 *  columns instead of four stacked rows — that it only laps over the feet, so there is no
 *  longer any need to sink the figure out of its way. Same band in every beat, so the
 *  character neither resizes nor jumps as the scene moves. */
const STAGE_GROUNDED = "relative h-[min(52dvh,calc(100dvh_-_300px))] min-h-[90px] [--sink:0px]";
/** Two people talking have no answer sheet under them, so the frame runs nearly the whole
 *  screen; at 52dvh they stood small with an empty ceiling above them. The band has to match
 *  the taller character boxes exactly — when the drawing is taller than its band it rises out
 *  of the top and into the speech bubble, which is how it ended up over a girl's hair. */
// shrink-0: a flex column may otherwise squeeze this band under a long bubble while the
// absolutely placed art inside keeps its height, which is exactly how heads got covered
const STAGE_TWO_SHOT = "relative h-[min(62dvh,calc(100dvh_-_300px))] min-h-[90px] shrink-0 [--sink:0px]";

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
  return <div className={heightClass}>{character}</div>;
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
    <div className={heightClass}>
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
  align?: "center" | "left" | "right" | "side";
  // "thought" renders the NPC's real inner thought (ThoughtBubble) instead of
  // something they actually said out loud (SpeechBubble)
  variant?: "speech" | "thought";
}) {
  // sits in the frame's top band (order-first) rather than floating over the art, but
  // keeps the same left/right/centre offsets so it still reads as belonging to whoever
  // is standing underneath it
  // Takes its natural height when the frame has room and shrinks into a scroll when it
  // does not, which is what keeps the screen to exactly one viewport: the character is a
  // fixed height, so the bubble is the part that has to give on a short screen.
  // Narrow and tall rather than wide and flat, so a bubble stays over its own speaker
  // instead of reaching across the frame. It is the part that gives way on a short screen
  // (it shrinks and scrolls), because the stage below it may not — see STAGE_TWO_SHOT.
  const cap = "min-h-0 max-h-[60%] shrink overflow-x-hidden overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
  const posClass =
    align === "side"
      ? // Beside the speaker rather than over their head, the way the reference layout
        // puts it: out of the flow entirely, so it takes no height from the figure, and
        // bottom-anchored 76px up — the sheet laps 64px over the frame, plus a 12px gap —
        // so it always sits just clear of the answers however tall the line runs.
        `absolute bottom-[76px] right-[1%] z-20 w-[44%] max-h-[80%] overflow-x-hidden overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:w-[36%]`
      : // a small gap under the bubble rather than the slight overlap it used to have: some
        // poses are drawn right up to the top of their box, and that overlap was enough to
        // clip the top of a head on a short screen
        align === "right"
        ? `order-first z-20 mb-1 ml-auto mr-[3%] w-[46%] ${cap}`
        : align === "left"
          ? `order-first z-20 mb-1 mr-auto ml-[3%] w-[46%] ${cap}`
          : `order-first z-20 mb-1 ml-[44%] w-[58%] -translate-x-1/2 ${cap}`;
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
          tailSide={align === "side" ? "side-left" : align === "left" ? "right" : "left"}
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
    // an option with both a line and an action shows the line alone — the action used to
    // sit under it as a small grey italic caption, and that second line was asked to go
    return <span className={`block text-[clamp(14px,1.85dvh,19px)] font-bold leading-snug ${textColor}`}>&ldquo;{opt.speech}&rdquo;</span>;
  }
  if (opt.action) {
    return <span className={`block text-[clamp(14px,1.85dvh,19px)] italic font-bold leading-snug ${textColor}`}>{opt.action}</span>;
  }
  return <span className={`block text-[clamp(14px,1.85dvh,19px)] font-bold leading-snug ${textColor}`}>{opt.label}</span>;
}

// What the other person actually says back — the spoken `reply`. `reaction` is a third-
// person account of the outcome ("Cô giáo cân nhắc, có thể đồng ý nếu…"), written as research
// notes, and putting it in a speech bubble made every NPC narrate their own behaviour.
function npcReplyText(opt: SituationOption | undefined): string {
  return opt?.reply ?? opt?.reaction ?? "";
}

/** the scene a pick plays out as: your line, their answer, and whatever is said back after
 *  that — so a choice lands as a short conversation between the two of them rather than one
 *  line each, and the scene has somewhere to go before the reaction takes over */
function exchangeFor(opt: SituationOption): ExchangeBeat[] {
  const script: ExchangeBeat[] = [];
  const spoken = optionSpokenText(opt);
  // an option that is a silent act has nothing to deliver — the scene opens on the other
  // person answering what they saw, rather than on words the player never said
  if (spoken) script.push({ who: "player", text: spoken });
  script.push({ who: "npc", text: npcReplyText(opt) });
  return script.concat(opt.followUp ?? []);
}

// the single line to put in the player's own third-person speech bubble — same
// speech-first, action-fallback priority as OptionContent above, just flattened to
// plain text instead of styled JSX
// ONLY the spoken line — never the action description. Falling back to `action` here
// would put narration like "Tỏ thái độ thách thức, tiếp tục dùng tài khoản thật..."
// inside a speech bubble, i.e. the character appears to say their own stage direction
// out loud. An option with nothing to say simply skips the player's line (see
// handlePick) rather than faking one.
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
  // What plays once an answer is picked: the short scene between the two of them — your
  // line, their answer, and whatever is said back after that. Held as one script of beats
  // rather than a pair of "your line"/"their line" slots, so a situation can run the
  // exchange as long as its writing needs before the scene hands over to the reaction.
  const [exchange, setExchange] = useState<ExchangeBeat[] | null>(null);
  const [exchangeIndex, setExchangeIndex] = useState(0);
  // C/D picks only: their real inside thought, shown right after — visually distinct
  // from the spoken beats (ThoughtBubble vs SpeechBubble) so speech and thought never look
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
  // the card that names the situation, shown once as it opens. The screen remounts for
  // every situation, so this starts true again each time without needing a reset.
  const [showTitle, setShowTitle] = useState(true);
  const [ambientDetail] = useState(() => pickAmbientDetail(situation?.context ?? "school"));
  const [viewMode, setViewMode] = useState<ViewMode>(() => getSettings().viewMode);

  function toggleViewMode() {
    const next: ViewMode = viewMode === "third" ? "first" : "third";
    setViewMode(next);
    saveSettings({ ...getSettings(), viewMode: next });
  }

  const [beatTypingDone, setBeatTypingDone] = useState(false);
  const [exchangeTypingDone, setExchangeTypingDone] = useState(false);
  const [thoughtTypingDone, setThoughtTypingDone] = useState(false);
  const [replayTypingDone, setReplayTypingDone] = useState(false);
  const [dialogueTypingDone, setDialogueTypingDone] = useState(false);
  const beatRef = useRef<TypewriterHandle>(null);
  const exchangeRef = useRef<TypewriterHandle>(null);
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
  const [optionPalette] = useState(() => shuffle(OPTION_PALETTE));
  const [pauseOpen, setPauseOpen] = useState(false);

  // Space bar speeds up typing (skips straight to the full line), matching the
  // classic RPG-dialogue convention — whichever box is currently on screen gets it
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      e.preventDefault();
      exchangeRef.current?.skip();
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
  // the moment the answer sheet is up: the one beat laid out after the reference, with the
  // figure standing tall enough that its head reaches the corner the header lives in
  const choosing = !exchange && !replay && !thoughtText && !inBeats;
  // where the picked answer's scene has got to: which line is on screen, who says it, and
  // whether the other person has already answered (their face stays reacting from then on)
  const exchangeBeat = exchange?.[exchangeIndex];
  const exchangeIsLast = !!exchange && exchangeIndex >= exchange.length - 1;
  const npcHasAnswered = !!exchange && exchange.slice(0, exchangeIndex).some((b) => b.who === "npc");
  const currentBeat = beats[beatIndex];
  // Who the player is talking with at this point in the lead-in: the latest speaker who is
  // not the player. Pairing a player line with the situation NPC regardless showed a
  // teacher standing in the room two lines before anyone said she had walked in.
  const beatPartner = (() => {
    for (let i = beatIndex; i >= 0; i--) {
      const sp = beats[i]?.speaker;
      if (sp && sp !== PLAYER_LABEL) return sp;
    }
    return undefined;
  })();
  // a spoken lead-in line with someone to pair it with is framed as a two-shot
  const beatIsExchange = !!currentBeat?.speaker && !!beatPartner;

  // at most one coach-mark on screen at a time — first eligible, not-yet-seen hint wins.
  // each is scoped to the moment it's actually useful (e.g. the options hint waits until
  // the options are actually tappable), and tapping the highlighted element itself also
  // dismisses it (see Coachmark), so this naturally paces one hint per beat instead of
  // dumping the whole tutorial on the very first situation.
  const inMainDialogue = !inBeats && !outcome && !exchange && !thoughtText;
  // C and D are the openly defiant picks: those cut to third-person and end on the
  // NPC's hidden thought. A and B play out the same exchange, but in first person and
  // without a reveal — there is nothing being hidden to look behind.
  const defiant = outcome === "C" || outcome === "D";
  // playing a grown-up: the reveal is not "what were they hiding" but "what could you
  // have said", and the relationship itself is on screen as a meter
  const isAdultRole = role === "parent" || role === "teacher";
  // their face turns the moment they answer and stays turned for the rest of the scene,
  // rather than flipping back to neutral whenever the player gets another line
  const npcReacting = !!exchangeBeat && (npcHasAnswered || exchangeBeat.who === "npc");
  const exchangeNpcMood = !npcReacting ? "idle" : defiant ? "angry" : STYLE_REACTION[outcome!];
  const exchangePlayerMood = defiant ? "angry" : exchangeBeat?.who === "player" ? "talking" : "idle";
  // the scene has played out to its last line: the eye in the header turns into the way to
  // look past the anger, and an arrow points up at it
  const revealPending = defiant && exchangeIsLast && exchangeTypingDone;
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
    // Straight into the exchange. Picking used to leave the chosen card alone on screen
    // waiting for a second tap to confirm, a step players found pointless. Every pick
    // plays out as a real exchange — you say your line, they answer. What differs is the
    // framing: a defiant pick cuts to third-person so you watch the argument from
    // outside, while a cooperative one stays in your own eyes. The style comes from the
    // argument, since `outcome` has not re-rendered yet inside this same tap.
    if (style === "C" || style === "D") setViewMode("third");
    setExchangeTypingDone(false);
    setExchangeIndex(0);
    setExchange(exchangeFor(situation!.options.find((o) => o.id === style)!));
  }

  function handleExchangeTap() {
    if (!exchangeTypingDone) {
      exchangeRef.current?.skip();
      return;
    }
    if (!exchangeIsLast) {
      // one more line of the scene to play
      playTap();
      setExchangeTypingDone(false);
      setExchangeIndex((i) => i + 1);
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
    setExchange(null);
  }

  function handleRevealThought() {
    playTap();
    setExchange(null);
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
      setReplay({ line: kind.speech, reaction: npcReplyText(kind), step: "line" });
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

  const scene = (
    <SceneIllustration
      location={situation.location}
      context={situation.context}
      time={situation.time}
      seed={situation.id}
      className="absolute inset-0 h-full w-full"
    />
  );

  // Every situation opens on its own card: which of today's scenes this is, what it is
  // about, when and where. A day used to run one scene straight into the next with nothing
  // between them, so the jump from the school gate at 06:50 to the dinner table at 19:30
  // read as one unbroken conversation. Held as its own render rather than an overlay so
  // the scene underneath doesn't start typing its first line behind the card.
  if (showTitle) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          playTap();
          setShowTitle(false);
        }}
        className="relative h-[100dvh] overflow-hidden bg-slate-900"
      >
        {scene}
        {/* the scene keeps its own light: only the same gentle vignette the rest of the
            screen uses, with the words carried on their own panel instead of on a curtain
            drawn over the room. Dimming the whole frame to 70% made every situation open on
            what read as a black screen. */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/25" />
        <div className="relative flex h-full flex-col items-center justify-center px-6">
          <div className="max-w-sm rounded-3xl bg-slate-900/55 px-6 py-5 text-center shadow-2xl ring-1 ring-white/20 backdrop-blur-[1px] animate-pop">
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-blue-100">
              Tình huống {session.currentIndex + 1}/{day.situationIds.length}
            </p>
            <h2 className="text-2xl font-black leading-snug text-white drop-shadow sm:text-3xl">
              {situation.title ?? situation.location}
            </h2>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[13px] font-semibold text-white/90">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} className="text-blue-200" />
                {day.weekday}, {situation.time}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-blue-200" />
                {situation.location}
              </span>
            </div>
          </div>
          <p className="mt-6 flex items-center gap-1.5 rounded-full bg-slate-900/50 px-3 py-1.5 text-xs font-bold text-white/90 animate-bounce">
            Chạm để vào <ChevronRight size={14} />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-slate-900">
      {scene}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/10" />
      {viewMode === "first" && <FirstPersonFrame />}


      {/* The scene stays full-bleed behind, but everything you read or tap lives in a
          phone-width column. Without it, a desktop window stretched each answer into a
          1900px-wide slab and left the character marooned in the middle of the room. */}
      <div className="relative mx-auto flex h-full w-full max-w-md flex-col sm:max-w-3xl">
      <div className="relative flex shrink-0 items-start justify-between p-4">
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
          <span className="relative">
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
            {/* the argument has landed and the player is being invited to look past it — the
                arrow hangs off the eye itself, centred under it, so it points at the button
                rather than at a spot a fixed distance from the header's edge */}
            {revealPending && (
              <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-1 flex -translate-x-1/2 flex-col items-center animate-bounce">
                <ArrowUp size={20} className="text-blue-600 drop-shadow" />
                <span className="mt-0.5 whitespace-nowrap rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-extrabold text-white shadow-lg">
                  Bước vào thế giới khác
                </span>
              </div>
            )}
          </span>
          <button
            onClick={() => setPauseOpen(true)}
            title="Tạm dừng"
            aria-label="Tạm dừng"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-md text-slate-500 active:scale-90 transition"
          >
            <Pause size={16} />
          </button>
        </div>
      </div>

      {/* Left out while choosing. The reference layout has no line here, and on a small
          phone it landed on the character's head. Removing it lengthens the frame at the
          top only — the figure is anchored to the sheet below, so it does not move. */}
      {!choosing && (
        <div className="relative shrink-0 px-4">
          <p className="inline-block rounded-full bg-black/25 backdrop-blur px-3 py-1 text-[11px] font-medium text-white/90">
            {ambientDetail}
          </p>
        </div>
      )}

      {exchangeBeat ? (
        <div role="button" tabIndex={0} onClick={handleExchangeTap} className={BEAT_FRAME}>
          {/* The whole scene plays as a conversation between two people you can both see,
              cooperative or not — only the faces change as it goes. On a defiant pick both
              faces are hard: they are angry at being openly defied, and the player is angry
              too, having just said the confrontational line. On a cooperative pick the
              player has already softened, and the other face follows their own answer —
              which is why it only turns once they have actually answered. */}
          <TwoShotStage
            npcName={situation.npcName}
            npcMood={exchangeNpcMood}
            reacting={npcReacting}
            role={role}
            heightClass={STAGE_TWO_SHOT}
            playerMood={exchangePlayerMood}
          />
          <DialogueBox
            key={exchangeIndex}
            speakerName={exchangeBeat.who === "player" ? PLAYER_LABEL : situation.npcName}
            text={exchangeBeat.text}
            align={exchangeBeat.who === "player" ? "left" : "right"}
            variant="speech"
            typingDone={exchangeTypingDone}
            nextLabel={exchangeIsLast && defiant ? "Bước vào thế giới khác 👁" : "Tiếp →"}
            typewriterRef={exchangeRef}
            onTypingDone={() => setExchangeTypingDone(true)}
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
            heightClass={STAGE_TWO_SHOT}
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
          {/* Their anger has dropped — what's left underneath is closer to hurt. The player
              is not over it yet though: this beat follows straight on from a row they just
              had, so standing there pleased with themselves read as a different person. */}
          <TwoShotStage
            npcName={situation.insideThoughtOwner}
            npcMood="sad"
            reacting={false}
            role={role}
            heightClass={STAGE_TWO_SHOT}
            playerMood={defiant ? "angry" : "idle"}
          />
          {isAdultRole && situation.coachTip ? (
            // a card rather than a bubble: nobody is saying this, it's advice to the player
            <div className="order-first z-20 mx-[6%] mt-2 min-h-0 shrink overflow-y-auto rounded-3xl bg-white/95 p-4 shadow-xl ring-2 ring-emerald-200 animate-pop [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
          {beatIsExchange ? (
            // A line between the player and the person in front of them keeps both on
            // screen, the bubble over whoever is talking — the lead-in reads as a
            // conversation instead of a run of solo cutaways.
            <TwoShotStage
              npcName={beatPartner!}
              npcMood={currentBeat.speaker === beatPartner ? "talking" : "idle"}
              reacting={false}
              role={role}
              heightClass={STAGE_TWO_SHOT}
              playerMood={currentBeat.speaker === PLAYER_LABEL ? "talking" : "idle"}
            />
          ) : (
            <Stage
              heightClass={STAGE_GROUNDED}
              character={
                currentBeat.speaker === PLAYER_LABEL ? (
                  // the player speaking before anyone else has: nobody to pair them with yet
                  <PlayerCharacter role={role} mood="talking" />
                ) : currentBeat.speaker ? (
                  <SceneCharacter name={currentBeat.speaker} mood="talking" reacting={false} alongside={playerKey} />
                ) : currentBeat.subjectIsNpc ? (
                  <SceneCharacter name={situation.npcName} mood="idle" reacting={false} alongside={playerKey} />
                ) : (
                  playerCharacterOrNone(viewMode, role)
                )
              }
            />
          )}
          <DialogueBox
            key={beatIndex}
            speakerName={currentBeat.speaker}
            text={currentBeat.text}
            current={beatIndex + 1}
            total={beats.length}
            align={!beatIsExchange ? "center" : currentBeat.speaker === PLAYER_LABEL ? "left" : "right"}
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
                heightClass={STAGE_TWO_SHOT}
              />
            ) : (
              <Stage
                character={
                  <SceneCharacter name={situation.npcName} mood={outcome ? STYLE_REACTION[outcome] : "talking"} reacting={outcome !== null} alongside={playerKey} boxClass={CHAR_BOX_BESIDE_BUBBLE} />
                }
                heightClass={STAGE_GROUNDED}
              />
            )}
            <DialogueBox
              speakerName={situation.npcName}
              text={situation.dialogue}
              key={situation.id}
              align={viewMode === "third" ? "right" : "side"}
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
            className={`relative -mt-16 grid min-h-0 shrink grid-cols-1 gap-[clamp(6px,1.2dvh,14px)] overflow-x-hidden overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mx-[5%] rounded-t-[1.75rem] bg-slate-100/85 backdrop-blur-xl px-[clamp(10px,1.5dvh,16px)] pt-[clamp(10px,1.5dvh,16px)] pb-[clamp(10px,1.5dvh,16px)] ring-1 ring-white/60 shadow-[0_-10px_40px_rgba(15,23,42,0.18)] transition-all duration-500 ${
              dialogueTypingDone ? "translate-y-0 opacity-100" : "translate-y-3 opacity-40 pointer-events-none"
            }`}
          >
            {shuffledOptions.map((opt) => {
                // colour follows the card's place in this situation's shuffled order
                const meta = optionPalette[shuffledOptions.indexOf(opt) % optionPalette.length];
                return (
                  <button
                    key={opt.id}
                    onClick={(e) => {
                      optionRipples.addRipple(e);
                      handlePick(opt.id);
                    }}
                    className="relative overflow-hidden w-full flex min-h-[10.5dvh] items-center gap-[clamp(10px,1.6dvh,18px)] rounded-full bg-white py-[clamp(8px,1.3dvh,14px)] pl-[clamp(10px,1.6dvh,18px)] pr-5 text-left ring-1 ring-slate-900/5 shadow-[0_3px_12px_rgba(15,23,42,0.10)] transition-all hover:shadow-[0_6px_18px_rgba(15,23,42,0.16)] hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    {optionRipples.RippleLayer}
                    <span className={`flex h-[clamp(40px,5.6dvh,58px)] w-[clamp(40px,5.6dvh,58px)] shrink-0 items-center justify-center rounded-full ${meta.iconBg}`}>
                      <MessageCircle size={20} className={meta.iconColor} />
                    </span>
                    <span className="flex-1 min-w-0 leading-snug">
                      <OptionContent opt={opt} textColor={meta.textColor} />
                    </span>
                    <ChevronRight size={18} className="shrink-0 text-slate-300" />
                  </button>
                );
              })}
          </div>
        </>
      )}

      </div>

      {activeHint && (
        <Coachmark
          key={activeHint.id}
          id={activeHint.id}
          targetRef={activeHint.ref}
          text={activeHint.text}
          onDismiss={() => forceHintRecheck((n) => n + 1)}
        />
      )}

      {/* The pause button used to do nothing. It opens this menu, mainly so a player who wants
          to write a letter mid-run can step out and come back: the letter screen returns to
          this situation rather than to an evaluation that does not exist yet. The pick in
          progress lives only in this screen's state, so the situation starts over on return. */}
      {pauseOpen && (
        <div
          role="dialog"
          aria-label="Tạm dừng"
          onClick={() => setPauseOpen(false)}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 px-6 backdrop-blur-sm"
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xs rounded-3xl bg-white p-5 shadow-2xl animate-pop">
            <p className="mb-4 text-center text-lg font-extrabold text-slate-800">Tạm dừng</p>
            <div className="space-y-2.5">
              <Button fullWidth icon={<Play size={18} />} onClick={() => setPauseOpen(false)}>
                Tiếp tục chơi
              </Button>
              <Button
                fullWidth
                variant="secondary"
                icon={<Mail size={18} />}
                onClick={() => dispatch({ type: "OPEN_LETTER", returnTo: "situation" })}
              >
                Viết thư
              </Button>
            </div>
            <p className="mt-3 text-center text-[11px] leading-snug text-slate-400">
              Viết xong bấm &ldquo;Quay lại chơi&rdquo; để chơi tiếp tình huống này từ đầu.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
