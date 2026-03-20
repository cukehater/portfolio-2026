/**
 * Keycaps — 조작키 안내 키캡 (방향키 ↑↓←→ 배치)
 */
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import { getObjectBoundSize } from '../../utils/objectBounds.ts';

const CONFIG = {
  arrowLayout: [
    { position: [0, 0, -1] as [number, number, number], rotationY: 0 }, // ↑
    { position: [0, 0, 0] as [number, number, number], rotationY: Math.PI }, // ↓
    {
      position: [-1, 0, 0] as [number, number, number],
      rotationY: Math.PI / 2,
    }, // ←
    {
      position: [1, 0, 0] as [number, number, number],
      rotationY: -Math.PI / 2,
    }, // →
  ],
  spacing: 0.012,
} as const;

export default class Keycaps {
  parent: THREE.Object3D;
  group: THREE.Group;

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = new THREE.Group();

    for (let i = 0; i < 4; i++) {
      const keycap = gltf.scene.clone(true);
      const layout = CONFIG.arrowLayout[i];
      keycap.position.set(
        layout.position[0] * CONFIG.spacing,
        layout.position[1] * CONFIG.spacing,
        layout.position[2] * CONFIG.spacing
      );
      keycap.rotation.y = layout.rotationY;
      keycap.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).castShadow = true;
          (child as THREE.Mesh).receiveShadow = true;
        }
      });
      this.group.add(keycap);
    }

    const officeDeskSize = getObjectBoundSize('office_desk');

    this.group.scale.setScalar(65);
    this.group.position.set(officeDeskSize.x / 2 - 4, 0, 9);
    this.group.rotation.y = -Math.PI / 2;

    this.parent.add(this.group);
  }
}
