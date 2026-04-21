import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import { getObjectBounds } from '@/lib/objectBounds.ts';
const CONFIG = {
  count: 6,
};
export default class StickyNote {
  parent: THREE.Object3D;
  group: THREE.Group;
  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = new THREE.Group();
    const monitorStandBounds = getObjectBounds('monitor_stand');
    const probe = gltf.scene.clone(true);
    probe.scale.setScalar(30);
    const stickyNoteSize = new THREE.Box3()
      .setFromObject(probe)
      .getSize(new THREE.Vector3());
    probe.clear();
    for (let i = 0; i < CONFIG.count; i++) {
      const stickyNote = gltf.scene.clone(true);
      stickyNote.scale.setScalar(30);
      stickyNote.position.set(
        -9 + i * stickyNoteSize.x * 1.25,
        monitorStandBounds.size.y - stickyNoteSize.y / 2,
        monitorStandBounds.position.z + monitorStandBounds.size.z / 2 + 0.1
      );
      stickyNote.rotation.set(Math.PI / 2, 0, 0);
      stickyNote.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).castShadow = true;
          (child as THREE.Mesh).receiveShadow = true;
        }
      });
      this.group.add(stickyNote);
    }
    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });
    this.parent.add(this.group);
  }
}
