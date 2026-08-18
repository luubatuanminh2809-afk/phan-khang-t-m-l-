import type { DayPlan, PlayerGender, Role, ScheduleItem, Situation } from "../types";
import { DAYS_PER_WEEK, SITUATIONS_PER_DAY_MAX, SITUATIONS_PER_DAY_MIN } from "../types";
import { studentSituations } from "./situations.student";
import { parentSituations } from "./situations.parent";
import { teacherSituations } from "./situations.teacher";
import { studentSchedule } from "./schedule.student";
import { parentSchedule } from "./schedule.parent";
import { teacherSchedule } from "./schedule.teacher";

const SITUATIONS_BY_ROLE: Record<Role, Situation[]> = {
  student: studentSituations,
  parent: parentSituations,
  teacher: teacherSituations,
};

const SCHEDULE_BY_ROLE: Record<Role, ScheduleItem[]> = {
  student: studentSchedule,
  parent: parentSchedule,
  teacher: teacherSchedule,
};

// consecutive weekdays, in order — a playthrough only runs DAYS_PER_WEEK days long,
// not a literal calendar week, so this just needs enough names to cover that
export const WEEKDAY_NAMES = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];
export const WEEK_ORDER = WEEKDAY_NAMES.slice(0, DAYS_PER_WEEK);

export function getSchedule(role: Role): ScheduleItem[] {
  return SCHEDULE_BY_ROLE[role];
}

export function getAllSituations(role: Role): Situation[] {
  return SITUATIONS_BY_ROLE[role];
}

// Every parent-role line was written as "mẹ" and every teacher-role line as "thầy" —
// both predate the player picking a gender, so a male parent was still being called mẹ
// by their own child. Rather than fork 40 situations into two written copies, the word is
// swapped on the way out for whichever gender wasn't written for. "bố mẹ" and "thầy cô"
// mean parents/teachers in general rather than this particular one, so the lookarounds
// leave those two compounds alone. The student role needs nothing: teachers there address
// the player as "em", which carries no gender.
const VOICE_SWAP: Record<Role, Record<PlayerGender, [RegExp, string][]>> = {
  student: { male: [], female: [] },
  parent: {
    male: [
      [/(?<!Bố )(?<!bố )mẹ/g, "bố"],
      [/Mẹ/g, "Bố"],
    ],
    female: [],
  },
  teacher: {
    male: [],
    female: [
      [/thầy(?! cô)/g, "cô"],
      [/Thầy(?! cô)/g, "Cô"],
    ],
  },
};

// npcName and id are identity, not prose — a child called "Bo" must stay "Bo"
const VERBATIM_FIELDS = new Set(["id", "npcName", "insideThoughtOwner", "context", "time"]);

function swapText(text: string, rules: [RegExp, string][]): string {
  return rules.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), text);
}

function adaptSituation(situation: Situation, rules: [RegExp, string][]): Situation {
  const out = { ...situation } as Record<string, unknown>;
  for (const [key, value] of Object.entries(out)) {
    if (VERBATIM_FIELDS.has(key)) continue;
    if (typeof value === "string") out[key] = swapText(value, rules);
    else if (Array.isArray(value)) {
      out[key] = value.map((item) =>
        typeof item === "object" && item !== null
          ? Object.fromEntries(
              Object.entries(item as Record<string, unknown>).map(([k, v]) => [
                k,
                typeof v === "string" && !VERBATIM_FIELDS.has(k) ? swapText(v, rules) : v,
              ]),
            )
          : item,
      );
    }
  }
  return out as unknown as Situation;
}

// the swap runs over every string of all 20 situations, so it's done once per
// role+gender and kept, not redone on each render
const adaptedCache = new Map<string, Situation[]>();

/** the role's situations, worded for the gender the player chose to play as */
export function getSituationsFor(role: Role, gender: PlayerGender | undefined): Situation[] {
  const rules = VOICE_SWAP[role][gender ?? "female"];
  if (rules.length === 0) return SITUATIONS_BY_ROLE[role];
  const cacheKey = `${role}:${gender}`;
  const cached = adaptedCache.get(cacheKey);
  if (cached) return cached;
  const adapted = SITUATIONS_BY_ROLE[role].map((s) => adaptSituation(s, rules));
  adaptedCache.set(cacheKey, adapted);
  return adapted;
}

export function getSituationById(role: Role, id: string): Situation | undefined {
  return SITUATIONS_BY_ROLE[role].find((s) => s.id === id);
}

export function pickRandomSituationIds(role: Role, count: number): string[] {
  const pool = [...SITUATIONS_BY_ROLE[role]];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).map((s) => s.id);
}

// each day gets a random SITUATIONS_PER_DAY_MIN..SITUATIONS_PER_DAY_MAX count, so
// some days feel a bit shorter/longer than others instead of a flat number every time
function randomSituationCount(): number {
  const span = SITUATIONS_PER_DAY_MAX - SITUATIONS_PER_DAY_MIN + 1;
  return SITUATIONS_PER_DAY_MIN + Math.floor(Math.random() * span);
}

function shuffled<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generates all DAYS_PER_WEEK days of a new playthrough up front, so tomorrow's content
 * can be teased today.
 *
 * Each day used to draw independently from the full pool, which meant the same situation
 * could come up twice in one day and routinely came back two or three times a week. Now
 * the week is dealt from a shuffled deck: every situation is used once before any is used
 * again. A week needs 21-28 slots against a pool of 20, so the deck does run out — when
 * it does it is reshuffled, and the deal then skips past anything already used today, so
 * a repeat never lands in the same day (let alone back-to-back) even when the deck runs
 * dry mid-day.
 */
export function pickWeekPlan(role: Role): DayPlan[] {
  const allIds = SITUATIONS_BY_ROLE[role].map((s) => s.id);
  let deck = shuffled(allIds);
  let lastDealt: string | undefined;

  const deal = (usedToday: Set<string>): string => {
    if (deck.length === 0) deck = shuffled(allIds);
    // first card the day hasn't seen and that isn't the one just played (which would
    // otherwise be possible across a day boundary); falls back to the top card only if
    // the day has somehow used everything, which needs a pool smaller than a day is long
    let index = deck.findIndex((id) => !usedToday.has(id) && id !== lastDealt);
    if (index === -1) index = deck.findIndex((id) => !usedToday.has(id));
    const [dealt] = deck.splice(index === -1 ? 0 : index, 1);
    usedToday.add(dealt);
    lastDealt = dealt;
    return dealt;
  };

  return WEEK_ORDER.map((weekday) => {
    const usedToday = new Set<string>();
    return {
      weekday,
      situationIds: Array.from({ length: randomSituationCount() }, () => deal(usedToday)),
    };
  });
}
