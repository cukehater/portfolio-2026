/**
 * Camera — Bruno Simon 스타일 따라가기 카메라
 *
 * - 차 뒤쪽 대각선 위에 고정 오프셋(-10, 16, 12)으로 위치
 * - 매 프레임 차 위치 + 오프셋으로 목표 위치 계산 후 lerp로 부드럽게 추적
 * - 항상 차를 바라보도록 lookAt(차 위치)
 */
import * as THREE from 'three';
import App from './index.ts';
import type Sizes from './utils/sizes.ts';

const CAMERA_OFFSET = new THREE.Vector3(-10, 16, 12);

export default class Camera {
  app: App;
  sizes: InstanceType<typeof Sizes>;
  scene: THREE.Scene;
  instance!: THREE.PerspectiveCamera;

  constructor() {
    this.app = new App();
    this.sizes = this.app.sizes;
    this.scene = this.app.scene;

    this.setInstance();
  }

  setInstance(): void {
    this.instance = new THREE.PerspectiveCamera(
      45,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );
    this.instance.position.copy(CAMERA_OFFSET);
    this.instance.lookAt(0, 0, 0);
    this.scene.add(this.instance);
  }

  resize(): void {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update(): void {
    const world = this.app.world;
    if (world?.car?.group) {
      const targetPos = world.car.group.position.clone().add(CAMERA_OFFSET);
      this.instance.position.lerp(targetPos, 0.1);
      this.instance.lookAt(world.car.group.position);
    }
  }
}
