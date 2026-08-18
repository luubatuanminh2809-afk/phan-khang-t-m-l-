// lightweight synthesized sound effects — no audio files, just Web Audio oscillators,
// so the game has audio feedback without shipping any sound assets

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ctx) ctx = new AudioCtx();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq: number, durationMs: number, type: OscillatorType = "sine", startGain = 0.05, delayMs = 0) {
  const audio = getCtx();
  if (!audio) return;
  const t0 = audio.currentTime + delayMs / 1000;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(startGain, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durationMs / 1000);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + durationMs / 1000 + 0.02);
}

/** faint keystroke tick while text is typing out */
export function playType() {
  tone(720 + Math.random() * 80, 28, "square", 0.012);
}

/** tap to advance a beat/dialogue */
export function playTap() {
  tone(360, 55, "sine", 0.035);
}

/** picking one of the 4 response options */
export function playChoice() {
  tone(520, 90, "triangle", 0.05);
  tone(660, 110, "triangle", 0.035, 40);
}

/** day/chest success */
export function playSuccess() {
  tone(523, 110, "triangle", 0.05);
  tone(659, 110, "triangle", 0.05, 90);
  tone(784, 180, "triangle", 0.05, 180);
}

/** key fragment / reveal moment */
export function playReveal() {
  tone(660, 90, "sine", 0.045);
  tone(880, 220, "sine", 0.045, 70);
}
