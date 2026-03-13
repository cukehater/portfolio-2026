/**
 * Car — 차량 메시 + WASD/화살표/시프트 조작
 *
 * - Group으로 몸통·지붕·바퀴 4개를 묶고, 이 group을 카메라가 추적
 * - 전진(W/↑)·후진(S/↓), 이동 중에만 A/D(←/→)로 회전
 * - Shift 누르면 부스터(가속) 속도 적용
 */
import * as THREE from 'three';
import App from '../../index.ts';
import { GLTF } from 'three/examples/jsm/Addons.js';

const CAR_SPEED = 8;
const CAR_SPEED_BOOST = 18;
const CAR_TURN = 1.8;
const ACCEL_RATE = 2.2;
const DECEL_RATE = 3.5;
const COAST_RATE = 2.0;

/** 전륜 최대 조향 각도(라디안). 물리적으로 자연스러운 범위 */
const MAX_STEER_ANGLE = Math.PI / 6; // 약 30°
/** 이동 거리 1당 바퀴 회전량. 모델 크기에 맞게 조정 (값이 클수록 빨리 구름) */
const WHEEL_ROLL_FACTOR = 2.5;

export default class Car {
  scene: THREE.Scene;
  app: App;
  group: THREE.Group;
  /** 조향 피벗 4개 (전좌, 전우, 후좌, 후우). 전륜만 rotation.y 사용 */
  private wheelSteerPivots: THREE.Group[] = [];
  /** 구르기 피벗 4개. 모두 rotation.x만 사용 → 축 분리로 짐벌락 제거 */
  private wheelRollPivots: THREE.Object3D[] = [];
  /** 현재 조향 각도(라디안). 전륜만 이 값으로 회전 */
  currentSteerAngle = 0;
  /** 바퀴 구르기 누적 각도(라디안) */
  cumulativeWheelRoll = 0;
  currentSpeed: number;
  velocity: number;
  keys: Record<string, boolean>;

  constructor(scene: THREE.Scene, app: App) {
    this.scene = scene;
    this.app = app;
    this.group = new THREE.Group();
    this.currentSpeed = CAR_SPEED;
    this.velocity = 0;
    this.keys = {};
    this.setControls();
    this.scene.add(this.group);

    if (
      this.app.resources.items['cybertruck_chassis'] &&
      this.app.resources.items['cybertruck_wheel']
    ) {
      this.setMesh();
    } else {
      this.app.resources.on('ready', () => this.setMesh());
    }
  }

  setMesh(): void {
    const chassisGltf = this.app.resources.items['cybertruck_chassis'] as
      | GLTF
      | undefined;

    const wheelGltf = this.app.resources.items['cybertruck_wheel'] as
      | GLTF
      | undefined;

    if (!chassisGltf?.scene || !wheelGltf?.scene) return;

    const chassis = chassisGltf.scene.clone(true);
    chassis.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });
    chassis.position.y = 0.4;
    this.group.add(chassis);

    const wheelPositions: [number, number, number][] = [
      [-0.4, 0.25, -0.3], // 전좌
      [0.4, 0.25, -0.3], // 전우
      [-0.4, 0.25, 0.76], // 후좌
      [0.4, 0.25, 0.76], // 후우
    ];

    if (!wheelGltf?.scene) return;

    this.wheelSteerPivots = [];
    this.wheelRollPivots = [];
    wheelPositions.forEach((pos) => {
      const steerPivot = new THREE.Group();
      steerPivot.position.set(...pos);
      const rollPivot = new THREE.Group();
      const wheel = wheelGltf.scene.clone(true);
      wheel.position.set(0, 0, 0);
      rollPivot.add(wheel);
      steerPivot.add(rollPivot);
      this.group.add(steerPivot);
      this.wheelSteerPivots.push(steerPivot);
      this.wheelRollPivots.push(rollPivot);
    });

    this.group.scale.setScalar(1);
    this.group.position.set(0, 0, 0);
  }

  setControls(): void {
    this.keys = {};
    window.addEventListener('keydown', (e) => (this.keys[e.key] = true));
    window.addEventListener('keyup', (e) => (this.keys[e.key] = false));
  }

  update(): void {
    const deltaSec = ((this.app?.time?.delta ?? 16) as number) * 0.001;

    const movingForward = this.keys['ArrowUp'];
    const movingBackward = this.keys['ArrowDown'];
    const isMoving = movingForward || movingBackward;

    const targetSpeed = this.keys['Shift'] ? CAR_SPEED_BOOST : CAR_SPEED;
    const isAccelerating = targetSpeed > this.currentSpeed;
    const rate = isAccelerating ? ACCEL_RATE : DECEL_RATE;
    const t = 1 - Math.exp(-rate * deltaSec);
    this.currentSpeed += (targetSpeed - this.currentSpeed) * t;

    let targetVelocity = 0;
    if (movingForward) targetVelocity = this.currentSpeed;
    else if (movingBackward) targetVelocity = -this.currentSpeed;
    const velocityRate = isMoving ? rate : COAST_RATE;
    const tVel = 1 - Math.exp(-velocityRate * deltaSec);
    this.velocity += (targetVelocity - this.velocity) * tVel;
    if (Math.abs(this.velocity) < 0.001) this.velocity = 0;

    const move = this.velocity * deltaSec;
    this.group.position.x -= Math.sin(this.group.rotation.y) * move;
    this.group.position.z -= Math.cos(this.group.rotation.y) * move;

    // 전진/후진 키를 누를 때는 풀 조향, 감속 중에는 속도에 비례해 조향량 감소 (부자연스러운 회전 방지)
    const hasVelocity = Math.abs(this.velocity) > 0.01;
    if (isMoving || hasVelocity) {
      const steerDir = this.velocity >= 0 ? 1 : -1;
      // 감속 중에는 현재 속도 비율만큼만 조향 (멈출수록 회전 약해짐)
      const speedRatio = isMoving
        ? 1
        : Math.min(1, Math.abs(this.velocity) / CAR_SPEED);
      const turn = CAR_TURN * deltaSec * speedRatio;
      if (this.keys['ArrowLeft']) this.group.rotation.y += turn * steerDir;
      if (this.keys['ArrowRight']) this.group.rotation.y -= turn * steerDir;
    }

    // --- 바퀴 애니메이션: 구르기(X축) + 전륜 조향(Y축) ---
    this.updateWheels(deltaSec);
  }

  /**
   * 바퀴 구르기·조향을 피벗 계층으로 분리해 짐벌락 제거.
   * steerPivot은 Y축만, rollPivot은 X축만 회전 → 한 오브젝트당 한 축만 사용.
   */
  private updateWheels(deltaSec: number): void {
    if (this.wheelRollPivots.length < 4) return;

    this.cumulativeWheelRoll -= this.velocity * deltaSec * WHEEL_ROLL_FACTOR;

    // 바퀴 시각: 키 방향 그대로 (왼쪽 키 = 전륜 왼쪽 꺾임). 후진 시에도 동일.
    let targetSteer = 0;
    if (this.keys['ArrowLeft']) targetSteer = MAX_STEER_ANGLE;
    if (this.keys['ArrowRight']) targetSteer = -MAX_STEER_ANGLE;
    const steerLerp = 1 - Math.exp(-12 * deltaSec);
    this.currentSteerAngle +=
      (targetSteer - this.currentSteerAngle) * steerLerp;

    for (let i = 0; i < 4; i++) {
      this.wheelRollPivots[i].rotation.x = this.cumulativeWheelRoll;
      if (i < 2) {
        this.wheelSteerPivots[i].rotation.y = this.currentSteerAngle;
      }
    }
  }
}
