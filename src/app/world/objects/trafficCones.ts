/**
 * TrafficCones — 교통 콘 (면허 시험장 슬라롬 코스)
 * S자 곡선 형태를 유지한 채 두 줄로 배치 (총 24개)
 */
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';

const CONE_COUNT_PER_ROW = 8;
const ROW_COUNT = 2;
const CONE_SCALE = 5;
/** 콘 간격 (진행 방향) */
const Z_SPACING = 3;
/** S자 곡선의 좌우 폭 (진폭) */
const X_AMPLITUDE = 1;
/** 두 줄 사이 간격 (곡선 중심에서 좌/우로 밀어낸 거리) */
const ROW_OFFSET = 3;
/** 코스 전체를 배치할 기준 위치 (맵 그룹 로컬) */
const COURSE_ORIGIN: [number, number, number] = [-47, 0.12, 7];

export default class TrafficCones {
  parent: THREE.Object3D;
  group: THREE.Group;

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.parent = parent;
    this.group = new THREE.Group();
    this.group.name = 'TrafficConeCourse';

    for (let row = 0; row < ROW_COUNT; row++) {
      const rowSign = row === 0 ? -1 : 1;
      for (let i = 0; i < CONE_COUNT_PER_ROW; i++) {
        const cone = gltf.scene.clone(true);
        cone.scale.setScalar(CONE_SCALE);

        const t = (i / (CONE_COUNT_PER_ROW - 1)) * 2 * Math.PI;
        const curveX = X_AMPLITUDE * Math.sin(t);
        const x = curveX + rowSign * ROW_OFFSET;
        const z = i * Z_SPACING;

        cone.position.set(x, 0, z);
        cone.rotation.set(0, Math.PI / 6, 0);

        cone.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            (child as THREE.Mesh).castShadow = true;
            (child as THREE.Mesh).receiveShadow = true;
          }
        });

        this.group.add(cone);
      }
    }

    this.group.position.set(...COURSE_ORIGIN);
    this.parent.add(this.group);
  }
}
