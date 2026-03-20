/**
 * OfficeDesk — 책상
 * Matcap 텍스처로 조명과 무관한 부드러운 음영 (씬 라이트 영향 적음)
 */
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import {
  getObjectBoundSize,
  registerObjectBounds,
} from '../../utils/objectBounds.ts';

// const MATCAP_PATH = '/textures/matcap01.png';

export default class OfficeDesk {
  parent: THREE.Object3D;
  group: THREE.Group;

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;

    this.group = gltf.scene.clone(true);

    this.group.scale.setScalar(45);
    this.group.position.set(0, 0, 0);
    this.group.rotation.set(0, 0, 0);
    this.group.updateMatrixWorld(true);

    registerObjectBounds(this.group, 'office_desk');
    const officeDeskSize = getObjectBoundSize('office_desk');

    this.group.position.y = -officeDeskSize.y; // 위면이 y=0(floor = desk top)이 되도록

    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });

    this.parent.add(this.group);

    // const textureLoader = new THREE.TextureLoader();
    // textureLoader.load(MATCAP_PATH, (matcap) => {
    //   matcap.colorSpace = THREE.SRGBColorSpace;
    //   this.group.traverse((child) => {
    //     if (!(child as THREE.Mesh).isMesh) return;
    //     const mesh = child as THREE.Mesh;
    //     const prev = mesh.material;
    //     if (Array.isArray(prev)) {
    //       prev.forEach((m) => m.dispose());
    //     } else if (prev) {
    //       prev.dispose();
    //     }
    //     mesh.material = new THREE.MeshMatcapMaterial({ matcap });
    //   });
    // });
  }
}
