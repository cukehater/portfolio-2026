import * as THREE from 'three';
import App from './index.ts';
import type Camera from './camera.ts';
import type Sizes from './lib/sizes.ts';

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
    this.instance.toneMapping = THREE.ReinhardToneMapping;
    this.instance.toneMappingExposure = 3;
    this.instance.outputColorSpace = THREE.SRGBColorSpace;
  }

  resize(): void {
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
  }

  update(): void {
    this.instance.render(this.scene, this.camera.instance);
  }
}
