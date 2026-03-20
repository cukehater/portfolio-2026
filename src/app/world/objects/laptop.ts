/**
 * Laptop — 노트북
 */
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import { getObjectBounds } from '../../utils/objectBounds.ts';

export default class Laptop {
  parent: THREE.Object3D;
  group: THREE.Group;

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = gltf.scene.clone(true);

    const deskMatBounds = getObjectBounds('desk_mat');

    this.group.scale.setScalar(20);
    this.group.position.set(
      0,
      deskMatBounds.size.y / 2,
      deskMatBounds.position.z / 2 + 3
    );

    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });

    this.parent.add(this.group);
  }
}
