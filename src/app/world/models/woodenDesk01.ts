import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import type { ModelConfig } from './types.ts';

export const woodenDesk01: ModelConfig = {
  source: {
    name: 'woodenDesk01',
    type: 'gltfModel',
    path: '/models/wooden_desk_01/wooden_desk_01.glb',
  },
  place(scene: THREE.Scene, model: GLTF) {
    const cloned = model.scene.clone(true);
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    cloned.position.set(0, 0, 0);
    cloned.rotation.set(0, 0, 0);
    cloned.scale.setScalar(5);
    scene.add(cloned);
  },
};
