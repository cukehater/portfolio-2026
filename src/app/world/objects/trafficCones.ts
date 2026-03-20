/**
 * TrafficCones — 교통 콘 (면허 시험장 슬라롬 코스)
 * 뒤집어진 ㄱ자 2열: 안쪽/바깥 경로를 각각 최소 간격으로 샘플링해 겹침 제거
 */
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import { getApp } from '../../index.ts';
import Debug from '../../utils/debug.ts';
import { getObjectBoundSize } from '../../utils/objectBounds.ts';

const CONFIG = {
  coneScale: 2.5,
  spacing: 1.2,
  laneOffset: 2.75,
  segmentZCount: 5,
  segmentXCount: 5,
  cornerRadius: 0.75,
} as const;

/** 경로상 한 점: 위치 + 진행 방향(Yaw, 라디안) */
type LanePoint = { x: number; z: number; yaw: number };

/**
 * dedupe 후 yaw 재계산: 끝점은 진행 방향(다음/이전 콘), 중간은 이전↔다음 중앙차분.
 * 호 위에서는 중앙차분이 접선에 가깝고, 직선–호 이음새에서도 배치된 점들과 맞음.
 */
function assignYawAlongPolyline(points: LanePoint[]): void {
  const n = points.length;
  if (n < 2) return;
  for (let i = 0; i < n; i++) {
    let dx: number;
    let dz: number;
    if (i === 0) {
      dx = points[1].x - points[0].x;
      dz = points[1].z - points[0].z;
    } else if (i === n - 1) {
      dx = points[i].x - points[i - 1].x;
      dz = points[i].z - points[i - 1].z;
    } else {
      dx = points[i + 1].x - points[i - 1].x;
      dz = points[i + 1].z - points[i - 1].z;
    }
    if (Math.hypot(dx, dz) < 1e-6) continue;
    points[i].yaw = Math.atan2(dx, dz);
  }
}

function addCone(
  group: THREE.Group,
  gltf: GLTF,
  scale: number,
  x: number,
  z: number,
  yaw = 0
): void {
  const cone = gltf.scene.clone(true);
  cone.scale.setScalar(scale);
  cone.position.set(x, 0, z);
  cone.rotation.set(0, yaw, 0);
  cone.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      (child as THREE.Mesh).castShadow = true;
      (child as THREE.Mesh).receiveShadow = true;
    }
  });
  group.add(cone);
}

/**
 * 직선1(+Z) → 1/4원호(θ π→π/2, 진행 접선) → 직선2(+X)
 * 콘 메시가 진행 방향과 어긋나면 꺾임에서만 삐뚤어 보이므로 yaw를 접선에 맞춤.
 */
function buildLanePath(
  half: number,
  spacing: number,
  r: number,
  segmentZCount: number,
  segmentXCount: number,
  inner: boolean
): LanePoint[] {
  const sign = inner ? 1 : -1;
  const zEnd = (segmentZCount - 1) * spacing;
  const zStraightEnd = zEnd - r;
  const centerX = r;
  const centerZ = zEnd - r;
  const laneX = sign * half;
  const laneZSeg2 = zEnd - sign * half;

  const ri = Math.max(0.12, r - half);
  const ro = r + half;
  const radius = inner ? ri : ro;

  const minDist = spacing * 0.72;
  const cand: LanePoint[] = [];

  /** 첫 직선: +Z 진행 */
  for (let i = 0; i < segmentZCount; i++) {
    const z = i * spacing;
    if (z > zStraightEnd) break;
    cand.push({ x: laneX, z, yaw: 0 });
  }
  cand.push({ x: laneX, z: zStraightEnd, yaw: 0 });

  const dTheta = spacing / Math.max(radius, 0.18);
  let theta = Math.PI;
  while (theta > Math.PI * 0.5 + 1e-4) {
    theta -= dTheta;
    if (theta <= Math.PI * 0.5) break;
    /** θ 감소 방향 접선 (sinθ, -cosθ) → Y축 회전 */
    const yaw = Math.atan2(Math.sin(theta), -Math.cos(theta));
    cand.push({
      x: centerX + radius * Math.cos(theta),
      z: centerZ + radius * Math.sin(theta),
      yaw,
    });
  }

  /** 둘째 직선: +X 진행 */
  const yawX = Math.PI * 0.5;
  for (let i = 0; i < segmentXCount; i++) {
    cand.push({ x: r + i * spacing, z: laneZSeg2, yaw: yawX });
  }

  const out: LanePoint[] = [];
  for (const p of cand) {
    const prev = out[out.length - 1];
    if (!prev || Math.hypot(p.x - prev.x, p.z - prev.z) >= minDist) {
      out.push({ ...p });
    }
  }
  assignYawAlongPolyline(out);
  return out;
}

export default class TrafficCones {
  debug: Debug;
  parent: THREE.Object3D;
  group: THREE.Group;
  private gltf!: GLTF;
  layoutParams = { laneSpacing: CONFIG.laneOffset };

  constructor(parent: THREE.Object3D, gltf: GLTF) {
    this.debug = getApp().debug;
    this.parent = parent;
    this.group = new THREE.Group();
    this.gltf = gltf;
    this.rebuildCones();

    const officeDeskSize = getObjectBoundSize('office_desk');

    this.group.position.set(officeDeskSize.x / 2 - 4, 0, 5);
    this.group.rotation.set(0, -Math.PI / 2, 0);
    this.parent.add(this.group);
    this.setGui();
  }

  /** 열 간격·경로에 맞춰 콘 전부 재배치 (겹침 없이) */
  private rebuildCones(): void {
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }

    const half = this.layoutParams.laneSpacing * 0.5;
    const { spacing, segmentZCount, segmentXCount, cornerRadius: r } = CONFIG;

    const innerPath = buildLanePath(
      half,
      spacing,
      r,
      segmentZCount,
      segmentXCount,
      true
    );
    const outerPath = buildLanePath(
      half,
      spacing,
      r,
      segmentZCount,
      segmentXCount,
      false
    );

    for (const { x, z, yaw } of innerPath) {
      addCone(this.group, this.gltf, CONFIG.coneScale, x, z, yaw);
    }
    for (const { x, z, yaw } of outerPath) {
      addCone(this.group, this.gltf, CONFIG.coneScale, x, z, yaw);
    }
  }

  setGui(): void {
    const trafficConeFolder = this.debug.gui.addFolder('🚦 Traffic Cones');
    trafficConeFolder
      .add(this.layoutParams, 'laneSpacing')
      .min(0.2)
      .max(3)
      .step(0.05)
      .name('Lane Spacing')
      .onChange(() => this.rebuildCones());
    trafficConeFolder
      .add(this.group.position, 'x')
      .min(-80)
      .max(80)
      .step(0.5)
      .name('Position X');
    trafficConeFolder
      .add(this.group.position, 'z')
      .min(-80)
      .max(80)
      .step(0.5)
      .name('Position Z');

    trafficConeFolder.close();
  }
}
