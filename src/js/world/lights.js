/**
 * Lights — 씬 환경(배경·안개) + 조명
 *
 * - 배경색·Fog로 분위기 설정
 * - Ambient: 전역 밝기
 * - Directional: 태양처럼 한 방향 조명 + 그림자 맵
 */
import * as THREE from 'three';

export default class Lights {
  constructor(scene) {
    this.scene = scene;
    this.setSceneEnv();
    this.setAmbient();
    this.setDirectional();
  }

  /** 배경색(진한 남색) + 거리 30~80 구간에 안개 */
  setSceneEnv() {
    this.scene.background = new THREE.Color(0x1a1a2e);
    this.scene.fog = new THREE.Fog(0x1a1a2e, 30, 80);
  }

  /** 전역 환경광 — 그림자 없이 전체를 골고루 밝게 */
  setAmbient() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);
  }

  /** 방향광(태양): 위치에서 반대 방향으로 빛. 그림자 맵 2048, 범위 -30~30 */
  setDirectional() {
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -30;
    dirLight.shadow.camera.right = 30;
    dirLight.shadow.camera.top = 30;
    dirLight.shadow.camera.bottom = -30;
    this.scene.add(dirLight);
  }
}
