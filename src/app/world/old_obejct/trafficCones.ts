import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import { getApp } from '../../../index.ts';
import Debug from '@/lib/debug.ts';
import { getObjectBoundSize } from '@/lib/objectBounds.ts';
const CONFIG = {
  coneScale: 2.5,
  spacing: 1.2,
  laneOffset: 2.75,
  segmentZCount: 5,
  segmentXCount: 5,
  cornerRadius: 0.75,
} as const;
type LanePoint = {
  x: number;
  z: number;
  yaw: number;
};
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
    const yaw = Math.atan2(Math.sin(theta), -Math.cos(theta));
    cand.push({
      x: centerX + radius * Math.cos(theta),
      z: centerZ + radius * Math.sin(theta),
      yaw,
    });
  }
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
