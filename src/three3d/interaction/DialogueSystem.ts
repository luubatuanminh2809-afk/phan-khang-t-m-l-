import * as THREE from "three";
import { NPC } from "../npc/NPC";
import type { PlayerController } from "../core/PlayerController";
import type { ZoneAudio } from "../audio/ZoneAudio";
import type { Scenario } from "./scenarios";

export interface HudDialogueState {
  phase: "none" | "approaching" | "line" | "choices" | "reaction";
  speaker?: string;
  text?: string;
  choices?: { id: "A" | "B" | "C"; label: string }[];
}

const CLOSE_DISTANCE = 1.3;
// once triggered, tint ramps in over this many studs of approach — purely a visual
// pacing constant, unrelated to how the trigger itself fires
const APPROACH_SPAN = 4;

interface DialogueCallbacks {
  onHud: (s: HudDialogueState) => void;
  onTint: (v: number) => void;
  onReactance: (v: number) => void;
}

/** drives the one scripted beat in this prototype zone: a teacher who notices the
 *  player, closes the distance, opens with a commanding line, then reacts differently
 *  to each of the 3 response styles — with the environment (tint, audio duck, camera
 *  shake) tracking the pressure of the moment rather than just the dialogue text. */
export class DialogueSystem {
  private teacher: NPC;
  private player: PlayerController;
  private audio: ZoneAudio;
  private cb: DialogueCallbacks;
  private scenario: Scenario;
  private doorBounds: THREE.Box3;

  private triggered = false;
  private phase: HudDialogueState["phase"] = "none";
  private reactanceScore = 0;
  private reactionTimer = 0;

  constructor(
    teacher: NPC,
    player: PlayerController,
    audio: ZoneAudio,
    scenario: Scenario,
    doorBounds: THREE.Box3,
    callbacks: DialogueCallbacks,
  ) {
    this.teacher = teacher;
    this.player = player;
    this.audio = audio;
    this.scenario = scenario;
    this.doorBounds = doorBounds;
    this.cb = callbacks;
  }

  choose(id: "A" | "B" | "C") {
    if (this.phase !== "choices") return;
    const choice = this.scenario.choices.find((c) => c.id === id);
    if (!choice) return;

    this.reactanceScore += choice.reactanceDelta;
    this.cb.onReactance(this.reactanceScore);
    this.phase = "reaction";
    this.reactionTimer = 3.2;
    this.cb.onHud({ phase: "reaction", speaker: this.scenario.speaker, text: choice.reactionLine });

    const tint = Math.min(1, choice.reactanceDelta / 35);
    this.cb.onTint(tint);
    this.audio.duck(0.25 + tint * 0.35, 2600);
    this.player.addShakePulse(tint * 1.4);

    if (choice.id === "C") {
      this.teacher.nudgeToward(this.player.worldPosition, 0.45);
    }
  }

  /** called once the initial line finishes typing/is tapped through */
  revealChoices() {
    if (this.phase !== "line") return;
    this.phase = "choices";
    this.cb.onHud({
      phase: "choices",
      speaker: this.scenario.speaker,
      text: this.scenario.initialLine,
      choices: this.scenario.choices.map((c) => ({ id: c.id, label: c.label })),
    });
  }

  update(delta: number, playerPos: THREE.Vector3) {
    if (this.phase === "reaction") {
      this.reactionTimer -= delta;
      if (this.reactionTimer <= 0) {
        this.phase = "none";
        this.cb.onHud({ phase: "none" });
        this.cb.onTint(0);
      }
      return;
    }

    if (!this.triggered) {
      // fires only once the player has actually walked through the doorway threshold —
      // not just from being near the teacher — matching "the NPC must be approached
      // through a real action, not a popup that fires from proximity" from the brief
      if (this.doorBounds.containsPoint(playerPos)) {
        this.triggered = true;
        this.phase = "approaching";
        this.cb.onHud({ phase: "approaching" });
      }
      return;
    }

    if (this.phase === "approaching") {
      this.teacher.stepToward(playerPos, CLOSE_DISTANCE, delta, 1.3);
      this.teacher.faceToward(playerPos);
      const dist = this.teacher.position.distanceTo(playerPos);
      const closeness = 1 - Math.min(1, Math.max(0, (dist - CLOSE_DISTANCE) / APPROACH_SPAN));
      this.cb.onTint(closeness * 0.45);
      if (dist <= CLOSE_DISTANCE + 0.05) {
        this.phase = "line";
        this.audio.duck(0.35, 3000);
        this.player.addShakePulse(0.8);
        this.cb.onHud({ phase: "line", speaker: this.scenario.speaker, text: this.scenario.initialLine });
      }
    }
  }
}
