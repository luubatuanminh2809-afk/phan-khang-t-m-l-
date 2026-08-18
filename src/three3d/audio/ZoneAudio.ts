import * as THREE from "three";

/** procedurally synthesized ambience per zone — no audio files bundled with this
 *  prototype, so each zone's "sound" is built from noise/oscillator nodes instead.
 *  Crossfades between zones as the player crosses their bounds, and exposes `duck()`
 *  so the dialogue system can pull the whole soundscape down as a reactance cue
 *  (the world getting quieter and tighter around you when someone leans in). */
export class ZoneAudio {
  private ctx: AudioContext;
  private master: GainNode;
  private hallwayGain: GainNode;
  private classroomGain: GainNode;
  private duckGain: GainNode;
  private zones: { bounds: THREE.Box3; gain: GainNode }[];
  private started = false;

  constructor(hallwayBounds: THREE.Box3, classroomBounds: THREE.Box3) {
    this.ctx = new AudioContext();
    this.duckGain = this.ctx.createGain();
    this.duckGain.gain.value = 1;
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.duckGain.connect(this.master);
    this.master.connect(this.ctx.destination);

    this.hallwayGain = this.buildHallwayBed();
    this.classroomGain = this.buildClassroomBed();
    this.zones = [
      { bounds: hallwayBounds, gain: this.hallwayGain },
      { bounds: classroomBounds, gain: this.classroomGain },
    ];
  }

  /** must be called from a user gesture (pointer-lock click) — AudioContext starts suspended */
  start() {
    if (this.started) return;
    this.started = true;
    void this.ctx.resume();
  }

  private buildHallwayBed(): GainNode {
    // filtered noise = a soft, indistinct crowd murmur
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 500;
    filter.Q.value = 0.6;
    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    noise.connect(filter).connect(gain).connect(this.duckGain);
    noise.start();
    return gain;
  }

  private buildClassroomBed(): GainNode {
    // a steady low hum, like fluorescent lights / a ceiling fan
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 92;
    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    osc.connect(gain).connect(this.duckGain);
    osc.start();
    return gain;
  }

  /** call every frame with the player's world position — crossfades whichever zone bed is active */
  update(playerPosition: THREE.Vector3, delta: number) {
    if (!this.started) return;
    const fadeSpeed = delta * 1.5;
    for (const zone of this.zones) {
      const inside = zone.bounds.containsPoint(playerPosition);
      const target = inside ? 0.5 : 0;
      const current = zone.gain.gain.value;
      zone.gain.gain.value = current + (target - current) * Math.min(1, fadeSpeed);
    }
  }

  /** reactance cue — the whole soundscape gets pulled down and muffled for a moment,
   *  then eases back, as if the room itself tensed up */
  duck(amount: number, durationMs: number) {
    const now = this.ctx.currentTime;
    this.duckGain.gain.cancelScheduledValues(now);
    this.duckGain.gain.setValueAtTime(this.duckGain.gain.value, now);
    this.duckGain.gain.linearRampToValueAtTime(1 - amount, now + 0.35);
    this.duckGain.gain.linearRampToValueAtTime(1, now + durationMs / 1000);
  }

  dispose() {
    void this.ctx.close();
  }
}
