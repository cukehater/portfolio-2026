import * as THREE from 'three';
import type App from '../index.ts';
import type Debug from '@/lib/debug.ts';
const LIGHTS_CONFIG = {
  backgroundTopLeft: '#cfe5ff',
  backgroundTopRight: '#f6dcc3',
  backgroundBottomRight: '#f2c28d',
  backgroundBottomLeft: '#d7b08a',
} as const;
export default class Lights {
  scene: THREE.Scene;
  app: App;
  debug: Debug;
  private backgroundTexture: THREE.DataTexture | null = null;
  private background = {
    topLeft: LIGHTS_CONFIG.backgroundTopLeft,
    topRight: LIGHTS_CONFIG.backgroundTopRight,
    bottomRight: LIGHTS_CONFIG.backgroundBottomRight,
    bottomLeft: LIGHTS_CONFIG.backgroundBottomLeft,
  };
  constructor(scene: THREE.Scene, app: App) {
    this.scene = scene;
    this.app = app;
    this.debug = app.debug;
    this.setSceneEnv();
    this.setGui();
  }
  setSceneEnv(): void {
    this.applyFolioBackground();
    this.scene.fog = null;
  }
  private applyFolioBackground(): void {
    const topLeft = new THREE.Color(this.background.topLeft);
    const topRight = new THREE.Color(this.background.topRight);
    const bottomRight = new THREE.Color(this.background.bottomRight);
    const bottomLeft = new THREE.Color(this.background.bottomLeft);
    topLeft.convertLinearToSRGB();
    topRight.convertLinearToSRGB();
    bottomRight.convertLinearToSRGB();
    bottomLeft.convertLinearToSRGB();
    const data = new Uint8Array([
      Math.round(bottomLeft.r * 255),
      Math.round(bottomLeft.g * 255),
      Math.round(bottomLeft.b * 255),
      255,
      Math.round(bottomRight.r * 255),
      Math.round(bottomRight.g * 255),
      Math.round(bottomRight.b * 255),
      255,
      Math.round(topLeft.r * 255),
      Math.round(topLeft.g * 255),
      Math.round(topLeft.b * 255),
      255,
      Math.round(topRight.r * 255),
      Math.round(topRight.g * 255),
      Math.round(topRight.b * 255),
      255,
    ]);
    this.backgroundTexture?.dispose();
    this.backgroundTexture = new THREE.DataTexture(data, 2, 2);
    this.backgroundTexture.colorSpace = THREE.SRGBColorSpace;
    this.backgroundTexture.magFilter = THREE.LinearFilter;
    this.backgroundTexture.minFilter = THREE.LinearFilter;
    this.backgroundTexture.needsUpdate = true;
    this.scene.background = this.backgroundTexture;
  }
  private setGui(): void {
    const folder = this.debug.gui.addFolder('💡 Lights');
    folder
      .addColor(this.background, 'topLeft')
      .name('BG Top Left')
      .onChange(() => this.applyFolioBackground());
    folder
      .addColor(this.background, 'topRight')
      .name('BG Top Right')
      .onChange(() => this.applyFolioBackground());
    folder
      .addColor(this.background, 'bottomRight')
      .name('BG Bottom Right')
      .onChange(() => this.applyFolioBackground());
    folder
      .addColor(this.background, 'bottomLeft')
      .name('BG Bottom Left')
      .onChange(() => this.applyFolioBackground());
    folder.close();
  }
}
