import * as THREE from "three";
import { Colliders } from "./Colliders";

export interface SchoolZone {
  group: THREE.Group;
  colliders: Colliders;
  spawnPoint: THREE.Vector3;
  hallwayBounds: THREE.Box3;
  classroomBounds: THREE.Box3;
  /** thin slab right at the doorway threshold — the dialogue trigger fires when the
   *  player actually walks through this, not just from being near the teacher */
  doorTriggerBounds: THREE.Box3;
  patrolWaypoints: THREE.Vector3[];
  teacherPosition: THREE.Vector3;
  teacherFacing: number; // yaw, radians
}

const WALL_HEIGHT = 3.2;
const WALL_THICKNESS = 0.2;

function box(
  parent: THREE.Group,
  colliders: Colliders,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  color: number,
  collide = true,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness: 0.85 }));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  if (collide) {
    colliders.addWall(new THREE.Box3().setFromObject(mesh));
  }
  return mesh;
}

/** builds one small vertical slice of the school — a hallway leading into a single
 *  classroom — as the prototype's proof-of-concept zone. Every wall/desk/locker is
 *  primitive Three.js geometry (no external 3D assets available in this environment),
 *  so it reads as a gray-box level, not finished art. */
export function buildSchoolZone(): SchoolZone {
  const group = new THREE.Group();
  const colliders = new Colliders();

  // --- floors ---------------------------------------------------------
  const hallwayFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 16),
    new THREE.MeshStandardMaterial({ color: 0xb9c2cc, roughness: 0.9 }),
  );
  hallwayFloor.rotation.x = -Math.PI / 2;
  hallwayFloor.position.set(0, 0, -6);
  hallwayFloor.receiveShadow = true;
  group.add(hallwayFloor);

  const classroomFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 10),
    new THREE.MeshStandardMaterial({ color: 0xc9a06a, roughness: 0.85 }),
  );
  classroomFloor.rotation.x = -Math.PI / 2;
  classroomFloor.position.set(0, 0, -19);
  classroomFloor.receiveShadow = true;
  group.add(classroomFloor);

  // --- hallway walls (leave a 2m doorway gap into the classroom) ------
  box(group, colliders, WALL_THICKNESS, WALL_HEIGHT, 16, -2.5, WALL_HEIGHT / 2, -6, 0xe4e7eb);
  box(group, colliders, WALL_THICKNESS, WALL_HEIGHT, 16, 2.5, WALL_HEIGHT / 2, -6, 0xe4e7eb);
  // hallway end wall, split around the doorway into the classroom
  box(group, colliders, 1.5, WALL_HEIGHT, WALL_THICKNESS, -1.75, WALL_HEIGHT / 2, -14, 0xe4e7eb);
  box(group, colliders, 1.5, WALL_HEIGHT, WALL_THICKNESS, 1.75, WALL_HEIGHT / 2, -14, 0xe4e7eb);
  // a wood-toned frame around the doorway gap — makes it read as an actual door to
  // walk toward rather than an invisible trigger sitting in the middle of the hallway
  box(group, colliders, 0.25, WALL_HEIGHT, 0.5, -1.75, WALL_HEIGHT / 2, -14, 0x8a5a3c, false);
  box(group, colliders, 0.25, WALL_HEIGHT, 0.5, 1.75, WALL_HEIGHT / 2, -14, 0x8a5a3c, false);
  box(group, colliders, 3.5, 0.25, 0.5, 0, WALL_HEIGHT, -14, 0x8a5a3c, false);

  // lockers lining the hallway — decorative, not separate colliders (the wall behind covers it)
  for (let i = 0; i < 5; i++) {
    box(group, colliders, 0.5, 1.7, 0.4, -2.2, 0.85, -1 - i * 2.4, 0x3d6fe0, false);
    box(group, colliders, 0.5, 1.7, 0.4, 2.2, 0.85, -1 - i * 2.4, 0xe0658a, false);
  }

  // --- classroom walls (minus the doorway shared with the hallway) ---
  box(group, colliders, 1.5, WALL_HEIGHT, WALL_THICKNESS, -5.25, WALL_HEIGHT / 2, -14, 0xf4f1ea); // left of doorway
  box(group, colliders, 8.5, WALL_HEIGHT, WALL_THICKNESS, 3.25, WALL_HEIGHT / 2, -14, 0xf4f1ea); // right of doorway, wide
  box(group, colliders, WALL_THICKNESS, WALL_HEIGHT, 10, -6, WALL_HEIGHT / 2, -19, 0xf4f1ea); // left wall
  box(group, colliders, WALL_THICKNESS, WALL_HEIGHT, 10, 6, WALL_HEIGHT / 2, -19, 0xf4f1ea); // right wall (windows painted on via emissive strip below)
  box(group, colliders, 12, WALL_HEIGHT, WALL_THICKNESS, 0, WALL_HEIGHT / 2, -24, 0xf4f1ea); // far wall

  // window strip (bright, unlit-looking panel suggesting daylight outside)
  const windowStrip = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 1.4),
    new THREE.MeshStandardMaterial({ color: 0xcfe8ff, emissive: 0x9fd2ff, emissiveIntensity: 0.5 }),
  );
  windowStrip.rotation.y = -Math.PI / 2;
  windowStrip.position.set(5.9, 1.9, -19);
  group.add(windowStrip);

  // blackboard on the far wall
  const blackboard = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x1f4d3a, roughness: 0.6 }),
  );
  blackboard.position.set(0, 1.8, -23.85);
  group.add(blackboard);

  // teacher's desk
  box(group, colliders, 1.4, 0.75, 0.7, 0, 0.375, -22.5, 0x8a5a3c);

  // student desks in two rows of three, with a small chair block behind each
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const dx = -3.2 + col * 3.2;
      const dz = -16.5 - row * 2.2;
      box(group, colliders, 1, 0.7, 0.55, dx, 0.35, dz, 0xd8c19a);
      box(group, colliders, 0.5, 0.75, 0.5, dx, 0.375, dz + 0.75, 0x5b6470, false);
    }
  }

  // --- lighting --------------------------------------------------------
  const hemi = new THREE.HemisphereLight(0xf5f8ff, 0x555555, 0.55);
  group.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff3da, 0.7);
  sun.position.set(6, 10, -4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -14;
  sun.shadow.camera.right = 14;
  sun.shadow.camera.top = 14;
  sun.shadow.camera.bottom = -14;
  group.add(sun);

  for (let i = 0; i < 4; i++) {
    const ceiling = new THREE.PointLight(0xdfe9ff, 6, 6, 2);
    ceiling.position.set(0, WALL_HEIGHT - 0.15, -1.5 - i * 4);
    group.add(ceiling);
  }
  const classroomLight = new THREE.PointLight(0xfff1d8, 9, 12, 2);
  classroomLight.position.set(0, WALL_HEIGHT - 0.2, -19);
  group.add(classroomLight);

  return {
    group,
    colliders,
    // well inside the hallway (not right at its open near end) — the third-person
    // camera trails a few studs behind the character, so spawning too close to the
    // open end put the default camera position outside the building entirely
    spawnPoint: new THREE.Vector3(0, 0, -3),
    hallwayBounds: new THREE.Box3(new THREE.Vector3(-2.5, -1, -14), new THREE.Vector3(2.5, 4, 2)),
    classroomBounds: new THREE.Box3(new THREE.Vector3(-6, -1, -24), new THREE.Vector3(6, 4, -14)),
    // a generous zone spanning the last stretch of the hallway through into the
    // classroom doorway — wide enough (in Z) that just walking down the corridor
    // toward the classroom naturally triggers it, no need to hit an exact narrow spot.
    // X stays clamped to the actual doorway gap so the teacher's straight-line walk
    // toward the player (no pathfinding) doesn't clip through the walls either side.
    doorTriggerBounds: new THREE.Box3(new THREE.Vector3(-1.75, -0.5, -17), new THREE.Vector3(1.75, 3.5, -12)),
    patrolWaypoints: [new THREE.Vector3(1.2, 0, -1.5), new THREE.Vector3(1.2, 0, -9.5)],
    teacherPosition: new THREE.Vector3(-0.6, 0, -13.2),
    teacherFacing: Math.PI,
  };
}
