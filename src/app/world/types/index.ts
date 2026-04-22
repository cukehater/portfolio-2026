import type * as THREE from 'three';

export type ObjectBoundEntry = {
  size: THREE.Vector3;
  position: THREE.Vector3;
};

export type ObjectBoundKey = Record<string, ObjectBoundEntry>;
