/**
 * ToiletRoll — 화장지 (방 구석/장식)
 */
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';

export default class ToiletRoll {
  parent: THREE.Object3D;
  group: THREE.Group;

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = gltf.scene.clone(true);

    this.group.scale.setScalar(1.2);
    this.group.position.set(2.2, 0.15, 2);
    this.group.rotation.set(0, 0, 0);

    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });

    this.parent.add(this.group);
  }
}
