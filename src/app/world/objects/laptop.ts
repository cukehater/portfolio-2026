/**
 * Laptop — 책상 위 노트북
 */
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';

export default class Laptop {
  parent: THREE.Object3D;
  group: THREE.Group;

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = gltf.scene.clone(true);

    this.group.scale.setScalar(7);
    this.group.position.set(0.32, 0.2, 15);
    this.group.rotation.set(0, 0, 0);

    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        console.log('child', child);

        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });

    this.parent.add(this.group);
  }
}
