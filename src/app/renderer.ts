/**
 * Renderer — WebGL로 씬을 캔버스에 그리는 역할
 *
 * - antialias로 계단 현상 완화
 * - shadowMap으로 DirectionalLight 그림자 표시 (PCFShadowMap)
 * - 매 프레임 scene + camera로 한 프레임 렌더
 */
import * as THREE from 'three';
import App from './index.ts';
import Camera from './camera.ts';
import Sizes from './utils/sizes.ts';

export default class Renderer {
  app: App;
  canvas: HTMLCanvasElement | null;
  sizes: InstanceType<typeof Sizes>;
  scene: THREE.Scene;
  camera: Camera;
  instance!: THREE.WebGLRenderer;

  constructor() {
    this.app = new App();
    this.canvas = this.app.canvas;
    this.sizes = this.app.sizes;
    this.scene = this.app.scene;
    this.camera = this.app.camera;

    this.setInstance();
  }

  setInstance(): void {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas as HTMLCanvasElement,
      antialias: true,
    });
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFShadowMap;
    /** 노출이 너무 높으면 그림자·하이라이트 대비가 줄어듦 */
    this.instance.toneMappingExposure = 1.02;
  }

  resize(): void {
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
  }

  update(): void {
    this.instance.render(this.scene, this.camera.instance);
  }
}
