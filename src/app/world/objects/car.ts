/**
 * =============================================================================
 * car.ts — Car: 키보드로 움직이는 사이버트럭 + 스폰(낙하/바운스) 연출
 * =============================================================================
 *
 * Three.js에서 “움직이는 물체”는 보통 `Group`으로 묶습니다.
 * - 차체 GLB
 * - 바퀴 4개(같은 wheel GLB를 복제)
 *
 * 입력은 `window`의 keydown/keyup으로 받습니다.
 * - ArrowUp/Down: 전진/후진 목표 속도
 * - ArrowLeft/Right: 회전(전진 중일 때만 자연스럽게)
 * - Shift + ArrowUp: 스프린트(더 빠른 목표 속도)
 *
 * 좌표 이동은 `delta`(초)를 곱해 기기 성능과 무관하게 맞춥니다.
 */

import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import App from '../../index.ts';
// import { getObjectBoundSize } from '@/lib/objectBounds.ts';

/** 키보드로 추적할 키 목록 — 여기 없는 키는 무시합니다. */
const CONTROL_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Shift',
]);

/**
 * 게임 플레이 튜닝 상수 모음
 * (숫자를 바꾸면 체감 난이도/무게감이 크게 달라져요)
 */
const CONFIG = {
  drive: {
    /** 기본 최대 속도(월드 단위/초 근처) */
    speed: 8,
    /** 스프린트 시 속도 배율 */
    sprintMultiplier: 1.75,
    /** 기본 회전 민첩성 */
    turn: 1.8,
    /** 스프린트 중 회전을 살짝 더 반응적으로 */
    sprintTurnMultiplier: 1.1,
    /** 속도 목표로 올라갈 때의 반응성 */
    accelRate: 2.2,
    /** 속도 목표로 내려갈 때의 반응성 */
    decelRate: 3.5,
    /** 키를 뗀 뒤 관성으로 줄어드는 반응성 */
    coastRate: 2.0,
  },
  wheel: {
    /** 최대 조향각(라디안) */
    maxSteerAngle: Math.PI / 6,
    /** 바퀴 굴러가는 시각적 속도 배율 */
    rollFactor: 2.5,
    /**
     * 바퀴 4개의 “조향 피벗” 로컬 위치
     * (차 로컬 좌표계 기준으로 어디에 달릴지)
     */
    positions: [
      [0.65, 0, -0.8],
      [-0.65, 0, -0.8],
      [0.65, 0, 0.85],
      [-0.65, 0, 0.85],
    ] as [number, number, number][],
  },
  spawn: {
    /** 스폰 시 바닥(y=spawnFloorY) 위로 얼마나 떠 있을지 */
    height: 4.04,
    /** 중력 가속도(단순 Euler 적분용 튜닝 값) */
    gravity: 22,
    /** 첫 바닥 충돌 후 위로 튕기는 초기 속도 */
    bounceInitial: 4.2,
    /** 튕김 감쇠 — 0~1에 가까울수록 빨리 작아짐 */
    bounceDamping: 0.58,
    /** 거의 멈췄다고 보는 임계값 */
    idleThreshold: 0.03,
    /** 무한 튕김 방지 */
    bounceMax: 10,
  },
} as const;

/**
 * matcap PNG 경로들 — `static/textures/matcaps`에 복사된 오마주 텍스처
 * (경로는 Vite public 루트 기준: `/textures/...`)
 */
const CAR_TEXTURE = {
  bodyMatcap: '/textures/matcaps/metal.png',
  fenderMatcap: '/textures/matcaps/gray.png',
  windowMatcap: '/textures/matcaps/black.png',
  tireMatcap: '/textures/matcaps/black.png',
  rimMatcap: '/textures/matcaps/beige.png',
  brakeLightMatcap: '/textures/matcaps/red.png',
  reverseLightMatcap: '/textures/matcaps/yellow.png',
} as const;

/** Mesh가 가진 material을 안전하게 dispose (배열 material도 지원) */
function disposeMeshMaterial(mesh: THREE.Mesh): void {
  const m = mesh.material;
  if (Array.isArray(m)) m.forEach((mat) => mat.dispose());
  else m?.dispose();
}

/** 텍스처 색 공간 — 디스플레이에서 밝기/색이 덜 어색해짐 */
function prepareMatcapTexture(tex: THREE.Texture): void {
  tex.colorSpace = THREE.SRGBColorSpace;
}

/**
 * matcap PNG 로드 + 실패 시 단색 1×1 텍스처로 폴백
 * (네트워크 실패/경로 오타에도 앱이 죽지 않게)
 */
