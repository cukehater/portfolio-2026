/**
 * World — 3D 씬에 들어갈 모든 오브젝트를 조합하는 컨테이너
 *
 * - 조명(Lights), 바닥(Floor), 차(Car), 테스트 오브젝트(큐브·원기둥)를 생성
 * - 매 프레임 Car의 update만 호출 (키보드 이동·회전 처리)
 */
import App from '../app.js';
import Floor from './floor.js';
import Lights from './lights.js';
import Car from './car.js';
import TestObjects from './testObjects.js';

export default class World {
  constructor() {
    this.app = new App();
    this.scene = this.app.scene;

    this.lights = new Lights(this.scene); // 배경·안개·조명
    this.floor = new Floor(this.scene); // 바닥면 + 그리드
    this.car = new Car(this.scene, this.app); // 차 메시 + 키 입력 (app으로 delta 사용)
    this.testObjects = new TestObjects(this.scene); // 장애물/장식용 큐브·원기둥
  }

  /** 매 프레임: 차 이동·회전 처리 (WASD 등) */
  update() {
    this.car.update();
  }
}
