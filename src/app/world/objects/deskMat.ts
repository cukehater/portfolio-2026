/**
 * DeskMat — 매트
 */
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import {
  getObjectBoundSize,
  registerObjectBounds,
} from '../../utils/objectBounds.ts';

export default class DeskMat {
  parent: THREE.Object3D;
  group: THREE.Group;

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;

    this.group = gltf.scene.clone(true);
    this.group.scale.set(14, 10, 18);

    const officeDeskSize = getObjectBoundSize('office_desk');

    this.group.position.set(0, 0, officeDeskSize.z / 2 - 11);

    registerObjectBounds(this.group, 'desk_mat');

    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
        });

        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });

    this.parent.add(this.group);
    // this.setMatcap();
  }

  setMatcap(): void {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/textures/matcap01.png', (matcap) => {
      matcap.colorSpace = THREE.SRGBColorSpace;
      this.group.traverse((child) => {
        if (!(child as THREE.Mesh).isMesh) return;
        const mesh = child as THREE.Mesh;
        const prev = mesh.material;
        if (Array.isArray(prev)) {
          prev.forEach((m) => m.dispose());
        } else if (prev) {
          prev.dispose();
        }
        mesh.material = new THREE.MeshMatcapMaterial({ matcap });
      });
    });
  }
}
