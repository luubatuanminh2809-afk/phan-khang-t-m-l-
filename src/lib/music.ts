// Ambient background music, synthesised on the fly rather than shipped as an audio
// file — the game ships as one self-contained HTML, so an embedded mp3 would add
// megabytes of base64 while a few oscillators cost nothing.
//
// Third version. The first layered long sustained chords that never fully released,
// which read as a continuous drone and left the player's ears ringing. The second went
// the other way — single plucked notes with silence between them — but every note still
// struck in 40ms as a triangle wave and leapt at random across two octaves, and it was
// giving players a headache over a session. This one keeps the silence and changes how
// the notes arrive: a swell instead of a strike, a warm near-sine an octave lower, short
// phrases that step between neighbouring notes and come home to rest, a faint echo so
// each note trails off rather than stops, and a quieter mix under a darker filter.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
/** where the notes go: on to the mix, and through the echo */
let voices: GainNode | null = null;
let warmTone: PeriodicWave | null = null;
let timer: number | null = null;
let nextNoteAt = 0;
let nextPadAt = 0;
let padIndex = 0;
let degree = 2;
let phraseLeft = 0;

// C major pentatonic from G3 up to A4 — no semitone clashes, and nothing above 440 Hz
const NOTES = [196.0, 220.0, 261.63, 293.66, 329.63, 392.0, 440.0];
// the degrees a phrase may come to rest on (C4 and G4), so each one sounds finished
const HOME = [2, 5];
// the pad sits low and quiet, and only two notes at a time so it never turns muddy
const PADS: number[][] = [
  [130.81, 196.0],
  [146.83, 220.0],
  [174.61, 261.63],
  [130.81, 196.0],
];

const PAD_SECONDS = 12;
// a new pad only every 20s, so each swell is followed by real silence rather than a drone
const PAD_EVERY = 20;

/** one note that swells in instead of striking, then fades out completely */
function note(freq: number, at: number, level = 1) {
  if (!ctx || !voices || !warmTone) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.setPeriodicWave(warmTone);
  osc.frequency.setValueAtTime(freq, at);
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(0.03 * level, at + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 3.4);
  osc.connect(gain);
  gain.connect(voices);
  osc.start(at);
  osc.stop(at + 3.5);
}

/** the barely-there cushion under the notes — quiet enough to feel rather than hear */
function pad(freq: number, at: number, seconds: number) {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, at);
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(0.007, at + seconds * 0.5);
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
    // a phrase is three or four notes, then a rest
    if (phraseLeft === 0) phraseLeft = 3 + Math.floor(Math.random() * 2);
    phraseLeft--;
    if (phraseLeft > 0) {
      // step to a neighbouring note of the scale, now and then two — never a leap
      const size = Math.random() < 0.75 ? 1 : 2;
      degree += Math.random() < 0.5 ? -size : size;
      // bounce off either end of the range instead of piling up against it
      if (degree < 0) degree = -degree;
      if (degree > NOTES.length - 1) degree = 2 * (NOTES.length - 1) - degree;
      note(NOTES[degree], nextNoteAt);
      nextNoteAt += 1.2 + Math.random() * 0.6;
    } else {
      // the last note comes home, a little softer, and the silence after it is the point
      degree = HOME.reduce((best, d) => (Math.abs(d - degree) < Math.abs(best - degree) ? d : best));
      note(NOTES[degree], nextNoteAt, 0.8);
      nextNoteAt += 5 + Math.random() * 3;
    }
  }

  while (nextPadAt < horizon) {
    PADS[padIndex++ % PADS.length].forEach((f) => pad(f, nextPadAt, PAD_SECONDS));
    nextPadAt += PAD_EVERY;
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
    filter.frequency.value = 1500;
    filter.Q.value = 0; // no resonant bump at the cutoff
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(filter);
    filter.connect(ctx.destination);

    // every note is also sent round a faint, darkened echo, so it trails off instead
    // of stopping dead
    voices = ctx.createGain();
    voices.connect(master);
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.48;
    const damp = ctx.createBiquadFilter();
    damp.type = "lowpass";
    damp.frequency.value = 1000;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.25;
    const wet = ctx.createGain();
    wet.gain.value = 0.22;
    voices.connect(delay);
    delay.connect(damp);
    damp.connect(feedback);
    feedback.connect(delay);
    damp.connect(wet);
    wet.connect(master);

    // a sine with a whisper of its octave on top: warm like a felt piano, without the
    // upper harmonics that made the old triangle wave ring in the ear
    warmTone = ctx.createPeriodicWave(new Float32Array([0, 0, 0]), new Float32Array([0, 1, 0.12]));
  }
  if (ctx.state === "suspended") ctx.resume();

  master!.gain.cancelScheduledValues(ctx.currentTime);
  master!.gain.setValueAtTime(master!.gain.value, ctx.currentTime);
  master!.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 5);

  nextNoteAt = ctx.currentTime + 1.2;
  nextPadAt = ctx.currentTime + 0.2;
  phraseLeft = 0;
  degree = 2;
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
