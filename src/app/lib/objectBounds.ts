import * as THREE from 'three';
import { getApp } from '../index.ts';
import type { ObjectBoundEntry } from '../world/world.ts';
export function registerObjectBounds(
  object: THREE.Object3D,
  key: string
): void {
  object.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(object);
  getApp().world.objectBounds[key] = {
    size: box.getSize(new THREE.Vector3()),
    position: box.getCenter(new THREE.Vector3()),
  };
}
export function getObjectBounds(key: string): ObjectBoundEntry {
  const bounds = getApp().world.objectBounds[key];
  if (bounds) return bounds;
  return {
    size: new THREE.Vector3(0, 0, 0),
    position: new THREE.Vector3(0, 0, 0),
  };
}
export function getObjectBoundSize(key: string): THREE.Vector3 {
  return getObjectBounds(key).size;
}
export function getObjectBoundPosition(key: string): THREE.Vector3 {
  return getObjectBounds(key).position;
}
