/**
 * World — 3D 씬에 들어갈 모든 오브젝트를 조합하는 컨테이너
 *
 * - 조명(Lights), GLB 모델·Cybertruck(Car) 생성. 매 프레임 Car update.
 */
import * as THREE from 'three';
import App from '../index.ts';
import Lights from './lights.ts';
import { Car, createSceneModels } from './objects/index.ts';

/** 등록된 오브젝트 바운딩: 월드 기준 AABB 크기 + 중심 위치 */
export type ObjectBoundEntry = {
  size: THREE.Vector3;
  position: THREE.Vector3;
};

export type ObjectBoundKey = Record<string, ObjectBoundEntry>;

export default class World {
  app: App;
  scene: THREE.Scene;
  lights: Lights;
  car: Car | null;
  objectBounds: ObjectBoundKey;

  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    this.lights = new Lights(this.scene, this.app);
    this.objectBounds = {};

    this.car = null;
    this.app.resources.on('ready', () => {
      createSceneModels(this.scene);
      this.car = new Car(this.scene);
    });
  }

  update(): void {
    this.car?.update();
  }
}
