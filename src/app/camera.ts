/**
 * Camera — Bruno Simon 스타일 따라가기 카메라
 *
 * - 차 뒤쪽 대각선 위에 고정 오프셋(-10, 16, 12)으로 위치
 * - 매 프레임 차 위치 + 오프셋으로 목표 위치 계산 후 lerp로 부드럽게 추적
 * - 디버그: Orbit Control 토글로 드래그 회전/줌 전환
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
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
  /** OrbitControls — 디버그 토글로 켜면 마우스 드래그·휠 줌 */
  controls: OrbitControls | null = null;
  /** true면 추적 카메라 비활성, OrbitControls로 조작 */
  orbitEnabled = true;
  /** OrbitControls.update()용, 매 프레임 할당 방지 */
  private _targetPos = new THREE.Vector3();

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

  /** OrbitControls가 없으면 생성 (캔버스 = renderer.domElement) */
  private getOrbitControls(): OrbitControls | null {
    if (this.controls) return this.controls;
    const domElement = this.app.renderer?.instance?.domElement;
    if (!domElement) return null;
    this.controls = new OrbitControls(this.instance, domElement);
    this.controls.enabled = this.orbitEnabled;
    this.controls.target.set(0, 0, 0);
    return this.controls;
  }

  update(): void {
    if (this.orbitEnabled) {
      const ctrl = this.getOrbitControls();
      if (ctrl) {
        ctrl.enabled = true;
        ctrl.update();
      }
      return;
    }
    if (this.controls) this.controls.enabled = false;

    const world = this.app.world;
    if (world?.car?.group) {
      this._targetPos.copy(world.car.group.position).add(CAMERA_OFFSET);
      this.instance.position.lerp(this._targetPos, 0.1);
    }
  }

  setGui(): void {
    const cameraFolder = this.debug.gui.addFolder('📹 Camera');

    cameraFolder
      .add(this, 'orbitEnabled')
      .name('Orbit Control')
      .onChange((v: boolean) => {
        const ctrl = this.getOrbitControls();
        if (ctrl) ctrl.enabled = v;
      });

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
