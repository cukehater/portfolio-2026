/**
 * Car — 차량 메시 + WASD/화살표/시프트 조작
 *
 * - Group으로 몸통·지붕·바퀴 4개를 묶고, 이 group을 카메라가 추적
 * - 전진(W/↑)·후진(S/↓), 이동 중에만 A/D(←/→)로 회전
 * - Shift 누르면 부스터(가속) 속도 적용
 */
import * as THREE from 'three';
import type App from '..';

const CAR_SPEED = 8;
const CAR_SPEED_BOOST = 18;
const CAR_TURN = 1.8;
const ACCEL_RATE = 2.2;
const DECEL_RATE = 3.5;
const COAST_RATE = 2.0;

export default class Car {
  scene: THREE.Scene;
  app: App;
  group: THREE.Group;
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
    this.setMesh();
    this.setControls();
    this.scene.add(this.group);
  }

  setMesh(): void {
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x00ff88 });

    const bodyGeo = new THREE.BoxGeometry(1.2, 0.5, 2.2);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.4;
    body.castShadow = true;
    this.group.add(body);

    const roofGeo = new THREE.BoxGeometry(0.9, 0.4, 1.2);
    const roof = new THREE.Mesh(roofGeo, bodyMat);
    roof.position.set(0, 0.85, -0.1);
    roof.castShadow = true;
    this.group.add(roof);

    const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.2, 16);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const wheelPositions: [number, number, number][] = [
      [-0.7, 0.28, 0.7],
      [0.7, 0.28, 0.7],
      [-0.7, 0.28, -0.7],
      [0.7, 0.28, -0.7],
    ];
    wheelPositions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(...pos);
      wheel.rotation.z = Math.PI / 2;
      wheel.castShadow = true;
      this.group.add(wheel);
    });

    this.group.position.set(0, 0, 0);
  }

  setControls(): void {
    this.keys = {};
    window.addEventListener('keydown', (e) => (this.keys[e.key] = true));
    window.addEventListener('keyup', (e) => (this.keys[e.key] = false));
  }

  update(): void {
    const deltaSec = ((this.app?.time?.delta ?? 16) as number) * 0.001;

    const movingForward =
      this.keys['w'] || this.keys['W'] || this.keys['ArrowUp'];
    const movingBackward =
      this.keys['s'] || this.keys['S'] || this.keys['ArrowDown'];
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
      if (this.keys['a'] || this.keys['A'] || this.keys['ArrowLeft'])
        this.group.rotation.y += turn * steerDir;
      if (this.keys['d'] || this.keys['D'] || this.keys['ArrowRight'])
        this.group.rotation.y -= turn * steerDir;
    }
  }
}
