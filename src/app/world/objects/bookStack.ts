/**
 * BookStack — 책 한 종류(GLTF)를 여러 권 쌓아 자연스러운 더미로 렌더
 *
 * - 같은 book 메쉬를 clone해 10권 정도 쌓음
 * - 권마다 y 위치·x/z 미세 오프셋·회전을 줘서 정돈되지 않은 더미 느낌
 */
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';

const BOOK_COUNT = 10;
const BOOK_SCALE = 12;
/** 책 한 권당 세로 간격 (모델 로컬 기준). 겹치지 않게 쌓기 */
const STACK_STEP_Y = 0.093;
/** x/z 랜덤 오프셋 범위 (자연스러운 어긋남) */
const OFFSET_XY = 0.08;
/** y축 회전 랜덤 범위(라디안) */
const ROTATE_Y_RANGE = 0.12;
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

    this.group.scale.setScalar(BOOK_SCALE);
    this.group.position.set(0.32, 0.1, 0);

    for (let i = 1; i <= BOOK_COUNT; i++) {
      const book = gltf.scene.clone(true);
      const box = new THREE.Box3().setFromObject(book);
      const size = new THREE.Vector3();
      box.getSize(size);

      const rx = (seededRandom(i * 7) - 0.5) * 2 * OFFSET_XY;
      const rz = (seededRandom(i * 11 + 1) - 0.5) * 2 * OFFSET_XY;
      const rotY = (seededRandom(i * 13 + 2) - 0.5) * 2 * ROTATE_Y_RANGE;
      const rotX = (seededRandom(i * 17 + 3) - 0.5) * 2 * TILT_RANGE;
      const rotZ = (seededRandom(i * 19 + 4) - 0.5) * 2 * TILT_RANGE;

      book.position.set(rx, i * STACK_STEP_Y, rz);
      book.rotation.set(rotX, rotY, rotZ);

      book.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).castShadow = true;
          (child as THREE.Mesh).receiveShadow = true;

          if (child.name === 'Architexture_1') {
            (child as THREE.Mesh).material.color = new THREE.Color(0x00ff00);
          } else {
            (child as THREE.Mesh).material.color = new THREE.Color(0x000000);
          }
        }
      });

      this.group.add(book);
    }

    this.parent.add(this.group);
  }
}
