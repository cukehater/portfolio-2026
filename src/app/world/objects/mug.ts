/**
 * Mug — 머그컵
 */
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import { getObjectBounds } from '../../utils/objectBounds.ts';

export default class Mug {
  parent: THREE.Object3D;
  group: THREE.Group;

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = gltf.scene.clone(true);

    this.group.scale.setScalar(25);

    const deskMatBounds = getObjectBounds('desk_mat');

    this.group.position.set(
      deskMatBounds.size.x / 2 - 4,
      deskMatBounds.size.y,
      deskMatBounds.position.z / 2 + 2
    );
    this.group.rotation.set(0, -Math.PI / 4, 0);

    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });

    this.parent.add(this.group);
  }
}
