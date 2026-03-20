/**
 * Monitor — 모니터
 */
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import { getObjectBounds } from '../../utils/objectBounds.ts';

const CONFIG = {
  scale: 30,
  pairGap: 0.05,
  tiltY: 0.125,
} as const;

function setMeshShadow(target: THREE.Object3D): void {
  target.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = true;
    child.receiveShadow = true;
  });
}

export default class Monitor {
  parent: THREE.Object3D;
  group: THREE.Group;

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = new THREE.Group();

    const monitorStandBounds = getObjectBounds('monitor_stand');

    const probe = gltf.scene.clone(true);
    probe.scale.setScalar(CONFIG.scale);
    const size = new THREE.Box3()
      .setFromObject(probe)
      .getSize(new THREE.Vector3());
    probe.clear();

    const xOffset = size.x / 2 + CONFIG.pairGap;
    const zPosition = monitorStandBounds.position.z;
    const yPosition = monitorStandBounds.size.y;

    for (let i = 0; i < 2; i++) {
      const monitor = gltf.scene.clone(true);
      monitor.scale.setScalar(CONFIG.scale);
      const isLeft = i === 0;

      monitor.position.set(isLeft ? -xOffset : xOffset, yPosition, zPosition);
      monitor.rotation.y = isLeft ? CONFIG.tiltY : -CONFIG.tiltY;
      setMeshShadow(monitor);

      this.group.add(monitor);
    }

    this.parent.add(this.group);
  }
}
