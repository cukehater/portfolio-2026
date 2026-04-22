import * as THREE from 'three';
import App from './index.ts';
import type Sizes from './lib/sizes.ts';
import type Debug from './lib/debug.ts';
import { getObjectBounds } from '@/lib/object-bounds.ts';

const CAMERA_CONFIG = {
  projection: {
    fov: 40,
    near: 1,
    far: 80,
  },
  /** 데스크 전면을 보도록 높은 위치에서 정면 방향(Z)으로 바라봄 */
  birdEye: {
    clipFar: 220,
    fallbackSpan: 50,
    minSpan: 2.5,
    heightScale: 1.05,
    lift: 5.5,
    /** 책상 중심에서 카메라까지의 Z 거리 = span × 이 값 (정면 거리) */
    frontDepth: 1.02,
    /** lookAt을 책상 중심보다 위로 (상판 쪽 시선) */
    lookAtLift: 0.22,
    /** 버드아이에서 궤도·팬·줌 */
    orbit: {
      rotateSpeed: 0.005,
      panSpeed: 0.018,
      wheelZoom: 0.0012,
      radiusMinFactor: 0.32,
      radiusMaxFactor: 3.4,
    },
  },
  easing: 0.15,
  angle: {
    default: new THREE.Vector3(-1.25, 1.5, 1.25),
  },
  zoom: {
    easing: 0.1,
    minDistance: 14,
    amplitude: 15,
    initialValue: 0.5,
  },
  pan: {
    easing: 0.14,
    pixelToWorld: 0.035,
  },
};
const debugParams = {
  cameraEasing: CAMERA_CONFIG.easing,
  zoom: CAMERA_CONFIG.zoom.initialValue,
  panEnabled: true,
  /** 데스크 중심 위에서 내려다보기 (개발·레이아웃 확인용) */
  birdEyeView: true,
  /** 버드 아이에서 카메라 거리 배율 (휠로도 조절 가능) */
  birdEyeDistance: 0.6,
  birdEyeHeightScale: CAMERA_CONFIG.birdEye.heightScale,
  birdEyeLift: CAMERA_CONFIG.birdEye.lift,
  birdEyeFrontDepth: CAMERA_CONFIG.birdEye.frontDepth,
  /** 책상 정면 기준 좌우 미세 이동 (span 비율, 0이면 X 중앙) */
  birdEyeLateral: 0,
  /** true면 카메라를 +Z 쪽에 두고 데스크를 봄 (모델 축이 반대일 때) */
  birdEyeFrontFromPlusZ: true,
  /** lookAt 높이 보정: bounds.size.y × 이 값만큼 위를 본다 */
  birdEyeLookAtLift: CAMERA_CONFIG.birdEye.lookAtLift,
};
export default class Camera {
  app: App;
  sizes: InstanceType<typeof Sizes>;
  scene: THREE.Scene;
  debug: Debug;
  instance!: THREE.PerspectiveCamera;
  target = new THREE.Vector3();
  targetEased = new THREE.Vector3();
  angleValue = CAMERA_CONFIG.angle.default.clone();
  private zoomValue = CAMERA_CONFIG.zoom.initialValue;
  private zoomTargetValue = CAMERA_CONFIG.zoom.initialValue;
  private zoomDistance =
    CAMERA_CONFIG.zoom.minDistance +
    CAMERA_CONFIG.zoom.amplitude * CAMERA_CONFIG.zoom.initialValue;
  private panValue = new THREE.Vector2();
  private panTargetValue = new THREE.Vector2();
  private panLastPointer = new THREE.Vector2();
  private panActive = false;
  private readonly offset = new THREE.Vector3();
  private readonly carLookPoint = new THREE.Vector3();
  private readonly birdDeskCenter = new THREE.Vector3();
  private readonly birdEyePosition = new THREE.Vector3();
  private readonly birdLookAt = new THREE.Vector3();
  private readonly birdOrbitSpherical = new THREE.Spherical();
  private readonly birdOrbitOffset = new THREE.Vector3();
  private readonly birdPanOffset = new THREE.Vector3();
  private readonly birdPanRight = new THREE.Vector3();
  private readonly birdPanUp = new THREE.Vector3();
  private readonly birdPanForward = new THREE.Vector3();
  private birdOrbitInitPending = true;
  private birdOrbitRotateDown = false;
  private birdOrbitPanDown = false;
  private readonly birdOrbitLastPointer = new THREE.Vector2();
  private listenersAttached = false;
  private birdEyeClipPushed = false;
  private birdEyeToggleCtrl: { updateDisplay(): void } | null = null;
  constructor() {
    this.app = new App();
    this.sizes = this.app.sizes;
    this.scene = this.app.scene;
    this.debug = this.app.debug;
    this.setInstance();
    this.setGui();
    this.setBirdEyeHotkey();
  }
  private setInstance(): void {
    this.instance = new THREE.PerspectiveCamera(
      CAMERA_CONFIG.projection.fov,
      this.sizes.width / this.sizes.height,
      CAMERA_CONFIG.projection.near,
      CAMERA_CONFIG.projection.far
    );
    this.instance.position.copy(this.angleValue);
    this.instance.lookAt(this.targetEased);
    this.scene.add(this.instance);
  }
  resize(): void {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }
  private spanFromDeskBounds(bounds: { size: THREE.Vector3 }): number {
    let span = Math.max(bounds.size.x, bounds.size.z);
    if (span < CAMERA_CONFIG.birdEye.minSpan) {
      span = CAMERA_CONFIG.birdEye.fallbackSpan;
    }
    return span;
  }

