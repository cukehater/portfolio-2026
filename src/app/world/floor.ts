/**
 * Floor — 바닥면 + 그리드
 */
import * as THREE from 'three';

export default class Floor {
  scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.setFloor();
    this.setGrid();
  }

  setFloor(): void {
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x16213e });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  setGrid(): void {
    const gridHelper = new THREE.GridHelper(60, 30, 0x00ff8822, 0x00ff8811);
    this.scene.add(gridHelper);
  }
}
