import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import { getObjectBoundSize } from '@/lib/objectBounds.ts';
export default class StandLamp {
  parent: THREE.Object3D;
  group: THREE.Group;
  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = gltf.scene.clone(true);
    const officeDeskSize = getObjectBoundSize('office_desk');
    this.group.scale.setScalar(30);
    this.group.position.set(officeDeskSize.x / 2 - 12, 0, 0);
    this.group.rotation.set(0, -Math.PI / 2, 0);
    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });
    this.parent.add(this.group);
  }
}