  private getDeskOrbitalSpan(): number {
    return this.spanFromDeskBounds(getObjectBounds('office_desk'));
  }

  private requestBirdEyePresetResync(): void {
    this.birdOrbitInitPending = true;
  }

  private getTargetFromCar(): THREE.Vector3 {
    const car = this.app.world?.car?.group;
    if (!car) return this.target;
    car.getWorldPosition(this.carLookPoint);
    this.target.copy(this.carLookPoint);
    return this.target;
  }
  private attachInputListeners(): void {
    if (this.listenersAttached) return;
    const dom = this.app.renderer?.instance?.domElement;
    if (!dom) return;
    this.listenersAttached = true;
    dom.addEventListener(
      'wheel',
      (event) => {
        event.preventDefault();
        if (debugParams.birdEyeView) {
          const span = this.getDeskOrbitalSpan();
          const minR = span * CAMERA_CONFIG.birdEye.orbit.radiusMinFactor;
          const maxR = span * CAMERA_CONFIG.birdEye.orbit.radiusMaxFactor;
          this.birdOrbitSpherical.radius *=
            1 + event.deltaY * CAMERA_CONFIG.birdEye.orbit.wheelZoom;
          this.birdOrbitSpherical.radius = THREE.MathUtils.clamp(
            this.birdOrbitSpherical.radius,
            minR,
            maxR
          );
        } else {
          this.zoomTargetValue += event.deltaY * 0.001;
          this.zoomTargetValue = THREE.MathUtils.clamp(
            this.zoomTargetValue,
            0,
            1
          );
        }
      },
      { passive: false }
    );
    const onPointerDown = (event: PointerEvent): void => {
      if (debugParams.birdEyeView) {
        if (event.button === 0) {
          this.birdOrbitRotateDown = true;
          this.birdOrbitLastPointer.set(event.clientX, event.clientY);
          dom.setPointerCapture(event.pointerId);
        } else if (event.button === 2) {
          this.birdOrbitPanDown = true;
          this.birdOrbitLastPointer.set(event.clientX, event.clientY);
          dom.setPointerCapture(event.pointerId);
          event.preventDefault();
        }
        return;
      }
      if (!debugParams.panEnabled || event.button !== 0) return;
      this.panLastPointer.set(event.clientX, event.clientY);
      this.panActive = true;
      dom.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent): void => {
      if (debugParams.birdEyeView) {
        const dx = event.clientX - this.birdOrbitLastPointer.x;
        const dy = event.clientY - this.birdOrbitLastPointer.y;
        this.birdOrbitLastPointer.set(event.clientX, event.clientY);
        if (this.birdOrbitRotateDown) {
          const s = CAMERA_CONFIG.birdEye.orbit.rotateSpeed;
          this.birdOrbitSpherical.theta -= dx * s;
          this.birdOrbitSpherical.phi += dy * s;
          this.birdOrbitSpherical.phi = THREE.MathUtils.clamp(
            this.birdOrbitSpherical.phi,
            0.05,
            Math.PI - 0.05
          );
        }
        if (this.birdOrbitPanDown) {
          this.applyBirdEyePan(dx, dy);
        }
        return;
      }
      if (!this.panActive || !debugParams.panEnabled) return;
      const dx = event.clientX - this.panLastPointer.x;
      const dy = event.clientY - this.panLastPointer.y;
      this.panLastPointer.set(event.clientX, event.clientY);
      this.panTargetValue.x += -dx * CAMERA_CONFIG.pan.pixelToWorld;
      this.panTargetValue.y += dy * CAMERA_CONFIG.pan.pixelToWorld;
    };
    const onPointerUp = (event: PointerEvent): void => {
      if (debugParams.birdEyeView) {
        if (event.button === 0) this.birdOrbitRotateDown = false;
        if (event.button === 2) this.birdOrbitPanDown = false;
        try {
          dom.releasePointerCapture(event.pointerId);
        } catch {}
        return;
      }
      if (!this.panActive) return;
      this.panActive = false;
      try {
        dom.releasePointerCapture(event.pointerId);
      } catch {}
    };
    dom.addEventListener('pointerdown', onPointerDown);
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('pointercancel', onPointerUp);
    dom.addEventListener('contextmenu', (event) => {
      if (debugParams.birdEyeView) event.preventDefault();
    });
  }

