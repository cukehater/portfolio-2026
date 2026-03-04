/**
 * Camera — Bruno Simon 스타일 따라가기 카메라
 *
 * - 차 뒤쪽 대각선 위에 고정 오프셋(-10, 16, 12)으로 위치
 * - 매 프레임 차 위치 + 오프셋으로 목표 위치 계산 후 lerp로 부드럽게 추적
 * - 항상 차를 바라보도록 lookAt(차 위치)
 */
import * as THREE from 'three';
import App from './app.js';

// 차 기준 카메라 상대 위치 (뒤·위·옆). 월드 좌표로 더해짐
const CAMERA_OFFSET = new THREE.Vector3(-10, 16, 12);

export default class Camera {
  constructor() {
    this.app = new App();
    this.sizes = this.app.sizes;
    this.scene = this.app.scene;

    this.setInstance();
  }

  /** 원근 카메라 생성 후 초기 위치·방향 설정, 씬에 추가 */
  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      45, // FOV (시야각)
      this.sizes.width / this.sizes.height,
      0.1,
      100 // near, far (잘라내는 범위)
    );
    this.instance.position.copy(CAMERA_OFFSET);
    this.instance.lookAt(0, 0, 0);
    this.scene.add(this.instance);
  }

  /** 창 크기 변경 시 비율 반영 */
  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  /** 매 프레임: 차가 있으면 차 위치 + 오프셋으로 부드럽게 따라가며 항상 차를 바라봄 */
  update() {
    const world = this.app.world;
    if (world && world.car?.group) {
      const targetPos = world.car.group.position.clone().add(CAMERA_OFFSET);
      this.instance.position.lerp(targetPos, 0.1); // 10%씩 보간
      this.instance.lookAt(world.car.group.position);
    }
  }
}
