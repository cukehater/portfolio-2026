/**
 * ComputerSpeaker — 책상 위 스피커 (모니터 양쪽)
 */
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';

export default class ComputerSpeaker {
  parent: THREE.Object3D;
  group: THREE.Group;

  constructor(
    parent: THREE.Object3D,
    gltf: GLTF,
    side: 'left' | 'right' = 'left'
  ) {
    this.parent = parent;
    this.group = gltf.scene.clone(true);

    const x = side === 'left' ? -0.38 : 0.38;
    this.group.scale.setScalar(1.5);
    this.group.position.set(x, 0.12, -0.22);
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
