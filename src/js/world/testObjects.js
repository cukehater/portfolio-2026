/**
 * TestObjects — 장애물/장식용 큐브·원기둥
 *
 * - 큐브 12개: 원형으로 배치 (반지름 6~14), 랜덤 크기·색
 * - 원기둥 6개: -12~12 구간에 랜덤 위치
 */
import * as THREE from 'three';

const CUBE_COLORS = [0xff4466, 0xffaa00, 0x4488ff, 0xcc44ff, 0xff6600];

export default class TestObjects {
  constructor(scene) {
    this.scene = scene;
    this.setCubes();
    this.setCylinders();
  }

  /** 12개 큐브를 원형으로 배치, 크기·색 랜덤 */
  setCubes() {
    for (let i = 0; i < 12; i++) {
      const size = 0.5 + Math.random() * 0.8;
      const geo = new THREE.BoxGeometry(size, size, size);
      const mat = new THREE.MeshLambertMaterial({
        color: CUBE_COLORS[Math.floor(Math.random() * CUBE_COLORS.length)],
      });
      const mesh = new THREE.Mesh(geo, mat);
      const angle = (i / 12) * Math.PI * 2;
      const radius = 6 + Math.random() * 8;
      mesh.position.set(
        Math.cos(angle) * radius,
        size / 2,
        Math.sin(angle) * radius
      );
      mesh.castShadow = true;
      this.scene.add(mesh);
    }
  }

  /** 원기둥 6개를 넓은 범위에 랜덤 배치 */
  setCylinders() {
    for (let i = 0; i < 6; i++) {
      const geo = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 12);
      const mat = new THREE.MeshLambertMaterial({ color: 0x445566 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 24,
        0.75,
        (Math.random() - 0.5) * 24
      );
      mesh.castShadow = true;
      this.scene.add(mesh);
    }
  }
}
