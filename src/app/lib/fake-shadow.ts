import * as THREE from 'three';

/**
 * Three.js Journey — Haunted House / Shadows 레슨의 **Dynamic fake shadow** 패턴.
 *
 * ```text
 * const sphereShadow = new THREE.Mesh(
 *   new THREE.PlaneGeometry(1.5, 1.5),
 *   new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, alphaMap: simpleShadow }),
 * );
 * sphereShadow.rotation.x = -Math.PI * 0.5;
 * sphereShadow.position.y = plane.position.y + 0.01;
 * scene.add(sphere, sphereShadow, plane);
 *
 * // tick
 * sphereShadow.position.x = sphere.position.x;
 * sphereShadow.position.z = sphere.position.z;
 * sphereShadow.material.opacity = (1 - sphere.position.y) * 0.3;
 * ```
 *
 * 본체(`target`)와 그림자는 **같은 parent** 아래 **형제**로 두는 것이 튜토리얼과 동일합니다.
 */
const SIMPLE_SHADOW_URL = '/textures/simpleShadow.jpg';

let sharedAlphaMap: THREE.Texture | null = null;

function getSimpleShadowAlphaMap(): THREE.Texture {
  if (!sharedAlphaMap) {
    const loader = new THREE.TextureLoader();
    sharedAlphaMap = loader.load(SIMPLE_SHADOW_URL);
    sharedAlphaMap.colorSpace = THREE.NoColorSpace;
  }
  return sharedAlphaMap;
}

export type CreateTutorialFakeShadowMeshOptions = {
  name?: string;
  /** 튜토리얼 기본값 `1.5` */
  planeSize?: number;
};

/**
 * `PlaneGeometry` + `MeshBasicMaterial`(검정, transparent, alphaMap) — 튜토리얼과 동일.
 * 씬에는 `parent.add(target); parent.add(shadow);` 순으로 형제로 붙입니다.
 */
export function createTutorialFakeShadowMesh(
  options: CreateTutorialFakeShadowMeshOptions = {}
): THREE.Mesh {
  const planeSize = options.planeSize ?? 1.5;
  const alphaMap = getSimpleShadowAlphaMap();
  const material = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    alphaMap,
  });
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(planeSize, planeSize),
    material
  );
  mesh.name = options.name ?? 'tutorial_fake_shadow';
  mesh.rotation.x = -Math.PI * 0.5;
  return mesh;
}

export type SyncTutorialFakeShadowOptions = {
  /**
   * 튜토리얼의 `sphere.position.y` (보통 0~1).
   * 생략 시 `0` → 바닥에 붙은 것처럼 `opacity = 0.3`.
   */
  bounceY?: number;
};

/**
 * tick마다 호출 — 튜토리얼과 동일한 세 줄을 한 함수로 묶음.
 *
 * - `shadow.position.x = target.position.x`
 * - `shadow.position.z = target.position.z`
 * - `shadow.position.y = floorYLocal + 0.01`
 * - `material.opacity = (1 - bounceY) * 0.3`
 */
export function syncTutorialFakeShadow(
  shadow: THREE.Mesh,
  target: THREE.Object3D,
  floorYLocal: number,
  options: SyncTutorialFakeShadowOptions = {}
): void {
  shadow.position.x = target.position.x;
  shadow.position.z = target.position.z;
  shadow.position.y = floorYLocal + 0.01;

  const y = Math.min(Math.max(options.bounceY ?? 0, 0), 1);
  const mat = shadow.material as THREE.MeshBasicMaterial;
  mat.opacity = (1 - y) * 0.3;
}
