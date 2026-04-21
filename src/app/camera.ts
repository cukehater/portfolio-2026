import * as THREE from 'three';
import App from './index.ts';
import type Sizes from './lib/sizes.ts';
import Debug from './lib/debug.ts';
const CAMERA_CONFIG = {
  projection: {
    fov: 40,
    near: 1,
    far: 80,
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
  private listenersAttached = false;
  constructor() {
    this.app = new App();
    this.sizes = this.app.sizes;
    this.scene = this.app.scene;
    this.debug = this.app.debug;
    this.setInstance();
    this.setGui();
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
        this.zoomTargetValue += event.deltaY * 0.001;
        this.zoomTargetValue = THREE.MathUtils.clamp(
          this.zoomTargetValue,
          0,
          1
        );
      },
      { passive: false }
    );
    const onPointerDown = (event: PointerEvent): void => {
      if (!debugParams.panEnabled || event.button !== 0) return;
      this.panLastPointer.set(event.clientX, event.clientY);
      this.panActive = true;
      dom.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent): void => {
      if (!this.panActive || !debugParams.panEnabled) return;
      const dx = event.clientX - this.panLastPointer.x;
      const dy = event.clientY - this.panLastPointer.y;
      this.panLastPointer.set(event.clientX, event.clientY);
      this.panTargetValue.x += -dx * CAMERA_CONFIG.pan.pixelToWorld;
      this.panTargetValue.y += dy * CAMERA_CONFIG.pan.pixelToWorld;
    };
    const onPointerUp = (event: PointerEvent): void => {
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
  }
  update(): void {
    this.attachInputListeners();
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
    cameraFolder.close();
  }
}