  private applyBirdEyePan(dx: number, dy: number): void {
    this.instance.updateMatrixWorld(true);
    this.instance.getWorldDirection(this.birdPanForward);
    this.birdPanRight
      .crossVectors(this.birdPanForward, this.instance.up)
      .normalize();
    this.birdPanUp.copy(this.instance.up).normalize();
    const s = CAMERA_CONFIG.birdEye.orbit.panSpeed;
    this.birdPanOffset.addScaledVector(this.birdPanRight, -dx * s);
    this.birdPanOffset.addScaledVector(this.birdPanUp, dy * s);
  }
  private applyBirdEyeView(): void {
    const bounds = getObjectBounds('office_desk');
    this.birdDeskCenter.copy(bounds.position);
    const span = this.spanFromDeskBounds(bounds);
    const d = debugParams.birdEyeDistance;
    const height =
      bounds.size.y +
      span * debugParams.birdEyeHeightScale * d +
      debugParams.birdEyeLift * d;
    const depth = span * debugParams.birdEyeFrontDepth * d;
    const zOffset = debugParams.birdEyeFrontFromPlusZ ? depth : -depth;
    const lateral = span * debugParams.birdEyeLateral * d;
    this.birdEyePosition.set(
      this.birdDeskCenter.x + lateral,
      this.birdDeskCenter.y + height,
      this.birdDeskCenter.z + zOffset
    );
    this.birdLookAt.copy(this.birdDeskCenter);
    this.birdLookAt.y += bounds.size.y * debugParams.birdEyeLookAtLift;
    this.birdLookAt.add(this.birdPanOffset);

    if (this.birdOrbitInitPending) {
      this.birdOrbitOffset.subVectors(this.birdEyePosition, this.birdLookAt);
      if (this.birdOrbitOffset.lengthSq() < 1e-8) {
        this.birdOrbitSpherical.set(span * 1.1, Math.PI * 0.28, Math.PI * 0.2);
      } else {
        this.birdOrbitSpherical.setFromVector3(this.birdOrbitOffset);
        this.birdOrbitSpherical.radius = THREE.MathUtils.clamp(
          this.birdOrbitSpherical.radius,
          span * CAMERA_CONFIG.birdEye.orbit.radiusMinFactor,
          span * CAMERA_CONFIG.birdEye.orbit.radiusMaxFactor
        );
      }
      this.birdOrbitInitPending = false;
    }

    if (!this.birdEyeClipPushed) {
      this.instance.far = CAMERA_CONFIG.birdEye.clipFar;
      this.instance.updateProjectionMatrix();
      this.birdEyeClipPushed = true;
    }

    this.birdOrbitOffset.setFromSpherical(this.birdOrbitSpherical);
    this.instance.position.copy(this.birdLookAt).add(this.birdOrbitOffset);
    this.instance.up.set(0, 1, 0);
    this.instance.lookAt(this.birdLookAt);
  }

  private restoreProjectionClip(): void {
    if (!this.birdEyeClipPushed) return;
    this.instance.far = CAMERA_CONFIG.projection.far;
    this.instance.updateProjectionMatrix();
    this.birdEyeClipPushed = false;
  }

  private resetBirdEyeOrbitState(): void {
    this.birdOrbitInitPending = true;
    this.birdOrbitRotateDown = false;
    this.birdOrbitPanDown = false;
    this.birdPanOffset.set(0, 0, 0);
  }

