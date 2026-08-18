import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import type { AdviceEntry, Letter, PlaySession, PlayerGender, Role, ResponseStyle, Screen } from "../types";
import { DAYS_PER_WEEK, CLOSENESS_START, CLOSENESS_STEP } from "../types";
import { adviceByRole } from "../data/advice";
import { pickWeekPlan } from "../data/content";
import { decodeLetter, letterCodeFromHash } from "./letterCode";
import { getProfile, saveRun } from "./storage";

interface GameState {
  screen: Screen;
  role: Role | null;
  session: PlaySession | null;
  revealIndex: number;
  advice: AdviceEntry | null;
  lastLetterCode: string | null;
  readLetterCode: string;
  openedLetter: Letter | null;
  /** today's just-granted code digit, for the reveal screen to show off */
  lastDailyCode: number | null;
  /** chosen at the profile screen, before a role is picked, so it has to live here
   *  rather than only inside the session */
  gender: PlayerGender;
}

type Action =
  | { type: "GO_TO"; screen: Screen }
  | { type: "SELECT_ROLE"; role: Role }
  | { type: "SET_GENDER"; gender: PlayerGender }
  | { type: "START_DAY" }
  | { type: "CHOOSE_OPTION"; style: ResponseStyle }
  | { type: "REVEAL_NEXT" }
  | { type: "NEXT_DAY" }
  | { type: "REPLAY_WEEK" }
  | { type: "RESUME_RUN"; role: Role; session: PlaySession }
  | { type: "GO_HOME" }
  | { type: "SET_LAST_LETTER_CODE"; code: string | null }
  | { type: "SET_READ_LETTER_CODE"; code: string }
  | { type: "OPEN_LETTER_FROM_LINK"; letter: Letter };

const initialState: GameState = {
  screen: "cover",
  role: null,
  session: null,
  revealIndex: 0,
  advice: null,
  lastLetterCode: null,
  readLetterCode: "",
  openedLetter: null,
  lastDailyCode: null,
  gender: "female",
};

// if the page was opened via a shared letter link (#letter=...), jump straight to it
// instead of flashing the cover screen first
function buildInitialState(): GameState {
  const code = letterCodeFromHash();
  if (!code) return initialState;
  const letter = decodeLetter(code);
  if (!letter) return initialState;
  return { ...initialState, openedLetter: letter, screen: "letterRead" };
}

function computeAdvice(role: Role, session: PlaySession): AdviceEntry {
  const tally: Record<ResponseStyle, number> = { A: 0, B: 0, C: 0, D: 0 };
  session.choices.forEach((c) => (tally[c.style] += 1));
  const dominant = (Object.keys(tally) as ResponseStyle[]).sort((a, b) => tally[b] - tally[a])[0];
  const entries = adviceByRole[role];
  return entries.find((e) => e.dominant === dominant) ?? entries[0];
}

// C/D picks already show their insideThought immediately in SituationScreen (see
// handleOutcomeTap there) — the end-of-day reveal recap only needs to cover A/B
// picks, whose thought hasn't been shown yet, so it skips forward past any C/D
// situation instead of showing the same card a second time
function findNextRevealIndex(session: PlaySession, dayIndex: number, fromIndex: number): number {
  const day = session.days[dayIndex];
  const situationsBeforeToday = session.days.slice(0, dayIndex).reduce((sum, d) => sum + d.situationIds.length, 0);
  let idx = fromIndex;
  while (idx < day.situationIds.length) {
    const style = session.choices[situationsBeforeToday + idx]?.style;
    if (style !== "C" && style !== "D") return idx;
    idx++;
  }
  return idx;
}

