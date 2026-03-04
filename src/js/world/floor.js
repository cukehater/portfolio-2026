/**
 * Floor — 바닥면 + 그리드
 *
 * - 60x60 평면을 X축 -90° 회전해서 수평 바닥으로 사용
 * - GridHelper로 격자선을 그려 위치감을 줌
 */
import * as THREE from 'three';

export default class Floor {
  constructor(scene) {
    this.scene = scene;
    this.setFloor();
    this.setGrid();
  }

  /** 60x60 Plane을 눕혀서 바닥으로 추가, 그림자 수신 */
  setFloor() {
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x16213e });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2; // 기본이 XY면이므로 X -90°로 수평면으로
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  /** 60 범위에 30칸 격자, 초록 톤으로 표시 */
  setGrid() {
    const gridHelper = new THREE.GridHelper(60, 30, 0x00ff8822, 0x00ff8811);
    this.scene.add(gridHelper);
  }
}
