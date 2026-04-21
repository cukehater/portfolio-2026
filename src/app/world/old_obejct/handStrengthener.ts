import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
export default class HandStrengthener {
  parent: THREE.Object3D;
  group: THREE.Group;
  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = gltf.scene.clone(true);
    this.group.scale.setScalar(10);
    this.group.position.set(12, 0.12, 10);
    this.group.rotation.set(0, Math.PI / 3, 0);
    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });
    this.parent.add(this.group);
  }
}
