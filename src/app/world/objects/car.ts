/**
 * Car — 차량 메시 + WASD/화살표/시프트 조작
 *
 * - Group으로 몸통·지붕·바퀴 4개를 묶고, 이 group을 카메라가 추적
 * - 전진(W/↑)·후진(S/↓), 이동 중에만 A/D(←/→)로 회전
 * - Shift 누르면 부스터(가속) 속도 적용
 */
import * as THREE from 'three';
import App, { getApp } from '../../index.ts';
import { GLTF } from 'three/examples/jsm/Addons.js';
import { getObjectBoundSize } from '../../utils/objectBounds.ts';

const CONFIG = {
  drive: {
    speed: 8, // 기본 전진/후진 속도
    speedBoost: 25, // Shift 부스터 속도
    turn: 1.8, // 좌우 회전 강도(라디안/초)
    accelRate: 2.2, // 가속 반응 속도
    decelRate: 3.5, // 감속 반응 속도
    coastRate: 2.0, // 키 떼었을 때 감속
  },
  wheel: {
    maxSteerAngle: Math.PI / 6, // 전륜 최대 조향 각도(30°)
    rollFactor: 2.5, // 이동 거리 → 바퀴 회전량 비율
    positions: [
      [-0.4, 0.25, -0.3],
      [0.4, 0.25, -0.3],
      [-0.4, 0.25, 0.76],
      [0.4, 0.25, 0.76],
    ] as [number, number, number][], // [전좌, 전우, 후좌, 후우] 로컬 위치
  },
  spawn: {
    height: 5,
    gravity: 22, // 낙하 중력
    bounceInitial: 4.2, // 착지 시 첫 튕김 속도 (높을수록 더 높이 튐)
    bounceDamping: 0.58, // 튕김 감쇠 (높을수록 에너지 유지 → 더 여러 번 통통 튐)
    idleThreshold: 0.03, // 이 속도 이하면 idle 전환
    bounceMax: 10, // 이 횟수 튕기면 강제 idle
  },
} as const;

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
  /** 등장 애니메이션: 'falling' → 'bouncing' → 'idle' */
  spawnState: 'falling' | 'bouncing' | 'idle' = 'falling';
  /** Y축 속도 (낙하·튕김용) */
  verticalVelocity = 0;
  /** 바닥 접촉 횟수 (bouncing 중). 이걸로 강제 idle */
  private landingBounceCount = 0;

  constructor(scene: THREE.Scene) {
    this.app = getApp();
    this.scene = scene;
    this.group = new THREE.Group();
    this.currentSpeed = CONFIG.drive.speed;
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

    if (!wheelGltf?.scene) return;

    this.wheelSteerPivots = [];
    this.wheelRollPivots = [];
    CONFIG.wheel.positions.forEach((pos) => {
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

    const officeDeskSize = getObjectBoundSize('office_desk');

    this.group.position.set(officeDeskSize.x / 2 - 2.5, 0, 5.25);
    this.group.rotation.set(0, Math.PI / 2, 0);
    this.spawnState = 'idle';
    this.verticalVelocity = 0;
    this.landingBounceCount = 0;
  }

  setControls(): void {
    this.keys = {};
    // WASD + 한글 키배치(ㅈ=W, ㅁ=A, ㄴ=S, ㅇ=D) 동시 지원
    const controlKeys = new Set([
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'w',
      'W',
      'ㅈ',
      'a',
      'A',
      'ㅁ',
      's',
      'S',
      'ㄴ',
      'd',
      'D',
      'ㅇ',
      'Shift',
    ]);
    window.addEventListener('keydown', (e) => {
      if (controlKeys.has(e.key)) e.preventDefault();
      this.keys[e.key] = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  }

  update(): void {
    const deltaSec = ((this.app?.time?.delta ?? 16) as number) * 0.001;

    this.updateLanding(deltaSec);
    if (this.spawnState !== 'idle') return;

    const movingForward =
      this.keys['ArrowUp'] ||
      this.keys['w'] ||
      this.keys['W'] ||
      this.keys['ㅈ'];
    const movingBackward =
      this.keys['ArrowDown'] ||
      this.keys['s'] ||
      this.keys['S'] ||
      this.keys['ㄴ'];
    const isMoving = movingForward || movingBackward;

    const targetSpeed = this.keys['Shift']
      ? CONFIG.drive.speedBoost
      : CONFIG.drive.speed;
    const isAccelerating = targetSpeed > this.currentSpeed;
    const rate = isAccelerating
      ? CONFIG.drive.accelRate
      : CONFIG.drive.decelRate;
    const t = 1 - Math.exp(-rate * deltaSec);
    this.currentSpeed += (targetSpeed - this.currentSpeed) * t;

    let targetVelocity = 0;
    if (movingForward) targetVelocity = this.currentSpeed;
    else if (movingBackward) targetVelocity = -this.currentSpeed;
    const velocityRate = isMoving ? rate : CONFIG.drive.coastRate;
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
        : Math.min(1, Math.abs(this.velocity) / CONFIG.drive.speed);
      const turn = CONFIG.drive.turn * deltaSec * speedRatio;
      if (
        this.keys['ArrowLeft'] ||
        this.keys['a'] ||
        this.keys['A'] ||
        this.keys['ㅁ']
      )
        this.group.rotation.y += turn * steerDir;
      if (
        this.keys['ArrowRight'] ||
        this.keys['d'] ||
        this.keys['D'] ||
        this.keys['ㅇ']
      )
        this.group.rotation.y -= turn * steerDir;
    }

    // --- 바퀴 애니메이션: 구르기(X축) + 전륜 조향(Y축) ---
    this.updateWheels(deltaSec);
  }

  /**
   * 공중 → 낙하 → 착지 → 살짝 튕김 → 정지. idle 이전에는 조종 불가.
   */
  private updateLanding(deltaSec: number): void {
    if (this.spawnState === 'idle') return;

    this.verticalVelocity -= CONFIG.spawn.gravity * deltaSec;
    this.group.position.y += this.verticalVelocity * deltaSec;

    const floorY = 0;
    if (this.group.position.y <= floorY) {
      this.group.position.y = floorY;
      if (this.spawnState === 'falling') {
        this.verticalVelocity = CONFIG.spawn.bounceInitial;
        this.spawnState = 'bouncing';
        this.landingBounceCount = 1;
      } else {
        this.landingBounceCount += 1;
        this.verticalVelocity *= -CONFIG.spawn.bounceDamping;
        const smallVelocity =
          Math.abs(this.verticalVelocity) < CONFIG.spawn.idleThreshold;
        const tooManyBounces =
          this.landingBounceCount >= CONFIG.spawn.bounceMax;
        if (smallVelocity || tooManyBounces) {
          this.verticalVelocity = 0;
          this.spawnState = 'idle';
        }
      }
    }
  }

  /**
   * 바퀴 구르기·조향을 피벗 계층으로 분리해 짐벌락 제거.
   * steerPivot은 Y축만, rollPivot은 X축만 회전 → 한 오브젝트당 한 축만 사용.
   */
  private updateWheels(deltaSec: number): void {
    if (this.wheelRollPivots.length < 4) return;

    this.cumulativeWheelRoll -=
      this.velocity * deltaSec * CONFIG.wheel.rollFactor;

    let targetSteer = 0;
    if (
      this.keys['ArrowLeft'] ||
      this.keys['a'] ||
      this.keys['A'] ||
      this.keys['ㅁ']
    )
      targetSteer = CONFIG.wheel.maxSteerAngle;
    if (
      this.keys['ArrowRight'] ||
      this.keys['d'] ||
      this.keys['D'] ||
      this.keys['ㅇ']
    )
      targetSteer = -CONFIG.wheel.maxSteerAngle;
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
