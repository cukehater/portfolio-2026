/**
 * World — 3D 씬에 들어갈 모든 오브젝트를 조합하는 컨테이너
 *
 * - 조명(Lights), 바닥(Floor), 차(Car), 테스트 오브젝트(큐브·원기둥)를 생성
 * - 매 프레임 Car의 update만 호출 (키보드 이동·회전 처리)
 */
import * as THREE from 'three';
import App from '../index.ts';
import Floor from './floor.ts';
import Lights from './lights.ts';
import Car from './car.ts';
import TestObjects from './testObjects.ts';

export default class World {
  app: App;
  scene: THREE.Scene;
  lights: Lights;
  floor: Floor;
  car: Car;
  testObjects: TestObjects;

  constructor() {
    this.app = new App();
    this.scene = this.app.scene;

    this.lights = new Lights(this.scene);
    this.floor = new Floor(this.scene);
    this.car = new Car(this.scene, this.app);
    this.testObjects = new TestObjects(this.scene);
  }

  update(): void {
    this.car.update();
  }
}
