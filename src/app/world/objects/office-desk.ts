import type * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import { registerObjectBounds } from '@/lib/object-bounds.ts';
import { applyTextureToMeshes } from '@/lib/apply-texture-to-meshes.ts';
import { loadMapTexture } from '@/lib/load-map-texture.ts';

export default class OfficeDesk {
  parent: THREE.Object3D;
  group: THREE.Group;

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = gltf.scene.clone(true);

    this.setTexture();
    this.parent.add(this.group);

    registerObjectBounds(this.group, 'office_desk');
  }

  setTexture() {
    const map = loadMapTexture('/textures/maps/wood.jpg', { x: 20, y: 20 });

    applyTextureToMeshes(this.group, [
      {
        name: 'office_desk',
        type: 'matcap',
        options: {
          map,
        },
      },
    ]);
  }
}