  private setBirdEyeHotkey(): void {
    const viteDev =
      typeof import.meta !== 'undefined' &&
      (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true;
    if (!viteDev || typeof window === 'undefined') return;
    window.addEventListener('keydown', (event) => {
      if (event.defaultPrevented) return;
      if (event.code !== 'KeyB' || !event.shiftKey) return;
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      event.preventDefault();
      debugParams.birdEyeView = !debugParams.birdEyeView;
      this.birdEyeToggleCtrl?.updateDisplay();
      if (!debugParams.birdEyeView) {
        this.restoreProjectionClip();
        this.resetBirdEyeOrbitState();
      } else {
        this.birdOrbitInitPending = true;
      }
    });
  }

  update(): void {
    this.attachInputListeners();
    if (debugParams.birdEyeView) {
      this.applyBirdEyeView();
      return;
    }
    this.restoreProjectionClip();
    this.getTargetFromCar();
    this.targetEased.lerp(this.target, debugParams.cameraEasing);
    this.zoomValue +=
      (this.zoomTargetValue - this.zoomValue) * CAMERA_CONFIG.zoom.easing;
    debugParams.zoom = this.zoomValue;
    this.zoomDistance =
      CAMERA_CONFIG.zoom.minDistance +
      CAMERA_CONFIG.zoom.amplitude * this.zoomValue;
    this.panValue.x +=
      (this.panTargetValue.x - this.panValue.x) * CAMERA_CONFIG.pan.easing;
    this.panValue.y +=
      (this.panTargetValue.y - this.panValue.y) * CAMERA_CONFIG.pan.easing;
    this.offset
      .copy(this.angleValue)
      .normalize()
      .multiplyScalar(this.zoomDistance);
    this.instance.position.copy(this.targetEased).add(this.offset);
    this.instance.position.x += this.panValue.x;
    this.instance.position.z += this.panValue.y;
    this.instance.lookAt(this.targetEased);
  }
  setGui(): void {
    const cameraFolder = this.debug.gui.addFolder('📹 Camera');
    const followFolder = cameraFolder.addFolder('Follow');
    followFolder
      .add(debugParams, 'cameraEasing')
      .min(0.01)
      .max(1)
      .step(0.01)
      .name('Target Easing');
    followFolder
      .add(this.angleValue, 'x')
      .min(-2)
      .max(2)
      .step(0.001)
      .name('Angle X');
    followFolder
      .add(this.angleValue, 'y')
      .min(-2)
      .max(2)
      .step(0.001)
      .name('Angle Y');
    followFolder
      .add(this.angleValue, 'z')
      .min(-2)
      .max(2)
      .step(0.001)
      .name('Angle Z');
    followFolder
      .add(debugParams, 'zoom')
      .min(0)
      .max(1)
      .step(0.001)
      .name('Zoom')
      .onChange((value: number) => {
        this.zoomTargetValue = value;
      });
    followFolder.add(debugParams, 'panEnabled').name('Pan Enabled');
    const birdFolder = cameraFolder.addFolder('🪟 Desk front (dev)');
    this.birdEyeToggleCtrl = birdFolder
      .add(debugParams, 'birdEyeView')
      .name('Desk overview')
      .onChange((on: boolean) => {
        if (!on) {
          this.restoreProjectionClip();
          this.resetBirdEyeOrbitState();
        } else {
          this.birdOrbitInitPending = true;
        }
      });
    birdFolder
      .add(debugParams, 'birdEyeDistance')
      .min(0.4)
      .max(2.8)
      .step(0.02)
      .name('Preset distance')
      .onChange(() => {
        this.requestBirdEyePresetResync();
      });
    birdFolder
      .add(debugParams, 'birdEyeHeightScale')
      .min(0.5)
      .max(2.5)
      .step(0.02)
      .name('Height scale')
      .onChange(() => {
        this.requestBirdEyePresetResync();
      });
    birdFolder
      .add(debugParams, 'birdEyeLift')
      .min(0)
      .max(24)
      .step(0.25)
      .name('Extra lift')
      .onChange(() => {
        this.requestBirdEyePresetResync();
      });
    birdFolder
      .add(debugParams, 'birdEyeFrontDepth')
      .min(0.35)
      .max(2.2)
      .step(0.02)
      .name('Front depth (× span)')
      .onChange(() => {
        this.requestBirdEyePresetResync();
      });
    birdFolder
      .add(debugParams, 'birdEyeLateral')
      .min(-0.45)
      .max(0.45)
      .step(0.01)
      .name('Lateral (× span)')
      .onChange(() => {
        this.requestBirdEyePresetResync();
      });
    birdFolder
      .add(debugParams, 'birdEyeFrontFromPlusZ')
      .name('Flip to +Z side')
      .onChange(() => {
        this.requestBirdEyePresetResync();
      });
    birdFolder
      .add(debugParams, 'birdEyeLookAtLift')
      .min(0)
      .max(0.55)
      .step(0.01)
      .name('Look-at lift (× height)')
      .onChange(() => {
        this.requestBirdEyePresetResync();
      });
    cameraFolder.close();
  }
}
