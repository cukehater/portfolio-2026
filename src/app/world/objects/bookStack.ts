/**
 * BookStack — 책 한 종류(GLTF)를 여러 권 쌓아 자연스러운 더미로 렌더
 *
 * - 같은 book 메쉬를 clone해 10권 정도 쌓음
 * - 권마다 y 위치·x/z 미세 오프셋·회전을 줘서 정돈되지 않은 더미 느낌
 * - 메쉬별 색은 MESH_COLORS로 분기, 머티리얼은 clone 후 수정해 공유로 인한 아티팩트 방지
 */
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import { getObjectBounds } from '../../utils/objectBounds.ts';

/** 메쉬 이름별 색 (해당 이름이 없으면 변경하지 않음) */
// const MESH_COLORS: Record<string, number> = {
//   book_cover: 0x000000,
//   book_pages: 0xffffff,
// };

const BOOK_COUNT = 5;
const BOOK_HEIGHT = 0.0339;
/** 책 한 권당 세로 간격 (모델 로컬 기준). 겹치지 않게 쌓기 */
/** x/z 랜덤 오프셋 범위 (자연스러운 어긋남) */
const OFFSET_XY = 0.012;
/** y축 회전 랜덤 범위(라디안) */
const ROTATE_Y_RANGE = 0.2;
/** 책이 살짝 기울어지는 x/z 회전 범위 */
const TILT_RANGE = 0;

/** 시드 고정으로 항상 같은 더미 형태 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

export default class BookStack {
  parent: THREE.Object3D;
  group: THREE.Group;

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = new THREE.Group();

    for (let i = 0; i < BOOK_COUNT; i++) {
      const book = gltf.scene.clone(true);

      const rx = (seededRandom(i * 7) - 0.5) * 2 * OFFSET_XY;
      const rz = (seededRandom(i * 11 + 1) - 0.5) * 2 * OFFSET_XY;
      const rotY = (seededRandom(i * 13 + 2) - 0.5) * 2 * ROTATE_Y_RANGE;
      const rotX = (seededRandom(i * 17 + 3) - 0.5) * 2 * TILT_RANGE;
      const rotZ = (seededRandom(i * 19 + 4) - 0.5) * 2 * TILT_RANGE;

      book.position.set(rx, i * BOOK_HEIGHT, rz);
      book.rotation.set(rotX, rotY, rotZ);

      book.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;

        child.castShadow = true;
        child.receiveShadow = true;

        // const colorHex = MESH_COLORS[child.name];
        // if (colorHex !== undefined) {
        //   const mat = child.material;
        //   const clonedMat = Array.isArray(mat)
        //     ? mat.map((m) => (m as THREE.Material).clone())
        //     : (mat as THREE.Material).clone();
        //   child.material = clonedMat as THREE.MeshStandardMaterial;
        //   if ('color' in child.material && child.material.color)
        //     child.material.color.setHex(colorHex);
        // }
      });

      this.group.add(book);
    }

    this.group.scale.setScalar(25);

    const deskMatBounds = getObjectBounds('desk_mat');

    this.group.position.set(
      -deskMatBounds.size.x / 2 + 3,
      deskMatBounds.size.y,
      deskMatBounds.position.z / 2 + 5
    );
    this.group.rotation.set(0, 0.22, 0);

    this.parent.add(this.group);
  }
}
