import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import { getObjectBounds } from '@/lib/objectBounds.ts';
export default class Phone {
  parent: THREE.Object3D;
  group: THREE.Group;
  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = gltf.scene.clone(true);
    const deskMatBounds = getObjectBounds('desk_mat');
    this.group.scale.setScalar(45);
    this.group.position.set(
      deskMatBounds.size.x / 2 - 2.5,
      deskMatBounds.size.y,
      deskMatBounds.position.z / 2 + 6
    );
    this.group.rotation.set(0, Math.PI / 0.75, 0);
    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });
    this.parent.add(this.group);
  }
}
