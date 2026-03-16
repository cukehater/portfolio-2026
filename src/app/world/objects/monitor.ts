/**
 * Monitor — 모니터
 */
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';

const MONITOR_CONFIG = {
  count: 2,
  scale: 45,
  position: [
    [11.6, 5.297, -15],
    [-11.6, 5.297, -15],
  ] as [number, number, number][],
  rotationY: [-0.2, 0.2],
};

export default class Monitor {
  parent: THREE.Object3D;
  group: THREE.Group;

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;

    this.group = new THREE.Group();

    for (let i = 0; i < 2; i++) {
      const monitor = gltf.scene.clone(true);
      monitor.position.set(...MONITOR_CONFIG.position[i]);
      monitor.rotation.y = MONITOR_CONFIG.rotationY[i];
      monitor.scale.setScalar(MONITOR_CONFIG.scale);

      monitor.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).castShadow = true;
          (child as THREE.Mesh).receiveShadow = true;
        }
      });

      this.group.add(monitor);
    }

    this.parent.add(this.group);
  }
}
