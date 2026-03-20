/**
 * Lights — 씬 환경(배경·안개) + 조명
 */
import * as THREE from 'three';
import type App from '../index.ts';
import type Debug from '../utils/debug.ts';

export default class Lights {
  scene: THREE.Scene;
  app: App;
  debug: Debug;
  ambientLight!: THREE.AmbientLight;
  hemisphereLight!: THREE.HemisphereLight;
  dirLight!: THREE.DirectionalLight;

  constructor(scene: THREE.Scene, app: App) {
    this.scene = scene;
    this.app = app;
    this.debug = app.debug;
    this.setSceneEnv();
    this.setAmbient();
    this.setHemisphere();
    this.setDirectional();
  }

  setSceneEnv(): void {
    this.scene.background = new THREE.Color(0x1a1a2e);
    // this.scene.fog = new THREE.Fog(0x1a1a2e, 30, 80);
  }

  setAmbient(): void {
    /**
     * 너무 높으면 그림자 구역까지 밝아져 그림자가 안 보임.
     * 방향광으로 밝기를 주고, 여기서는 은은한 바운스만.
     */
    this.ambientLight = new THREE.AmbientLight(0xfff5e0, 0.38);
    this.scene.add(this.ambientLight);
  }

  /** 앰비언트만 있을 때보다 자연스럽게 — 강도는 낮게(그림자 대비 유지) */
  setHemisphere(): void {
    this.hemisphereLight = new THREE.HemisphereLight(0xe8f0ff, 0x3a3228, 0.22);
    this.scene.add(this.hemisphereLight);
  }

  setDirectional(): void {
    /** 메인 태양광 — 강할수록 그림자 대비가 살아남 */
    this.dirLight = new THREE.DirectionalLight(0xfff8f0, 1.75);
    this.dirLight.position.set(60, 75, 55);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 4096;
    this.dirLight.shadow.mapSize.height = 4096;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 150;
    this.dirLight.shadow.camera.left = -60;
    this.dirLight.shadow.camera.right = 60;
    this.dirLight.shadow.camera.top = 60;
    this.dirLight.shadow.camera.bottom = -60;
    this.dirLight.shadow.bias = -0.001;
    this.dirLight.shadow.normalBias = 0.02;

    this.scene.add(this.dirLight);
    // this.scene.add(new THREE.CameraHelper(this.dirLight.shadow.camera));
  }
}