function loadMatcapOrFallback(
  loader: THREE.TextureLoader,
  path: string,
  fallbackHex: number
): Promise<THREE.Texture> {
  return loader
    .loadAsync(path)
    .then((tex) => {
      prepareMatcapTexture(tex);
      return tex;
    })
    .catch(() => {
      const color = new THREE.Color(fallbackHex);
      const tex = new THREE.DataTexture(
        new Uint8Array([
          Math.round(color.r * 255),
          Math.round(color.g * 255),
          Math.round(color.b * 255),
          255,
        ]),
        1,
        1
      );
      tex.needsUpdate = true;
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    });
}

/**
 * 차체 GLB 내부 Mesh 이름에 따라 matcap 재질을 다르게 입힙니다.
 * - `frame`: 메인 바디
 * - `fender`: 휀더
 * - `window`: 유리 느낌(반투명)
 */
function applyBodyMaterials(
  root: THREE.Object3D,
  matcaps: {
    body: THREE.Texture;
    fender: THREE.Texture;
    window: THREE.Texture;
  }
): void {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    if (child.name === 'frame') {
      disposeMeshMaterial(child);
      child.material = new THREE.MeshMatcapMaterial({ matcap: matcaps.body });
      return;
    }
    if (child.name === 'fender') {
      disposeMeshMaterial(child);
      child.material = new THREE.MeshMatcapMaterial({
        matcap: matcaps.fender,
        color: 0x9e8f81,
      });
      return;
    }
    if (child.name === 'window') {
      disposeMeshMaterial(child);
      child.material = new THREE.MeshMatcapMaterial({
        matcap: matcaps.window,
        color: 0x171717,
        transparent: true,
        opacity: 0.94,
      });
    }
  });
}

/**
 * 전조등/후미등처럼 “발광 클러스터” 메시에 matcap을 입힙니다.
 * 그림자는 끄는 편이 자연스럽습니다(스스로 그림자를 드리우면 어색).
 */
function applyLightClusterMaterial(
  root: THREE.Object3D,
  matcap: THREE.Texture,
  colorHex: number
): void {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    disposeMeshMaterial(child);
    child.material = new THREE.MeshMatcapMaterial({
      matcap,
      color: colorHex,
    });
    child.castShadow = false;
    child.receiveShadow = false;
  });
}

/**
 * wheel GLB 내부에서 이름이 `tire`/`wheel`인 Mesh에 재질을 지정합니다.
 * 같은 tire/rim Material 인스턴스를 공유해 draw call/메모리를 절약합니다.
 */
function applyWheelTireAndRimMaterials(
  wheelRoot: THREE.Object3D,
  tireMat: THREE.MeshMatcapMaterial,
  rimMat: THREE.MeshMatcapMaterial
): void {
  wheelRoot.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = true;
    child.receiveShadow = true;

    if (child.name === 'tire') {
      disposeMeshMaterial(child);
      child.material = tireMat;
      return;
    }
    if (child.name === 'wheel') {
      disposeMeshMaterial(child);
      child.material = rimMat;
    }
  });
}

/**
 * 바퀴를 “굴러가는 축”이 메시의 기하 중심과 다를 때가 많아서,
 * rollPivot을 중심에 맞추는 보정 함수입니다.
 *
 * 핵심 아이디어:
 * - rollPivot.position을 중심 오프셋으로 옮기고
 * - wheel.position을 반대로 빼서 월드 위치는 그대로 유지
 */
function alignRollAxisToWheelCenter(
  steerPivot: THREE.Group,
  rollPivot: THREE.Group,
  wheel: THREE.Object3D
): void {
  steerPivot.add(rollPivot);
  rollPivot.add(wheel);
  steerPivot.updateMatrixWorld(true);
  wheel.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(wheel);
  if (box.isEmpty()) return;

  const centerWorld = new THREE.Vector3();
  box.getCenter(centerWorld);

  const inRoll = new THREE.Vector3();
  rollPivot.worldToLocal(inRoll.copy(centerWorld));

  rollPivot.position.copy(inRoll);
  wheel.position.sub(inRoll);
}

export default class Car {
  scene: THREE.Scene;
  app: App;
  group: THREE.Group;

  /** 바닥 높이(월드 y) — 현재는 책상 상판 기준 0 */
  private readonly spawnFloorY = 0;

  /** 앞바퀴 조향용 pivot(좌/우) */
  private wheelSteerPivots: THREE.Group[] = [];

  /** 굴림 회전을 적용할 pivot */
  private wheelRollPivots: THREE.Object3D[] = [];

