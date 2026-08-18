import * as THREE from "three";

export type NPCState = "patrol" | "idle" | "approaching" | "talking";

interface NPCOptions {
  position: THREE.Vector3;
  facing: number;
  shirtColor: number;
  skinColor?: number;
}

/** a simple capsule+sphere stand-in for a person — there's no rigged 3D character
 *  asset available in this environment, so "not standing still" is expressed through
 *  procedural motion (walk-bob, turning, idle sway) on this primitive body instead of
 *  real walk-cycle animation. */
export class NPC {
  readonly group: THREE.Group;
  private body: THREE.Mesh;
  private head: THREE.Mesh;
  position: THREE.Vector3;
  private facing: number;
  private walkPhase = 0;
  state: NPCState = "idle";

  private patrolPoints: THREE.Vector3[] = [];
  private patrolTarget = 0;

  constructor(opts: NPCOptions) {
    this.position = opts.position.clone();
    this.facing = opts.facing;

    this.group = new THREE.Group();
    this.body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.28, 1.05, 4, 8),
      new THREE.MeshStandardMaterial({ color: opts.shirtColor, roughness: 0.75 }),
    );
    this.body.position.y = 0.95;
    this.body.castShadow = true;
    this.group.add(this.body);

    this.head = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 16),
      new THREE.MeshStandardMaterial({ color: opts.skinColor ?? 0xe8b98a, roughness: 0.7 }),
    );
    this.head.position.y = 1.72;
    this.head.castShadow = true;
    this.group.add(this.head);

    // a small book prop held out front, since "đọc sách / mang cặp" was called out
    // explicitly — a visible prop reads as "doing something" far more than an idle pose
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.03), new THREE.MeshStandardMaterial({ color: 0xf4cd54 }));
    book.position.set(0.18, 1.05, -0.28);
    book.rotation.x = -0.3;
    this.group.add(book);

    this.syncTransform();
  }

  setPatrol(points: THREE.Vector3[]) {
    this.patrolPoints = points;
    this.state = "patrol";
  }

  /** step a couple paces toward `target`, used when a teacher/NPC "closes in" as a
   *  reactance cue — looming closer in the player's own view is a strong physical
   *  pressure signal on its own, independent of any dialogue text */
  stepToward(target: THREE.Vector3, distance: number, delta: number, speed = 1.1) {
    const dir = new THREE.Vector3(target.x - this.position.x, 0, target.z - this.position.z);
    const currentDist = dir.length();
    if (currentDist <= distance) return;
    dir.normalize();
    const step = Math.min(speed * delta, currentDist - distance);
    this.position.x += dir.x * step;
    this.position.z += dir.z * step;
    this.facing = Math.atan2(dir.x, dir.z) + Math.PI;
    this.walkPhase += delta * 8;
    this.syncTransform();
  }

  /** moves a fixed distance toward `target` immediately, independent of frame delta —
   *  used for a one-shot "closes in further" beat rather than continuous per-frame motion */
  nudgeToward(target: THREE.Vector3, amount: number, minDistance = 0.6) {
    const dx = target.x - this.position.x;
    const dz = target.z - this.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist <= minDistance) return;
    const step = Math.min(amount, dist - minDistance);
    this.position.x += (dx / dist) * step;
    this.position.z += (dz / dist) * step;
    this.syncTransform();
  }

  faceToward(target: THREE.Vector3) {
    const dx = target.x - this.position.x;
    const dz = target.z - this.position.z;
    this.facing = Math.atan2(dx, dz) + Math.PI;
    this.syncTransform();
  }

  update(delta: number) {
    if (this.state === "patrol" && this.patrolPoints.length > 0) {
      const target = this.patrolPoints[this.patrolTarget];
      const dx = target.x - this.position.x;
      const dz = target.z - this.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.15) {
        this.patrolTarget = (this.patrolTarget + 1) % this.patrolPoints.length;
      } else {
        const speed = 1.0;
        this.position.x += (dx / dist) * speed * delta;
        this.position.z += (dz / dist) * speed * delta;
        this.facing = Math.atan2(dx, dz) + Math.PI;
        this.walkPhase += delta * 7;
      }
      this.syncTransform();
    } else if (this.state === "idle") {
      // slow breathing sway so an idle NPC still reads as alive, not a mannequin
      this.walkPhase += delta * 1.4;
      this.syncTransform();
    }
  }

  private syncTransform() {
    this.group.position.set(this.position.x, 0, this.position.z);
    this.group.rotation.y = this.facing;
    const bob = this.state === "idle" ? Math.sin(this.walkPhase) * 0.015 : Math.abs(Math.sin(this.walkPhase)) * 0.05;
    this.body.position.y = 0.95 + bob;
    this.head.position.y = 1.72 + bob;
  }
}
