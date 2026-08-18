// Ambient background music, synthesised on the fly rather than shipped as an audio
// file — the game ships as one self-contained HTML, so an embedded mp3 would add
// megabytes of base64 while a few oscillators cost nothing.
//
// Second version. The first one layered long sustained chords that overlapped without
// ever fully releasing, which read as a continuous drone and left the player's ears
// ringing. This one is built the opposite way: single plucked notes with a real decay,
// generous silence between them, and only a whisper of pad underneath. Nothing holds a
// pitch for long, so there is no standing tone to fatigue against.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let timer: number | null = null;
let nextNoteAt = 0;
let nextPadAt = 0;
let step = 0;

// C major pentatonic across two octaves — no semitone clashes, so any order sounds fine
const NOTES = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
// the pad sits low and quiet, and only two notes at a time so it never turns muddy
const PADS: number[][] = [
  [130.81, 196.0],
  [146.83, 220.0],
  [174.61, 261.63],
  [130.81, 196.0],
];

const PAD_SECONDS = 14;

/** a plucked note: quick attack, long natural decay, then genuinely gone */
function pluck(freq: number, at: number) {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, at);
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(0.05, at + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 2.6);
  osc.connect(gain);
  gain.connect(master);
  osc.start(at);
  osc.stop(at + 2.8);
}

/** the barely-there cushion under the notes — quiet enough to feel rather than hear */
function pad(freq: number, at: number, seconds: number) {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, at);
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(0.012, at + seconds * 0.4);
  gain.gain.linearRampToValueAtTime(0, at + seconds);
  osc.connect(gain);
  gain.connect(master);
  osc.start(at);
  osc.stop(at + seconds + 0.1);
}

function schedule() {
  if (!ctx) return;
  const horizon = ctx.currentTime + 2;

  while (nextNoteAt < horizon) {
    // most steps play, some stay silent — the gaps are what keep it from nagging
    if (Math.random() < 0.72) {
      pluck(NOTES[Math.floor(Math.random() * NOTES.length)], nextNoteAt);
      // once in a while a second note a beat later, like a lazy arpeggio
      if (Math.random() < 0.3) {
        pluck(NOTES[Math.floor(Math.random() * NOTES.length)], nextNoteAt + 0.45);
      }
    }
    nextNoteAt += 1.6 + Math.random() * 1.4;
    step++;
  }

  while (nextPadAt < horizon) {
    PADS[step % PADS.length].forEach((f) => pad(f, nextPadAt, PAD_SECONDS));
    nextPadAt += PAD_SECONDS * 0.9;
  }
}

export function isMusicPlaying(): boolean {
  return timer !== null;
}

/** Must be called from a user gesture — browsers refuse to start audio otherwise. */
export function startMusic() {
  if (timer !== null) return;
  if (typeof window === "undefined") return;
  const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return;

  if (!ctx) {
    ctx = new AudioCtor();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2000; // takes the glassy edge off without muffling it
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(filter);
    filter.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();

  master!.gain.cancelScheduledValues(ctx.currentTime);
  master!.gain.setValueAtTime(master!.gain.value, ctx.currentTime);
  master!.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 4);

  nextNoteAt = ctx.currentTime + 0.6;
  nextPadAt = ctx.currentTime + 0.2;
  schedule();
  timer = window.setInterval(schedule, 700);
}

export function stopMusic() {
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
  if (ctx && master) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
  }
}
