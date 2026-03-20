/**
 * StickyNotePad — 스티커 노트 패드
 */
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import { getObjectBounds } from '../../utils/objectBounds.ts';

export default class StickyNotePad {
  parent: THREE.Object3D;
  group: THREE.Group;

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = gltf.scene.clone(true);

    const monitorStandBounds = getObjectBounds('monitor_stand');

    this.group.scale.setScalar(30);
    this.group.position.set(
      -2,
      monitorStandBounds.size.y,
      monitorStandBounds.position.z + 2
    );
    this.group.rotation.set(0, Math.PI / -0.14, 0);

    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });

    this.parent.add(this.group);
  }
}
