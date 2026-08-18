import type { Letter, PlaySession, Role } from "../types";

const KEYS = {
  profile: "moralyn.profile",
  history: "moralyn.history",
  letters: "moralyn.letters",
  settings: "moralyn.settings",
  onboarding: "moralyn.onboarding",
  save: "moralyn.save",
} as const;

export interface HistoryEntry {
  id: string;
  role: Role;
  weekday: string;
  dominant: string;
  scoreLabel: string;
  playedAt: string;
}

export interface Profile {
  name: string;
}

export type ViewMode = "third" | "first";

export interface Settings {
  soundOn: boolean;
  viewMode: ViewMode;
  /** background music, kept separate from soundOn so players can silence the loop
   *  without losing the tap/choice feedback sounds */
  musicOn?: boolean;
}

/** music defaults to on for players whose settings were saved before it existed */
export function isMusicOn(): boolean {
  return getSettings().musicOn !== false;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures (e.g. private mode)
  }
}

export function getProfile(): Profile {
  return read<Profile>(KEYS.profile, { name: "Người chơi" });
}

export function saveProfile(profile: Profile) {
  write(KEYS.profile, profile);
}

export function getSettings(): Settings {
  return read<Settings>(KEYS.settings, { soundOn: true, viewMode: "first" });
}

export function saveSettings(settings: Settings) {
  write(KEYS.settings, settings);
}

export function getHistory(): HistoryEntry[] {
  return read<HistoryEntry[]>(KEYS.history, []);
}

export function addHistoryEntry(entry: HistoryEntry) {
  const list = getHistory();
  list.unshift(entry);
  write(KEYS.history, list.slice(0, 50));
}

export function clearHistory() {
  write(KEYS.history, []);
}

export function getSentLetters(): Letter[] {
  return read<Letter[]>(KEYS.letters, []);
}

export function addSentLetter(letter: Letter) {
  const list = getSentLetters();
  list.unshift(letter);
  write(KEYS.letters, list.slice(0, 50));
}

export function resetAllProgress() {
  write(KEYS.history, []);
  write(KEYS.letters, []);
}

/** ids of coach-mark hints the player has already dismissed — each hint shows once ever */
export function getSeenHints(): string[] {
  return read<string[]>(KEYS.onboarding, []);
}

export function hasSeenHint(id: string): boolean {
  return getSeenHints().includes(id);
}

export function markHintSeen(id: string) {
  const seen = getSeenHints();
  if (!seen.includes(id)) write(KEYS.onboarding, [...seen, id]);
}

/** clears every dismissed coach-mark hint so they all show again from the next screen */
export function resetSeenHints() {
  write(KEYS.onboarding, []);
}

// ---------------------------------------------------------------------------
// Saved run — lets a player close the tab mid-week and pick up where they left off.
//
// This is a local save, not an account: there is no server behind the game, so the run
// lives in this browser's localStorage under a name the player types. Opening the game
// on another device or browser will not find it. That trade-off is deliberate — the
// whole game ships as one offline HTML file.
export interface SavedRun {
  playerName: string;
  role: Role;
  session: PlaySession;
  savedAt: string;
}

export function getSavedRun(): SavedRun | null {
  const run = read<SavedRun | null>(KEYS.save, null);
  // guard against a save written by an older build with a different shape
  if (!run || !run.session || !run.role) return null;
  return run;
}

export function saveRun(playerName: string, role: Role, session: PlaySession) {
  write(KEYS.save, { playerName, role, session, savedAt: new Date().toISOString() } satisfies SavedRun);
}

export function clearSavedRun() {
  try {
    localStorage.removeItem(KEYS.save);
  } catch {
    // ignore storage failures (e.g. private mode)
  }
}
