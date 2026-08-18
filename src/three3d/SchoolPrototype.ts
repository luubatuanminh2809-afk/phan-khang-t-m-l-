import * as THREE from "three";
import { PlayerController } from "./core/PlayerController";
import { buildSchoolZone } from "./world/buildSchoolZone";
import { NPC } from "./npc/NPC";
import { ZoneAudio } from "./audio/ZoneAudio";
import { DialogueSystem, type HudDialogueState } from "./interaction/DialogueSystem";
import { pickRandomScenario } from "./interaction/scenarios";

export interface PrototypeCallbacks {
  onHud: (s: HudDialogueState) => void;
  onTint: (v: number) => void;
  onReactance: (v: number) => void;
  onLockChange: (locked: boolean) => void;
  onInspectPrompt: (text: string | null) => void;
  onInspectResult: (text: string | null) => void;
}

const INSPECTABLE = {
  position: new THREE.Vector3(2.2, 1.2, -4.6),
  radius: 2.2,
  text: 'Bảng thông báo: "Sinh hoạt dưới cờ — Thứ Hai, 7:00, sân trường."',
};

/** owns the whole Three.js scene for this prototype — one hallway, one classroom,
 *  two NPCs, one scripted approach-and-choice beat. Bootstraps everything the React
 *  wrapper needs and exposes a small imperative API (start/dispose/choose/etc). */
export class SchoolPrototype {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private player: PlayerController;
  private zone: ReturnType<typeof buildSchoolZone>;
  private patrolNpc: NPC;
  private teacherNpc: NPC;
  private audio: ZoneAudio;
  private dialogue: DialogueSystem;
  private cb: PrototypeCallbacks;

  private clock = new THREE.Clock();
  private rafId = 0;
  private inspectPromptShown = false;

  constructor(canvas: HTMLCanvasElement, callbacks: PrototypeCallbacks) {
    this.cb = callbacks;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdfe6ef);

    this.zone = buildSchoolZone();
    this.scene.add(this.zone.group);

    this.player = new PlayerController(canvas, this.zone.colliders, this.zone.spawnPoint);
    this.scene.add(this.player.camera);
    this.scene.add(this.player.characterGroup);

    this.patrolNpc = new NPC({ position: this.zone.patrolWaypoints[0], facing: 0, shirtColor: 0x3d6fe0 });
    this.patrolNpc.setPatrol(this.zone.patrolWaypoints);
    this.scene.add(this.patrolNpc.group);

    this.teacherNpc = new NPC({ position: this.zone.teacherPosition, facing: this.zone.teacherFacing, shirtColor: 0xe0658a });
    this.scene.add(this.teacherNpc.group);

    this.audio = new ZoneAudio(this.zone.hallwayBounds, this.zone.classroomBounds);

    this.dialogue = new DialogueSystem(this.teacherNpc, this.player, this.audio, pickRandomScenario(), this.zone.doorTriggerBounds, {
      onHud: this.cb.onHud,
      onTint: this.cb.onTint,
      onReactance: this.cb.onReactance,
    });

    canvas.addEventListener("click", this.onFirstClick);
    document.addEventListener("pointerlockchange", this.onLockChange);
    window.addEventListener("resize", this.onResize);
    window.addEventListener("keydown", this.onKeyDown);

    this.animate();
  }

  private onFirstClick = () => {
    this.audio.start();
  };

  private onLockChange = () => {
    this.cb.onLockChange(document.pointerLockElement !== null);
  };

  private onResize = () => {
    this.player.handleResize();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.code === "KeyE") {
      // "continue/interact" — advance the current dialogue line into its choices
      this.dialogue.revealChoices();
    } else if (e.code === "KeyF") {
      this.handleInspectKey();
    }
  };

  choose(id: "A" | "B" | "C") {
    this.dialogue.choose(id);
  }

  private animate = () => {
    this.rafId = requestAnimationFrame(this.animate);
    const delta = Math.min(0.05, this.clock.getDelta());

    this.player.update(delta);
    this.patrolNpc.update(delta);
    this.teacherNpc.update(delta);
    const playerPos = this.player.worldPosition;
    this.dialogue.update(delta, playerPos);
    this.audio.update(playerPos, delta);

    const nearInspect = playerPos.distanceTo(INSPECTABLE.position) < INSPECTABLE.radius;
    if (nearInspect !== this.inspectPromptShown) {
      this.inspectPromptShown = nearInspect;
      this.cb.onInspectPrompt(nearInspect ? "Nhấn F để quan sát" : null);
    }

    this.renderer.render(this.scene, this.player.camera);
  };

  handleInspectKey() {
    if (this.inspectPromptShown) {
      this.cb.onInspectResult(INSPECTABLE.text);
      window.setTimeout(() => this.cb.onInspectResult(null), 3200);
    }
  }

  dispose() {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("pointerlockchange", this.onLockChange);
    this.player.dispose();
    this.audio.dispose();
    this.renderer.dispose();
  }
}
