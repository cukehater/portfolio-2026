/**
 * Renderer — WebGL로 씬을 캔버스에 그리는 역할
 *
 * - antialias로 계단 현상 완화
 * - shadowMap으로 DirectionalLight 그림자 표시 (PCFSoftShadowMap)
 * - 매 프레임 scene + camera로 한 프레임 렌더
 */
import * as THREE from 'three';
import App from './app.js';

export default class Renderer {
  constructor() {
    this.app = new App();
    this.canvas = this.app.canvas;
    this.sizes = this.app.sizes;
    this.scene = this.app.scene;
    this.camera = this.app.camera;

    this.setInstance();
  }

  /** WebGL 렌더러 생성, 해상도·픽셀비·그림자 설정 */
  setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  /** 창 크기 변경 시 렌더 출력 크기·픽셀비 갱신 */
  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
  }

  /** 매 프레임: 현재 씬과 카메라로 한 장면 렌더 */
  update() {
    this.instance.render(this.scene, this.camera.instance);
  }
}
