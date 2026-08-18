import * as THREE from "three";

/** the player's own visible avatar — a simple blocky stand-in (no rigged 3D asset
 *  available here), styled close to a classic Roblox R6 figure: a torso, a head, and
 *  two legs that swing while walking. Roblox's default camera is third-person and
 *  shows your own avatar, unlike a pure FPS rig — this exists so that's true here too. */
export class PlayerCharacter {
  readonly group: THREE.Group;
  private torso: THREE.Mesh;
  private head: THREE.Mesh;
  private legLeft: THREE.Mesh;
  private legRight: THREE.Mesh;
  private walkPhase = 0;

  constructor() {
    this.group = new THREE.Group();

    this.torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.1, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x3d6fe0, roughness: 0.7 }),
    );
    this.torso.position.y = 1.15;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    this.head = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.65, 0.65),
      new THREE.MeshStandardMaterial({ color: 0xe8b98a, roughness: 0.7 }),
    );
    this.head.position.y = 2.05;
    this.head.castShadow = true;
    this.group.add(this.head);

    const legGeo = new THREE.BoxGeometry(0.35, 0.9, 0.4);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.75 });
    this.legLeft = new THREE.Mesh(legGeo, legMat);
    this.legLeft.position.set(-0.24, 0.45, 0);
    this.legLeft.castShadow = true;
    this.group.add(this.legLeft);

    this.legRight = new THREE.Mesh(legGeo, legMat);
    this.legRight.position.set(0.24, 0.45, 0);
    this.legRight.castShadow = true;
    this.group.add(this.legRight);
  }

  /** called every frame with the authoritative position and the direction to face —
   *  facing is independently smoothed here so spinning the camera around doesn't spin
   *  the character with it (Roblox's avatar only turns to face where it's walking) */
  update(position: THREE.Vector3, targetFacing: number, moving: boolean, running: boolean, delta: number) {
    this.group.position.set(position.x, position.y, position.z);

    if (moving) {
      // shortest-path angle lerp toward the movement direction
      let diff = targetFacing - this.group.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      this.group.rotation.y += diff * Math.min(1, delta * 10);

      this.walkPhase += delta * (running ? 11 : 7);
      const swing = Math.sin(this.walkPhase) * (running ? 0.55 : 0.35);
      this.legLeft.rotation.x = swing;
      this.legRight.rotation.x = -swing;
    } else {
      this.legLeft.rotation.x *= 0.8;
      this.legRight.rotation.x *= 0.8;
    }
  }

  setVisible(visible: boolean) {
    this.group.visible = visible;
  }
}
