import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
const CONFIG = {
  scale: 35,
  baseCount: 4,
  startX: -20,
  startZ: 0,
  yOffset: 0,
} as const;
function setMeshShadow(target: THREE.Object3D): void {
  target.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = true;
    child.receiveShadow = true;
  });
}
export default class Dice {
  parent: THREE.Object3D;
  group: THREE.Group;
  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = new THREE.Group();
    const probe = gltf.scene.clone(true);
    probe.scale.setScalar(CONFIG.scale);
    const dieSize = new THREE.Box3()
      .setFromObject(probe)
      .getSize(new THREE.Vector3());
    const stepX = dieSize.x;
    const stepY = dieSize.y;
    probe.clear();
    for (let row = 0; row < CONFIG.baseCount; row++) {
      const countInRow = CONFIG.baseCount - row;
      const rowOffsetX = ((CONFIG.baseCount - countInRow) * stepX) / 2;
      for (let i = 0; i < countInRow; i++) {
        const die = gltf.scene.clone(true);
        die.scale.setScalar(CONFIG.scale);
        die.position.set(
          CONFIG.startX + rowOffsetX + i * stepX,
          CONFIG.yOffset + row * stepY,
          CONFIG.startZ
        );
        setMeshShadow(die);
        this.group.add(die);
      }
    }
    this.parent.add(this.group);
  }
}