function newSession(role: Role, gender: PlayerGender): PlaySession {
  return {
    role,
    days: pickWeekPlan(role),
    dayIndex: 0,
    currentIndex: 0,
    choices: [],
    keyFragments: 0,
    dailyCodes: [],
    closeness: CLOSENESS_START,
    gender,
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "GO_TO":
      return { ...state, screen: action.screen };

    case "SELECT_ROLE":
      return {
        ...state,
        role: action.role,
        session: newSession(action.role, state.gender),
        revealIndex: 0,
        advice: null,
        lastDailyCode: null,
        screen: "dayIntro",
      };

    case "SET_GENDER":
      return { ...state, gender: action.gender };

    case "START_DAY":
      return { ...state, screen: "situation" };

    case "CHOOSE_OPTION": {
      if (!state.session || !state.role) return state;
      const day = state.session.days[state.session.dayIndex];
      const situationId = day.situationIds[state.session.currentIndex];
      const choices = [...state.session.choices, { situationId, style: action.style }];
      const keyFragments = state.session.keyFragments + 1;
      // how the child/student feels about the adult after this exchange (adult roles
      // only; harmless for the student role, which never displays it)
      const closeness = Math.max(0, Math.min(100, state.session.closeness + CLOSENESS_STEP[action.style]));
      const isLastOfDay = state.session.currentIndex >= day.situationIds.length - 1;
      if (!isLastOfDay) {
        return {
          ...state,
          session: { ...state.session, choices, keyFragments, closeness, currentIndex: state.session.currentIndex + 1 },
          screen: "situation",
        };
      }
      // last situation of the day — no more minigame gate, today's mã số (one random
      // digit, kept for the rest of the week to open the chest on day 7) is just
      // granted outright
      const code = Math.floor(Math.random() * 10);
      const session = { ...state.session, choices, keyFragments, closeness, dailyCodes: [...state.session.dailyCodes, code] };
      const startIndex = findNextRevealIndex(session, session.dayIndex, 0);
      if (startIndex >= day.situationIds.length) {
        // every pick today was C/D — already revealed immediately, nothing left to recap
        const isLastDay = session.dayIndex >= DAYS_PER_WEEK - 1;
        if (isLastDay) {
          const advice = computeAdvice(state.role, session);
          return { ...state, session, lastDailyCode: code, advice, screen: "chestOpen" };
        }
        return { ...state, session, lastDailyCode: code, screen: "dayEnd" };
      }
      return { ...state, session, lastDailyCode: code, revealIndex: startIndex, screen: "reveal" };
    }

    case "REVEAL_NEXT": {
      if (!state.session || !state.role) return state;
      const revealDay = state.session.days[state.session.dayIndex];
      const nextIndex = findNextRevealIndex(state.session, state.session.dayIndex, state.revealIndex + 1);
      if (nextIndex < revealDay.situationIds.length) {
        return { ...state, revealIndex: nextIndex };
      }
      const isLastDay = state.session.dayIndex >= DAYS_PER_WEEK - 1;
      if (isLastDay) {
        const advice = computeAdvice(state.role, state.session);
        return { ...state, advice, screen: "chestOpen" };
      }
      return { ...state, screen: "dayEnd" };
    }

    case "NEXT_DAY": {
      if (!state.session) return state;
      return {
        ...state,
        session: { ...state.session, dayIndex: state.session.dayIndex + 1, currentIndex: 0, keyFragments: 0 },
        screen: "dayIntro",
      };
    }

    case "REPLAY_WEEK": {
      if (!state.role) return state;
      return {
        ...state,
        session: newSession(state.role, state.session?.gender ?? state.gender),
        revealIndex: 0,
        advice: null,
        lastDailyCode: null,
        screen: "dayIntro",
      };
    }

    case "RESUME_RUN":
      // drop the player back at the start of whichever day they were on, rather than
      // mid-situation: re-reading the day's schedule is a gentler re-entry than being
      // dumped into a half-finished conversation days later
      return {
        ...state,
        role: action.role,
        session: action.session,
        gender: action.session.gender ?? state.gender,
        revealIndex: 0,
        advice: null,
        lastDailyCode: null,
        screen: "dayIntro",
      };

    case "GO_HOME":
      return { ...initialState };

    case "SET_LAST_LETTER_CODE":
      return { ...state, lastLetterCode: action.code };

    case "SET_READ_LETTER_CODE":
      return { ...state, readLetterCode: action.code };

    case "OPEN_LETTER_FROM_LINK":
      return { ...state, openedLetter: action.letter, screen: "letterRead" };

    default:
      return state;
  }
}

interface GameContextValue extends GameState {
  dispatch: React.Dispatch<Action>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);

  // auto-save the run whenever it advances, so closing the tab never costs progress.
  // Saving on every session change (rather than only at day boundaries) means even a
  // browser crash mid-day only rewinds to the start of that day on resume.
  useEffect(() => {
    if (!state.role || !state.session) return;
    saveRun(getProfile().name, state.role, state.session);
  }, [state.role, state.session]);

  useEffect(() => {
    // clean up the #letter=... hash once consumed, so it doesn't linger in the address bar
    if (window.location.hash.startsWith("#letter=")) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);
  const value = useMemo(() => ({ ...state, dispatch }), [state]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
