export type Role = "student" | "parent" | "teacher";

export type PlayerGender = "male" | "female";

/** how long a run lasts, picked before the role: the whole week, or a single day */
export type PlayMode = "week" | "day";

export type ResponseStyle = "A" | "B" | "C" | "D";

export interface ScheduleItem {
  time: string;
  title: string;
  location: string;
  caption?: string;
}

export interface SituationOption {
  id: ResponseStyle;
  /** combined text, kept as a plain-text fallback (tech demo, search, etc.) —
   *  speech/action below are the structured, UI-facing source of truth */
  label: string;
  /** what the character actually says out loud, if anything ("Không có lời nói cụ thể" in the source docx) */
  speech?: string;
  /** what the character does, if anything ("Không có hành động cụ thể" in the source docx) */
  action?: string;
  sublabel: string;
  /** what the other person does and feels in response to this choice, in the third person —
   *  the source docx's account of the likely outcome. Kept as research content; it reads as
   *  narration, so it is not what goes in the speech bubble. */
  reaction: string;
  /** the same response as the line the other person actually says out loud, in their own
   *  voice. This is what the speech bubble shows; `reaction` is the fallback only. */
  reply?: string;
  /** what is still said after their reply, so the pick plays out as a short scene between
   *  the two of them rather than one line each. Usually a single line back from the player,
   *  landing on the stance the choice actually takes, before the scene hands over to the
   *  reaction (the hidden thought for a defiant pick, the next situation otherwise). */
  followUp?: ExchangeBeat[];
}

/** one spoken line of the scene that plays after a pick: who says it, and what they say */
export interface ExchangeBeat {
  who: "player" | "npc";
  text: string;
}

export interface DialogueBeat {
  /** speaker name; omit for narration (scene-setting text, no speaker) */
  speaker?: string;
  text: string;
  /** for narration beats only: true if the text describes the situation's NPC doing something
   *  (show the NPC acting it out) rather than the player (the default) */
  subjectIsNpc?: boolean;
}

export interface Situation {
  id: string;
  context: "school" | "home";
  time: string;
  location: string;
  /** a few words naming what this one is about ("Điện thoại vào tủ khoá"), shown on the
   *  title card that leads into the scene. Falls back to the location when missing. */
  title?: string;
  npcName: string;
  npcRole: string;
  /** narration/dialogue beats that play before the main dialogue + choices, building up the scene */
  beats?: DialogueBeat[];
  dialogue: string;
  propCaption?: string;
  options: SituationOption[];
  /** what the other person (teacher/parent for student role, or child for parent/teacher role) truly felt */
  insideThought: string;
  insideThoughtOwner: string;
  /** role label shown under insideThoughtOwner; defaults to npcRole when omitted */
  insideThoughtOwnerRole?: string;
  /** adult roles only (parent/teacher): what the grown-up could have said instead, offered
   *  after a harsh exchange. Written per situation rather than reused from option A,
   *  because it also names what the child actually needed. */
  coachTip?: string;
}

export interface RoleContent {
  role: Role;
  title: string;
  tagline: string;
  weekday: string;
  schedule: ScheduleItem[];
  situations: Situation[];
}

export const STYLE_META: Record<
  ResponseStyle,
  { color: string; ring: string; bg: string; icon: "handshake" | "mask" | "megaphone" | "hand" }
> = {
  A: { color: "text-emerald-600", ring: "ring-emerald-300", bg: "bg-emerald-50", icon: "handshake" },
  B: { color: "text-sky-600", ring: "ring-sky-300", bg: "bg-sky-50", icon: "mask" },
  C: { color: "text-amber-600", ring: "ring-amber-300", bg: "bg-amber-50", icon: "megaphone" },
  D: { color: "text-rose-600", ring: "ring-rose-300", bg: "bg-rose-50", icon: "hand" },
};

export interface DayPlan {
  weekday: string;
  situationIds: string[];
}

