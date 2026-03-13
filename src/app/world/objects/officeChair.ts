/**
 * OfficeChair — 맵(주행면) 밖 책상 옆에 배치. y<0으로 책상 위와 분리.
 */
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';

export default class OfficeChair {
  parent: THREE.Object3D;
  group: THREE.Group;

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = gltf.scene.clone(true);

    this.group.scale.setScalar(70);
    this.group.position.set(0, -57.599992752075195, 25); // 맵 밖(x=35), 방 바닥(y=-0.5)
    this.group.rotation.set(0, Math.PI, 0); // 책상 쪽 바라보기

    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        // (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });

    this.parent.add(this.group);
  }
}
