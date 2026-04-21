import { registerObjectBounds } from '@/lib/objectBounds.ts';
import * as THREE from 'three';
import type { Group, Object3D } from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
export default class DeskMat {
  parent: Object3D;
  group: Group;
  constructor(parent: Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = gltf.scene.clone(true);
    const textureLoader = new THREE.TextureLoader();
    this.group.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const matcap = textureLoader.load('/textures/matcaps/yellow.png');
      matcap.colorSpace = THREE.SRGBColorSpace;
      child.material = new THREE.MeshMatcapMaterial({ matcap });
    });
    registerObjectBounds(this.group, 'desk_mat');
    this.parent.add(this.group);
  }
}
