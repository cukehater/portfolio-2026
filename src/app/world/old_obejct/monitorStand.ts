import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import {
  getObjectBoundSize,
  registerObjectBounds,
} from '@/lib/objectBounds.ts';
export default class MonitorStand {
  parent: THREE.Object3D;
  group: THREE.Group;
  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = gltf.scene.clone(true);
    this.group.scale.setScalar(30);
    const officeDeskSize = getObjectBoundSize('office_desk');
    const box = new THREE.Box3().setFromObject(this.group);
    const size = box.getSize(new THREE.Vector3());
    this.group.position.set(0, 0, -officeDeskSize.z / 2 + size.z / 2 + 3);
    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });
    registerObjectBounds(this.group, 'monitor_stand');
    this.parent.add(this.group);
  }
}