  /** 현재 조향각(라디안) */
  currentSteerAngle = 0;

  /** 누적 roll 각도 — 바퀴 메시 rotation.x에 반영 */
  cumulativeWheelRoll = 0;

  /** 목표 속도에 가까워지도록 보간되는 “상한 속도” 느낌의 값 */
  currentSpeed: number;

  /** 실제 전진/후진 속도(관성 포함) */
  velocity: number;

  /** 키가 눌려 있는지 맵 — keydown/keyup으로 true/false */
  keys: Record<string, boolean>;

  /** 낙하/바운스/주행 가능 상태 */
  spawnState: 'falling' | 'bouncing' | 'idle' = 'falling';

  /** 수직 속도(단순 중력 적분) */
  verticalVelocity = 0;

  /** 바운스 횟수 카운트 — 너무 많이 튕기면 강제 종료 */
  private landingBounceCount = 0;

  /** GLB 조립이 끝났는지(중복 mount 방지) */
  private _assetsMounted = false;

  constructor(scene: THREE.Scene) {
    this.app = new App();
    this.scene = scene;

    this.group = new THREE.Group();
    this.currentSpeed = CONFIG.drive.speed;
    this.velocity = 0;
    this.keys = {};

    this.setControls();
    this.scene.add(this.group);

    this.mountFromResources();
  }

  /**
   * GLB들을 clone해서 Group 트리를 구성합니다.
   * async이지만 내부에서 에러를 삼키지 않도록 주의(현재는 실패 시 return).
   */
  private async mountFromResources(): Promise<void> {
    if (this._assetsMounted) return;

    const bodyGltf = this.app.resources.items['cybertruck_body'] as
      | GLTF
      | undefined;
    const headGltf = this.app.resources.items['cybertruck_head_light'] as
      | GLTF
      | undefined;
    const tailGltf = this.app.resources.items['cybertruck_tail_light'] as
      | GLTF
      | undefined;
    const wheelGltf = this.app.resources.items['cybertruck_wheel'] as
      | GLTF
      | undefined;

    if (!bodyGltf?.scene || !wheelGltf?.scene) return;

    const loader = new THREE.TextureLoader();
    const [
      bodyMatcap,
      fenderMatcap,
      windowMatcap,
      tireMatcap,
      rimMatcap,
      brakeLightMatcap,
      reverseLightMatcap,
    ] = await Promise.all([
      loadMatcapOrFallback(loader, CAR_TEXTURE.bodyMatcap, 0xb8b8b8),
      loadMatcapOrFallback(loader, CAR_TEXTURE.fenderMatcap, 0x7f7f7f),
      loadMatcapOrFallback(loader, CAR_TEXTURE.windowMatcap, 0x111111),
      loadMatcapOrFallback(loader, CAR_TEXTURE.tireMatcap, 0x202020),
      loadMatcapOrFallback(loader, CAR_TEXTURE.rimMatcap, 0xf0e6d7),
      loadMatcapOrFallback(loader, CAR_TEXTURE.brakeLightMatcap, 0xff4040),
      loadMatcapOrFallback(loader, CAR_TEXTURE.reverseLightMatcap, 0xffe889),
    ]);

    const bodyGroup = new THREE.Group();

    const body = bodyGltf.scene.clone(true);
    applyBodyMaterials(body, {
      body: bodyMatcap,
      fender: fenderMatcap,
      window: windowMatcap,
    });

    bodyGroup.add(body);

    if (headGltf?.scene) {
      const head = headGltf.scene.clone(true);
      applyLightClusterMaterial(head, reverseLightMatcap, 0xffeab0);
      bodyGroup.add(head);
    }
    if (tailGltf?.scene) {
      const tail = tailGltf.scene.clone(true);
      applyLightClusterMaterial(tail, brakeLightMatcap, 0xff3f3f);
      bodyGroup.add(tail);
    }

    // 차체를 살짝 띄워 바퀴와 바닥 관계가 자연스럽게
    bodyGroup.position.y = 0.65;

    this.group.add(bodyGroup);

    this.wheelSteerPivots = [];
    this.wheelRollPivots = [];

    const tireMaterial = new THREE.MeshMatcapMaterial({
      matcap: tireMatcap,
      color: 0x242424,
    });
    const rimMaterial = new THREE.MeshMatcapMaterial({
      matcap: rimMatcap,
      color: 0xd5cec4,
    });

    CONFIG.wheel.positions.forEach((pos) => {
      const steerPivot = new THREE.Group();
      steerPivot.position.set(...pos);
      const rollPivot = new THREE.Group();
      const wheel = wheelGltf.scene.clone(true);
      applyWheelTireAndRimMaterials(wheel, tireMaterial, rimMaterial);
      // 오른쪽 바퀴는 메시가 반대로 보일 수 있어 Y 회전으로 맞춤
      if (pos[0] > 0) {
        wheel.rotation.y = Math.PI;
      }

      this.group.add(steerPivot);
      alignRollAxisToWheelCenter(steerPivot, rollPivot, wheel);
      this.wheelSteerPivots.push(steerPivot);
      this.wheelRollPivots.push(rollPivot);
    });

    // 책상 위 적당한 위치에 스폰 — desk 바운딩을 이용해 “책상 안”으로 배치
    // const desk = getObjectBoundSize('office_desk');
    this.group.position.set(
      // desk.x / 2 - 2.5,
      // this.spawnFloorY + CONFIG.spawn.height,
      // 5.25
      -12,
      10,
      10
    );
    this.group.rotation.set(0, Math.PI / 2, 0);

    this.spawnState = 'falling';
    this.verticalVelocity = 0;
    this.landingBounceCount = 0;
    this._assetsMounted = true;
  }

