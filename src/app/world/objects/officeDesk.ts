/**
 * OfficeDesk — 책상 (오피스 레이아웃 기준점)
 */
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';

export default class OfficeDesk {
  parent: THREE.Object3D;
  group: THREE.Group;

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = gltf.scene.clone(true);

    this.group.scale.setScalar(80);
    this.group.position.set(0, 0, 0);
    this.group.rotation.set(0, 0, 0);
    this.group.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(this.group);
    this.group.position.y = -box.max.y; // 위면이 y=0(floor = desk top)이 되도록

    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });

    this.parent.add(this.group);
  }
}
