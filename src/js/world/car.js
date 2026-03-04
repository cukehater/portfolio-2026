/**
 * Car — 차량 메시 + WASD/화살표/시프트 조작
 *
 * - Group으로 몸통·지붕·바퀴 4개를 묶고, 이 group을 카메라가 추적
 * - 전진(W/↑)·후진(S/↓), 이동 중에만 A/D(←/→)로 회전
 * - Shift 누르면 부스터(가속) 속도 적용
 */
import * as THREE from 'three';

// 속도: 초당 단위 (delta 적용으로 프레임률과 무관하게 동일한 체감)
const CAR_SPEED = 8; // 기본 이동 속도 (초당)
const CAR_SPEED_BOOST = 18; // 시프트 부스터 시 목표 속도 (초당)
const CAR_TURN = 1.8; // 회전 속도 (초당 라디안, delta 적용)
// 가속/감속: 초당 수렴 비율
const ACCEL_RATE = 2.2; // 엑셀 밟을 때 목표 속도까지 가속
const DECEL_RATE = 3.5; // 부스터 해제 시 기본 속도로 감속
const COAST_RATE = 2.0; // 키에서 손 떼면 0으로 서서히 감속 (관성)

export default class Car {
  constructor(scene, app) {
    this.scene = scene;
    this.app = app;
    this.group = new THREE.Group(); // 차 전체를 담는 그룹 (카메라가 position 추적)
    this.currentSpeed = CAR_SPEED; // 엑셀 목표 속도 (부스터 시 더 커짐)
    this.velocity = 0; // 실제 전진/후진 속도 (키 떼면 0으로 서서히 감속)
    this.setMesh();
    this.setControls();
    this.scene.add(this.group);
  }

  /** 박스/원기둥으로 차체·지붕·바퀴 4개 생성 후 group에 추가 */
  setMesh() {
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
    const wheelPositions = [
      [-0.7, 0.28, 0.7],
      [0.7, 0.28, 0.7],
      [-0.7, 0.28, -0.7],
      [0.7, 0.28, -0.7],
    ];
    wheelPositions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(...pos);
      wheel.rotation.z = Math.PI / 2; // 옆으로 눕혀서 바퀴처럼
      wheel.castShadow = true;
      this.group.add(wheel);
    });

    this.group.position.set(0, 0, 0);
  }

  /** 키 눌림 상태를 저장. keydown → true, keyup → false */
  setControls() {
    this.keys = {};
    window.addEventListener('keydown', (e) => (this.keys[e.key] = true));
    window.addEventListener('keyup', (e) => (this.keys[e.key] = false));
  }

  /**
   * 매 프레임: delta 기반 가속/감속·관성·이동·회전.
   * 키를 떼면 목표 속도를 0으로 두고 velocity가 COAST_RATE로 서서히 0에 수렴.
   */
  update() {
    const deltaSec = (this.app?.time?.delta ?? 16) * 0.001;

    const movingForward =
      this.keys['w'] || this.keys['W'] || this.keys['ArrowUp'];
    const movingBackward =
      this.keys['s'] || this.keys['S'] || this.keys['ArrowDown'];
    const isMoving = movingForward || movingBackward;

    // 엑셀 목표 속도 (부스터 여부에 따라)
    const targetSpeed = this.keys['Shift'] ? CAR_SPEED_BOOST : CAR_SPEED;
    const isAccelerating = targetSpeed > this.currentSpeed;
    const rate = isAccelerating ? ACCEL_RATE : DECEL_RATE;
    const t = 1 - Math.exp(-rate * deltaSec);
    this.currentSpeed += (targetSpeed - this.currentSpeed) * t;

    // 전진/후진 목표: 키가 있으면 currentSpeed 방향, 없으면 0(관성 감속)
    let targetVelocity = 0;
    if (movingForward) targetVelocity = this.currentSpeed;
    else if (movingBackward) targetVelocity = -this.currentSpeed;
    // 키를 뗐을 때는 COAST_RATE로 0에 수렴, 엑셀/감속 중에는 rate 사용
    const velocityRate = isMoving ? rate : COAST_RATE;
    const tVel = 1 - Math.exp(-velocityRate * deltaSec);
    this.velocity += (targetVelocity - this.velocity) * tVel;

    const move = this.velocity * deltaSec;
    this.group.position.x -= Math.sin(this.group.rotation.y) * move;
    this.group.position.z -= Math.cos(this.group.rotation.y) * move;

    if (isMoving) {
      const turn = CAR_TURN * deltaSec;
      const steerDir = this.velocity >= 0 ? 1 : -1; // 후진일 때 조향 반대로
      if (this.keys['a'] || this.keys['A'] || this.keys['ArrowLeft'])
        this.group.rotation.y += turn * steerDir;
      if (this.keys['d'] || this.keys['D'] || this.keys['ArrowRight'])
        this.group.rotation.y -= turn * steerDir;
    }
  }
}
