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
import Debug from './utils/debug.ts';

const CAMERA_OFFSET = new THREE.Vector3(-10, 16, 12);

export default class Camera {
  app: App;
  sizes: InstanceType<typeof Sizes>;
  scene: THREE.Scene;
  debug: Debug;
  instance!: THREE.PerspectiveCamera;

  constructor() {
    this.app = new App();
    this.sizes = this.app.sizes;
    this.scene = this.app.scene;
    this.debug = this.app.debug;

    this.setInstance();
    this.setGui();
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
      const targetPos = world.car.group.position.clone().add(CAMERA_OFFSET); // 차 위치 + 오프셋으로 목표 위치 계산
      this.instance.position.lerp(targetPos, 0.1); // 현재 카메라 위치에서 targetPos 쪽으로 10%씩 부드럽게 이동
      this.instance.lookAt(world.car.group.position);
    }
  }

  setGui(): void {
    const cameraFolder = this.debug.gui.addFolder('📹 Camera');
    cameraFolder.close();

    cameraFolder
      .add(CAMERA_OFFSET, 'x')
      .min(-50)
      .max(50)
      .step(0.1)
      .name('Camera Offset X');
    cameraFolder
      .add(CAMERA_OFFSET, 'y')
      .min(-50)
      .max(50)
      .step(0.1)
      .name('Camera Offset Y');
    cameraFolder
      .add(CAMERA_OFFSET, 'z')
      .min(-50)
      .max(50)
      .step(0.1)
      .name('Camera Offset Z');
  }
}
