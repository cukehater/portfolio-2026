import {
  getObjectBoundSize,
  registerObjectBounds,
} from '@/lib/object-bounds.ts';
import { applyTextureToMeshes } from '@/lib/apply-texture-to-meshes.ts';
import type { Group, Object3D } from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';

export default class DeskMat {
  parent: Object3D;
  group: Group;

  constructor(parent: Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = gltf.scene.clone(true);

    this.setPosition();
    this.setTexture();

    this.parent.add(this.group);
    registerObjectBounds(this.group, 'desk_mat');
  }

  setTexture() {
    applyTextureToMeshes(this.group, [
      {
        name: 'desk_mat',
        type: 'matcap',
      },
    ]);
  }

  setPosition() {
    const deskSize = getObjectBoundSize('office_desk');
    this.group.position.set(0, 0, deskSize.z / 4);
  }
}
