/**
 * World — 3D 씬에 들어갈 모든 오브젝트를 조합하는 컨테이너
 *
 * - 조명(Lights), GLB 모델·Cybertruck(Car) 생성. 매 프레임 Car update.
 */
import * as THREE from 'three';
import App from '../index.ts';
import Lights from './lights.ts';
import { Car, createSceneModels } from './objects/index.ts';

export default class World {
  app: App;
  scene: THREE.Scene;
  lights: Lights;
  car: Car | null;

  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    this.lights = new Lights(this.scene);
    this.car = null;

    this.app.resources.on('ready', () => {
      createSceneModels(this.scene, this.app.resources);
      // this.car = new Car(this.scene, this.app);
    });
  }

  update(): void {
    this.car?.update();
  }
}
