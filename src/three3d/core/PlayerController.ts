import * as THREE from "three";
import { InputManager } from "./InputManager";
import { PlayerCharacter } from "./PlayerCharacter";
import type { Colliders } from "../world/Colliders";

const WALK_SPEED = 3.4;
const RUN_SPEED = 6.2;
const PLAYER_RADIUS = 0.35;
const EYE_HEIGHT = 1.7; // orbit pivot height, roughly head-height on the avatar
const GRAVITY = 18;
const JUMP_SPEED = 6;
const BASE_FOV = 65;
const RUN_FOV = 72;
const MOUSE_SENSITIVITY = 0.0022;
const MIN_CAM_DISTANCE = 1.2; // scrolling all the way in gets close to first-person, like Roblox's zoom
const MAX_CAM_DISTANCE = 8;
const DEFAULT_CAM_DISTANCE = 4.5;

/** Roblox-style third-person camera: an orbit camera trailing behind a visible player
 *  avatar rather than a rig glued to the eyes. Mouse movement orbits the camera around
 *  the character (not the character itself — Roblox only turns the avatar to face where
 *  it's walking), WASD moves relative to the camera's facing, and the scroll wheel
 *  zooms distance in/out the same way Roblox's does. */
export class PlayerController {
  readonly camera: THREE.PerspectiveCamera;
  readonly characterGroup: THREE.Group;
  private input: InputManager;
  private colliders: Colliders;
  private domElement: HTMLElement;
  private character: PlayerCharacter;

  private yaw = 0;
  private pitch = -0.15;
  private position: THREE.Vector3;
  private verticalVelocity = 0;
  private grounded = true;
  private isLocked = false;
  private shakeIntensity = 0; // set externally (e.g. by DialogueSystem) for reactance camera shake
  private camDistance = DEFAULT_CAM_DISTANCE;
  private facing = 0; // the character mesh's own facing, separate from camera yaw

  constructor(domElement: HTMLElement, colliders: Colliders, spawn: THREE.Vector3) {
    this.domElement = domElement;
    this.colliders = colliders;
    this.position = spawn.clone();
    this.camera = new THREE.PerspectiveCamera(BASE_FOV, window.innerWidth / window.innerHeight, 0.05, 100);
    this.input = new InputManager();
    this.character = new PlayerCharacter();
    this.characterGroup = this.character.group;

    domElement.addEventListener("click", this.requestLock);
    domElement.addEventListener("wheel", this.onWheel, { passive: false });
    document.addEventListener("pointerlockchange", this.onLockChange);
    document.addEventListener("mousemove", this.onMouseMove);
  }

  private requestLock = () => {
    this.domElement.requestPointerLock();
  };

  private onLockChange = () => {
    this.isLocked = document.pointerLockElement === this.domElement;
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.isLocked) return;
    this.yaw -= e.movementX * MOUSE_SENSITIVITY;
    this.pitch -= e.movementY * MOUSE_SENSITIVITY;
    this.pitch = Math.max(-1.2, Math.min(0.9, this.pitch));
  };

  private onWheel = (e: WheelEvent) => {
    if (!this.isLocked) return;
    e.preventDefault();
    this.camDistance = Math.max(MIN_CAM_DISTANCE, Math.min(MAX_CAM_DISTANCE, this.camDistance + e.deltaY * 0.01));
  };

  /** external reactance cue — a short camera shake pulse, decaying on its own */
  addShakePulse(intensity: number) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  get worldPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  get isPointerLocked(): boolean {
    return this.isLocked;
  }

  update(delta: number) {
    const forward = (this.input.isDown("KeyW") ? 1 : 0) - (this.input.isDown("KeyS") ? 1 : 0);
    const strafe = (this.input.isDown("KeyD") ? 1 : 0) - (this.input.isDown("KeyA") ? 1 : 0);
    const running = this.input.isDown("ShiftLeft") || this.input.isDown("ShiftRight");
    const moving = forward !== 0 || strafe !== 0;

    const speed = running && moving ? RUN_SPEED : WALK_SPEED;
    const sinYaw = Math.sin(this.yaw);
    const cosYaw = Math.cos(this.yaw);
    // movement is relative to the camera's yaw, same as Roblox's default third-person controls
    const moveX = (-sinYaw * forward + cosYaw * strafe) * speed * delta;
    const moveZ = (-cosYaw * forward - sinYaw * strafe) * speed * delta;

    if (moving) {
      const desired = new THREE.Vector3(this.position.x + moveX, 0, this.position.z + moveZ);
      const resolved = this.colliders.resolve(this.position, desired, PLAYER_RADIUS);
      this.position.x = resolved.x;
      this.position.z = resolved.z;
      // the avatar faces the direction it's actually moving, not the camera direction —
      // matching Roblox, where you can orbit the camera freely without spinning your character
      this.facing = Math.atan2(moveX, moveZ) + Math.PI;
    }

    if (this.input.isDown("Space") && this.grounded) {
      this.verticalVelocity = JUMP_SPEED;
      this.grounded = false;
    }
    this.verticalVelocity -= GRAVITY * delta;
    this.position.y += this.verticalVelocity * delta;
    if (this.position.y <= 0) {
      this.position.y = 0;
      this.verticalVelocity = 0;
      this.grounded = true;
    }

    this.character.update(this.position, this.facing, moving, running, delta);

    // reactance shake decays each frame — a short, self-resolving jolt rather than a toggle
    this.shakeIntensity = Math.max(0, this.shakeIntensity - delta * 1.6);
    const shakeYaw = (Math.random() - 0.5) * this.shakeIntensity * 0.03;
    const shakePitch = (Math.random() - 0.5) * this.shakeIntensity * 0.03;

    // orbit camera: pivot at the character's head height, offset backward/upward by
    // camDistance along the yaw/pitch the mouse has set
    const pivot = new THREE.Vector3(this.position.x, this.position.y + EYE_HEIGHT, this.position.z);
    const orbitYaw = this.yaw + shakeYaw;
    const orbitPitch = this.pitch + shakePitch;
    const offset = new THREE.Vector3(
      Math.sin(orbitYaw) * Math.cos(orbitPitch),
      Math.sin(orbitPitch),
      Math.cos(orbitYaw) * Math.cos(orbitPitch),
    ).multiplyScalar(this.camDistance);
    this.camera.position.set(pivot.x + offset.x, pivot.y + offset.y, pivot.z + offset.z);
    this.camera.lookAt(pivot);

    // hide the avatar when the camera has zoomed in close enough that it would just
    // clip through/obscure the view — the same "zooms into first-person" behavior Roblox has
    this.character.setVisible(this.camDistance > MIN_CAM_DISTANCE + 0.6);

    const targetFov = running && moving ? RUN_FOV : BASE_FOV;
    this.camera.fov += (targetFov - this.camera.fov) * Math.min(1, delta * 6);
    this.camera.updateProjectionMatrix();
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    this.domElement.removeEventListener("click", this.requestLock);
    this.domElement.removeEventListener("wheel", this.onWheel);
    document.removeEventListener("pointerlockchange", this.onLockChange);
    document.removeEventListener("mousemove", this.onMouseMove);
    this.input.dispose();
    if (document.pointerLockElement === this.domElement) document.exitPointerLock();
  }
}
