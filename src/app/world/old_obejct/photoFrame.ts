import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import { getObjectBounds } from '@/lib/objectBounds.ts';
export default class PhotoFrame {
  parent: THREE.Object3D;
  group: THREE.Group;
  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = gltf.scene.clone(true);
    this.group.scale.setScalar(30);
    const monitorStandBounds = getObjectBounds('monitor_stand');
    this.group.position.set(
      monitorStandBounds.size.x / 2 - 1,
      0,
      monitorStandBounds.position.z / 2 + 1
    );
    this.group.rotation.set(0, -Math.PI / 6, 0);
    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });
    this.parent.add(this.group);
  }
}
