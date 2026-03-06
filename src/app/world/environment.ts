import * as THREE from 'three';
import App from '../index.ts';
import Resources from '../utils/resources.ts';

export default class Environment {
  app: App;
  scene: THREE.Scene;
  resources: InstanceType<typeof Resources>;
  sunLight!: THREE.DirectionalLight;

  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    this.resources = this.app.resources;

    this.setSunLight();
  }

  setSunLight(): void {
    this.sunLight = new THREE.DirectionalLight('#ffffff', 4);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.far = 15;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.normalBias = 0.05;
    this.sunLight.position.set(3.5, 2, -1.25);
    this.scene.add(this.sunLight);
  }
}