  /** 키 입력 리스너 등록 */
  setControls(): void {
    this.keys = {};
    window.addEventListener('keydown', (e) => {
      if (!CONTROL_KEYS.has(e.key)) return;
      e.preventDefault();
      this.keys[e.key] = true;
    });
    window.addEventListener('keyup', (e) => {
      if (!CONTROL_KEYS.has(e.key)) return;
      this.keys[e.key] = false;
    });
  }

  /**
   * 매 프레임:
   * 1) 낙하/바운스 처리
   * 2) idle이 되기 전에는 조작 불가(스폰 연출 우선)
   * 3) 이동/회전/바퀴 애니메이션
   */
  update(): void {
    const deltaSec = ((this.app?.time?.delta ?? 16) as number) * 0.001;

    this.updateLanding(deltaSec);
    if (this.spawnState !== 'idle') return;

    const movingForward = Boolean(this.keys['ArrowUp']);
    const movingBackward = Boolean(this.keys['ArrowDown']);
    const isMoving = movingForward || movingBackward;
    const isSprinting = movingForward && Boolean(this.keys['Shift']);

    const targetSpeed = isSprinting
      ? CONFIG.drive.speed * CONFIG.drive.sprintMultiplier
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
    // 차의 yaw(rotation.y) 기준으로 앞쪽으로 이동 — 삼각함수로 벡터 분해
    this.group.position.x -= Math.sin(this.group.rotation.y) * move;
    this.group.position.z -= Math.cos(this.group.rotation.y) * move;

    const hasVelocity = Math.abs(this.velocity) > 0.01;
    if (isMoving || hasVelocity) {
      const steerDir = this.velocity >= 0 ? 1 : -1;
      const speedRatio = isMoving
        ? 1
        : Math.min(1, Math.abs(this.velocity) / CONFIG.drive.speed);
      const sprintTurnFactor = isSprinting
        ? CONFIG.drive.sprintTurnMultiplier
        : 1;
      const turn = CONFIG.drive.turn * sprintTurnFactor * deltaSec * speedRatio;
      if (this.keys['ArrowLeft']) this.group.rotation.y += turn * steerDir;
      if (this.keys['ArrowRight']) this.group.rotation.y -= turn * steerDir;
    }

    this.updateWheels(deltaSec);
  }

  /**
   * 단순 중력 + 바닥 충돌 + 바운스 감쇠.
   * 물리 엔진은 아니지만, 연출용으로는 가볍고 이해하기 쉽습니다.
   */
  private updateLanding(deltaSec: number): void {
    if (this.spawnState === 'idle') return;

    this.verticalVelocity -= CONFIG.spawn.gravity * deltaSec;
    this.group.position.y += this.verticalVelocity * deltaSec;

    const floorY = this.spawnFloorY;
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

  /** 바퀴 roll 회전 + 앞바퀴 steer 보간 */
  private updateWheels(deltaSec: number): void {
    if (this.wheelRollPivots.length < 4) return;

    this.cumulativeWheelRoll -=
      this.velocity * deltaSec * CONFIG.wheel.rollFactor;

    let targetSteer = 0;
    if (this.keys['ArrowLeft']) targetSteer = CONFIG.wheel.maxSteerAngle;
    if (this.keys['ArrowRight']) targetSteer = -CONFIG.wheel.maxSteerAngle;
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
