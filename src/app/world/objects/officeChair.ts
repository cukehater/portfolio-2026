/**
 * OfficeChair — 맵(주행면) 밖 책상 옆에 배치. y<0으로 책상 위와 분리.
 */
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import { getObjectBoundSize } from '../../utils/objectBounds.ts';

export default class OfficeChair {
  parent: THREE.Object3D;
  group: THREE.Group;

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = gltf.scene.clone(true);

    const deskSize = getObjectBoundSize('office_desk');

    this.group.scale.setScalar(45);
    this.group.position.set(0, -deskSize.y, deskSize.z / 2 - 5);
    this.group.rotation.set(0, Math.PI, 0); // 책상 쪽 바라보기

    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });

    this.parent.add(this.group);
  }
}
