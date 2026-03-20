/**
 * objectBounds — 오브젝트 바운딩 박스 등록·조회
 *
 * - registerObjectBounds: 월드 기준 AABB 크기·중심을 world.objectBounds에 등록
 * - getObjectBounds / getObjectBoundSize / getObjectBoundPosition: 등록값 조회
 */
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

/**
 * 특정 모델의 바운딩 엔트리(size + position)를 반환한다.
 * 해당 키가 등록되지 않은 경우, 0 벡터 기반 기본값을 반환한다.
 */
export function getObjectBounds(key: string): ObjectBoundEntry {
  const bounds = getApp().world.objectBounds[key];
  if (bounds) return bounds;
  return {
    size: new THREE.Vector3(0, 0, 0),
    position: new THREE.Vector3(0, 0, 0),
  };
}

/**
 * 특정 모델의 바운딩 사이즈를 반환한다.
 * 해당 키가 등록되지 않은 경우 (0,0,0) Vector3를 반환한다.
 */
export function getObjectBoundSize(key: string): THREE.Vector3 {
  return getObjectBounds(key).size;
}

/**
 * 특정 모델의 월드 기준 AABB 중심 위치를 반환한다.
 * 미등록 시 (0,0,0) Vector3.
 */
export function getObjectBoundPosition(key: string): THREE.Vector3 {
  return getObjectBounds(key).position;
}
