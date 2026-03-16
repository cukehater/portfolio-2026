/**
 * objects — 씬의 모든 오브젝트(모델·차·테스트 오브젝트) 관리
 *
 * - GLB 모델: resources.ready 후 createSceneModels()로 배치
 * - Car, TestObjects: World에서 직접 인스턴스 생성
 */
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';
import type Resources from '../../utils/resources.ts';
import OfficeDesk from './officeDesk.ts';
import OfficeChair from './officeChair.ts';
import Monitor from './monitor.ts';
import DeskMat from './deskMat.ts';
import BookStack from './bookStack.ts';
import Laptop from './laptop.ts';
import MonitorStand from './monitorStand.ts';
import Mug from './mug.ts';
import Succulent from './succulent.ts';
import PhotoFrame from './photoFrame.ts';
import StandLamp from './standLamp.ts';
import Guitar from './guitar.ts';
import Basketball from './basketball.ts';
import StickyNote from './stickyNote.ts';
import StickyNotePad from './stickyNotePad.ts';
import CukehaterText from './cukehaterText.ts';
import TrafficCones from './trafficCones.ts';
import Speaker from './speaker.ts';
import HandStrengthener from './handStrengthener.ts';
import Fan from './fan.ts';
import Dice from './dice.ts';
import ChocolateBar from './chocolateBar.ts';
import BasketballNet from './basketballNet.ts';

export { default as Car } from './car.ts';

export function createSceneModels(
  scene: THREE.Scene,
  resources: InstanceType<typeof Resources>
): void {
  const items = resources.items as Record<string, GLTF>;

  const mapGroup = new THREE.Group();
  mapGroup.name = 'Map';

  new OfficeDesk(mapGroup, items['office_desk']);
  new OfficeChair(mapGroup, items['office_chair']);
  new Monitor(mapGroup, items['monitor']);
  new MonitorStand(mapGroup, items['monitor_stand']);
  new DeskMat(mapGroup, items['desk_mat']);
  new BookStack(mapGroup, items['book']);
  new Laptop(mapGroup, items['laptop']);
  new Mug(mapGroup, items['mug']);
  new Succulent(mapGroup, items['succulent']);
  new PhotoFrame(mapGroup, items['photo_frame']);
  new StandLamp(mapGroup, items['stand_lamp']);
  new Guitar(mapGroup, items['guitar'], items['guitar_stand']);
  new Basketball(mapGroup);
  new StickyNote(mapGroup, items['sticky_note']);
  new StickyNotePad(mapGroup, items['sticky_note_pad']);
  new CukehaterText(mapGroup);
  new TrafficCones(mapGroup, items['traffic_cone']);
  new Speaker(mapGroup, items['speaker']);
  new HandStrengthener(mapGroup, items['hand_strengthener']);
  new Fan(mapGroup, items['fan']);
  new Dice(mapGroup, items['dice']);
  new ChocolateBar(mapGroup, items['chocolate_bar']);
  new BasketballNet(mapGroup, items['basketball_net']);

  mapGroup.scale.setScalar(0.2);

  scene.add(mapGroup);
}