// week mode: 7 days, each with a random 3-5 situations (varies day to day — see
// pickWeekPlan in data/content.ts), matching the "mở rương" flow — one random code
// collected per day, 7 codes needed to open the chest and unlock the PKTL evaluation
// (see docs/GAME_DESCRIPTION.md section 6)
export const DAYS_PER_WEEK = 7;
/** starting value of the closeness meter for the adult roles (see PlaySession.closeness) */
export const CLOSENESS_START = 55;
/** how far each pick moves it: warm answers earn a little back, harsh ones cost more —
 *  a relationship is quicker to dent than to repair */
export const CLOSENESS_STEP: Record<ResponseStyle, number> = { A: 6, B: 2, C: -8, D: -11 };
export const SITUATIONS_PER_DAY_MIN = 3;
export const SITUATIONS_PER_DAY_MAX = 5;
/** day mode: a single day of this many situations, spread from morning to night (see
 *  pickOneDayPlan in data/content.ts), then straight to the evaluation — no codes, no chest */
export const SITUATIONS_IN_ONE_DAY = 7;

export interface PlaySession {
  role: Role;
  /** week or day, fixed for the whole run: decides how many days there are and whether
   *  the run ends by opening the chest or goes straight to the evaluation */
  mode: PlayMode;
  /** every day of the run (7 in week mode, 1 in day mode), generated up front so
   *  tomorrow's content can be teased today */
  days: DayPlan[];
  /** which day the player is currently on */
  dayIndex: number;
  /** which situation within the current day */
  currentIndex: number;
  /** every choice made this run, across all days */
  choices: { situationId: string; style: ResponseStyle }[];
  /** key fragments collected so far *today* (0..today's situation count) */
  keyFragments: number;
  /** week mode only: one random digit (0-9) granted per completed day, kept across the
   *  whole week — once there are DAYS_PER_WEEK of these, the player can open the chest */
  dailyCodes: number[];
  /** adult roles only: how close the child/student still feels, 0-100, starting at
   *  CLOSENESS_START. Cooperative picks raise it, harsh ones drop it. Shown in the HUD
   *  as an unlabelled meter on purpose — naming it would turn the game into a score to
   *  farm rather than an honest read of how the player actually reacts. */
  closeness: number;
  /** which body the player wears — picked once at the profile screen */
  gender: PlayerGender;
}

export interface AdviceTip {
  emoji: string;
  title: string;
  text: string;
}

export interface AdviceEntry {
  dominant: ResponseStyle;
  scoreLabel: string;
  headline: string;
  body: string;
  tips: AdviceTip[];
  extraNote: string;
}

export type LetterTheme = "blue" | "green" | "amber" | "pink" | "violet";

/** a sticker the player placed themselves: where it sits on the paper, how big, how tilted.
 *  x and y are fractions of the letter's width and height, so a letter laid out on a phone
 *  comes back looking the same on a laptop and in the exported image. */
export interface PlacedSticker {
  emoji: string;
  x: number;
  y: number;
  /** degrees; 0 is upright */
  rotate?: number;
  /** 1 is the default size */
  scale?: number;
}

export interface Letter {
  id: string;
  templateId: string;
  theme: LetterTheme;
  toWhom: string;
  message: string;
  signOff: string;
  /** the emoji used, kept flat so letters written by older builds still open */
  stickers: string[];
  /** where the player actually put them; absent on letters from before they could be moved */
  placed?: PlacedSticker[];
  createdAt: string;
}

export type Screen =
  | "cover"
  | "explore"
  | "settings"
  | "history"
  | "achievements"
  | "eqPoints"
  | "profile"
  | "modeSelect"
  | "roleSelect"
  | "dayIntro"
  | "situation"
  | "reveal"
  | "dayEnd"
  | "chestOpen"
  | "evaluation"
  | "freeRoamDemo"
  | "school3dDemo"
  | "letterWrite"
  | "letterRead";
