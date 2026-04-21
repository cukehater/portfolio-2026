import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import { registerObjectBounds } from '@/lib/objectBounds.ts';
import { setShadowsToMeshes } from '@/lib/setShadowsToMeshes.ts';
import { applyMatcapToMeshes } from '@/lib/applyMatcapToMeshes.ts';
const DESK_MATCAP = '/textures/matcaps/beige.png';
export default class OfficeDesk {
  parent: THREE.Object3D;
  group: THREE.Group;
  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = gltf.scene.clone(true);
    registerObjectBounds(this.group, 'office_desk');
    setShadowsToMeshes(this.group, ['office_desk']);
    applyMatcapToMeshes(DESK_MATCAP, this.group, 0xfffff0);
    this.parent.add(this.group);
  }
}
