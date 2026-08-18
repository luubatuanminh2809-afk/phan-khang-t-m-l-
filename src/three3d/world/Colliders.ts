import * as THREE from "three";

/** axis-separated collision against a flat list of wall boxes — good enough for a
 *  boxy school layout without pulling in a full physics engine for this prototype. */
export class Colliders {
  private walls: THREE.Box3[] = [];

  addWall(box: THREE.Box3) {
    this.walls.push(box);
  }

  /** given a desired next XZ position and the player's collision radius, returns the
   *  position actually allowed — full move if clear, otherwise slides along whichever
   *  single axis isn't blocked, otherwise holds the current position. */
  resolve(current: THREE.Vector3, desired: THREE.Vector3, radius: number): THREE.Vector3 {
    if (!this.blocked(desired, radius)) return desired;

    const slideX = new THREE.Vector3(desired.x, current.y, current.z);
    if (!this.blocked(slideX, radius)) return slideX;

    const slideZ = new THREE.Vector3(current.x, current.y, desired.z);
    if (!this.blocked(slideZ, radius)) return slideZ;

    return current.clone();
  }

  private blocked(pos: THREE.Vector3, radius: number): boolean {
    for (const wall of this.walls) {
      const closestX = Math.max(wall.min.x, Math.min(pos.x, wall.max.x));
      const closestZ = Math.max(wall.min.z, Math.min(pos.z, wall.max.z));
      const dx = pos.x - closestX;
      const dz = pos.z - closestZ;
      if (dx * dx + dz * dz < radius * radius) return true;
    }
    return false;
  }
}
