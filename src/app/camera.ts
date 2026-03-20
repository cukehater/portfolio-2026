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

/** 카메라·안개·Orbit 기본값 (읽기 전용) */
const CAMERA_CONFIG = {
  /** Follow 모드: 차 대비 카메라 상대 위치 (차 뒤쪽 대각선 위) */
  follow: {
    offset: new THREE.Vector3(-14, 7, 12),
    lerp: 0.2,
    /** Yaw=수평 회전, Pitch=상하 각도 (도) */
    yawDeg: 45,
    pitchDeg: -70,
  },
  /** Orbit 모드 */
  orbit: {
    position: new THREE.Vector3(0, 40, 50),
    far: 500,
  },
  /** 투영 파라미터 */
  projection: {
    fov: 45,
    near: 0.1,
    far: 100,
  },
  /** Follow/Orbit별 안개 far (Follow=가까움, Orbit=멀리) */
  fog: {
    farFollow: 80,
    farOrbit: 500,
  },
} as const;

/** 디버그용 트윅 가능 파라미터 (GUI에서 수정) */
const debugParams = {
  followLerp: CAMERA_CONFIG.follow.lerp,
  freeze: false,
  fov: CAMERA_CONFIG.projection.fov,
  near: CAMERA_CONFIG.projection.near,
  far: CAMERA_CONFIG.projection.far,
  orbitTarget: new THREE.Vector3(0, 0, 0),
  followYawDeg: CAMERA_CONFIG.follow.yawDeg,
  followPitchDeg: CAMERA_CONFIG.follow.pitchDeg,
  orbitPosition: CAMERA_CONFIG.orbit.position.clone(),
};

