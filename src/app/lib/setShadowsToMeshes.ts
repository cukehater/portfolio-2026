import * as THREE from 'three';
export const setShadowsToMeshes = (
  group: THREE.Group,
  names: string[],
  options: {
    castShadow?: boolean;
    receiveShadow?: boolean;
  } = {
    castShadow: true,
    receiveShadow: true,
  }
) => {
  group.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    for (const name of names) {
      if (child.name === name) {
        child.castShadow = options.castShadow ?? true;
        child.receiveShadow = options.receiveShadow ?? true;
      }
    }
  });
};