export default class Camera {
  app: App;
  sizes: InstanceType<typeof Sizes>;
  scene: THREE.Scene;
  debug: Debug;
  instance!: THREE.PerspectiveCamera;
  controls: OrbitControls | null = null;
  orbitEnabled = true;
  private _targetPos = new THREE.Vector3();
  private _lookAt = new THREE.Vector3();
  private _rotatedOffset = new THREE.Vector3();
  /** 차가 있으면 첫 프레임에 카메라를 차 위치로 즉시 맞춤 */
  private _initialPositionSet = false;
  /** Orbit 위치 슬라이더 → OrbitControls 내부 spherical 동기화용 */
  private _orbitOffset = new THREE.Vector3();

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
      debugParams.fov,
      this.sizes.width / this.sizes.height,
      debugParams.near,
      debugParams.far
    );
    this.instance.position.copy(CAMERA_CONFIG.orbit.position);
    this.instance.lookAt(0, 0, 0);
    this.scene.add(this.instance);
  }

  resize(): void {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.fov = debugParams.fov;
    this.instance.near = debugParams.near;
    this.instance.far = debugParams.far;
    this.instance.updateProjectionMatrix();
  }

  private getOrbitControls(): OrbitControls | null {
    if (this.controls) return this.controls;
    const domElement = this.app.renderer?.instance?.domElement;
    if (!domElement) return null;
    this.controls = new OrbitControls(this.instance, domElement);
    this.controls.enabled = this.orbitEnabled;
    this.controls.target.copy(debugParams.orbitTarget);
    return this.controls;
  }

  update(): void {
    if (debugParams.freeze && !this.orbitEnabled) return;

    // Orbit 모드일 때 안개 거리를 늘려 화면이 뿌옇지 않게 (맵 배치용)
    const fog = this.scene.fog as THREE.Fog | null;
    if (fog && fog.isFog) {
      fog.far = this.orbitEnabled
        ? CAMERA_CONFIG.fog.farOrbit
        : CAMERA_CONFIG.fog.farFollow;
    }

    if (this.orbitEnabled) {
      const ctrl = this.getOrbitControls();
      if (ctrl) {
        ctrl.enabled = true;
        ctrl.target.copy(debugParams.orbitTarget);
        ctrl.update();
        // 드래그/줌 후 GUI 슬라이더 값과 동기화
        debugParams.orbitPosition.copy(this.instance.position);
      }
      this.instance.fov = debugParams.fov;
      this.instance.near = debugParams.near;
      this.instance.far = CAMERA_CONFIG.orbit.far;
      this.instance.updateProjectionMatrix();
      return;
    }
    if (this.controls) this.controls.enabled = false;

    const world = this.app.world;
    if (world?.car?.group) {
      const carPos = world.car.group.position;
      const yawRad = (debugParams.followYawDeg * Math.PI) / 180;
      const pitchRad = (debugParams.followPitchDeg * Math.PI) / 180;
      this._rotatedOffset
        .copy(CAMERA_CONFIG.follow.offset)
        .applyAxisAngle(new THREE.Vector3(1, 0, 0), pitchRad)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRad);
      this._targetPos.copy(carPos).add(this._rotatedOffset);
      if (!this._initialPositionSet) {
        this.instance.position.copy(this._targetPos);
        this._initialPositionSet = true;
      } else {
        this.instance.position.lerp(this._targetPos, debugParams.followLerp);
      }
      this._lookAt.copy(carPos);
      this.instance.lookAt(this._lookAt);
    }

    this.instance.fov = debugParams.fov;
    this.instance.near = debugParams.near;
    this.instance.far = debugParams.far;
    this.instance.updateProjectionMatrix();
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

    const followFolder = cameraFolder.addFolder('Follow');
    followFolder
      .add(CAMERA_CONFIG.follow.offset, 'x')
      .min(-50)
      .max(50)
      .step(1)
      .name('Offset X');
    followFolder
      .add(CAMERA_CONFIG.follow.offset, 'y')
      .min(-50)
      .max(50)
      .step(1)
      .name('Offset Y');
    followFolder
      .add(CAMERA_CONFIG.follow.offset, 'z')
      .min(-50)
      .max(50)
      .step(1)
      .name('Offset Z');
    followFolder
      .add(debugParams, 'followLerp')
      .min(0.01)
      .max(1)
      .step(0.01)
      .name('Lerp (추적 속도)');
    followFolder
      .add(debugParams, 'followYawDeg')
      .min(-180)
      .max(180)
      .step(1)
      .name('Yaw (수평 회전 °)');
    followFolder
      .add(debugParams, 'followPitchDeg')
      .min(-89)
      .max(89)
      .step(1)
      .name('Pitch (상하 각도 °)');

    const orbitFolder = cameraFolder.addFolder('Orbit');
    const syncOrbitPositionToCamera = (): void => {
      this.instance.position.copy(debugParams.orbitPosition);
      const ctrl = this.getOrbitControls();
      if (ctrl && '_spherical' in ctrl) {
        const oc = ctrl as OrbitControls & {
          _spherical: THREE.Spherical;
          _sphericalDelta: THREE.Spherical;
          _quat: THREE.Quaternion;
        };
        this._orbitOffset
          .copy(this.instance.position)
          .sub(ctrl.target)
          .applyQuaternion(oc._quat);
        oc._spherical.setFromVector3(this._orbitOffset);
        oc._sphericalDelta.set(0, 0, 0);
      }
    };
    orbitFolder
      .add(debugParams.orbitPosition, 'x')
      .min(-50)
      .max(50)
      .step(0.5)
      .name('Orbit Position X')
      .onChange(syncOrbitPositionToCamera);
    orbitFolder
      .add(debugParams.orbitPosition, 'y')
      .min(-50)
      .max(50)
      .step(0.5)
      .name('Orbit Position Y')
      .onChange(syncOrbitPositionToCamera);
    orbitFolder
      .add(debugParams.orbitPosition, 'z')
      .min(-50)
      .max(50)
      .step(0.5)
      .name('Orbit Position Z')
      .onChange(syncOrbitPositionToCamera);

    cameraFolder.close();
  }
}
