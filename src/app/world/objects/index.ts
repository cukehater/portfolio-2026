/**
 * objects — 씬의 모든 오브젝트(모델·차·테스트 오브젝트) 관리
 *
 * - GLB 모델: resources.ready 후 createSceneModels()로 배치
 * - Car, TestObjects: World에서 직접 인스턴스 생성
 */
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/Addons.js';

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
// import StandLamp from './standLamp.ts';
// import Guitar from './guitar.ts';
// import Basketball from './basketball.ts';
import StickyNote from './stickyNote.ts';
import StickyNotePad from './stickyNotePad.ts';
// import CukehaterText from './cukehaterText.ts';
import TrafficCones from './trafficCones.ts';
// import Speaker from './speaker.ts';
// import HandStrengthener from './handStrengthener.ts';
// import Fan from './fan.ts';
import Dice from './dice.ts';
// import ChocolateBar from './chocolateBar.ts';
// import BasketballNet from './basketballNet.ts';
// import FeathersMcGraw from './feathers_mcgraw.ts';
import Keycaps from './keycaps.ts';
import { getApp } from '../../index.ts';
import SignBoard from './signBoard.ts';
import Phone from './phone.ts';
import Handcream from './handcream.ts';

export { default as Car } from './car.ts';

export function createSceneModels(scene: THREE.Scene): void {
  const items = getApp().resources.items as Record<string, GLTF>;

  const mapGroup = new THREE.Group();
  mapGroup.name = 'Map';

  new OfficeDesk(mapGroup, items['office_desk']);
  new OfficeChair(mapGroup, items['office_chair']);

  new DeskMat(mapGroup, items['desk_mat']);
  new Mug(mapGroup, items['mug']);
  new Phone(mapGroup, items['phone']);
  new Laptop(mapGroup, items['laptop']);
  new BookStack(mapGroup, items['book']);

  new MonitorStand(mapGroup, items['monitor_stand']);
  new Monitor(mapGroup, items['monitor']);
  new StickyNote(mapGroup, items['sticky_note']);
  new StickyNotePad(mapGroup, items['sticky_note_pad']);
  new Succulent(mapGroup, items['succulent']);
  new PhotoFrame(mapGroup, items['photo_frame']);

  new TrafficCones(mapGroup, items['traffic_cone']);
  new SignBoard(mapGroup, items['sign_board']);
  new Keycaps(mapGroup, items['keycap']);

  new Dice(mapGroup, items['dice']);
  new Handcream(mapGroup, items['handcream']);

  // new StandLamp(mapGroup, items['stand_lamp']);

  // new Guitar(mapGroup, items['guitar'], items['guitar_stand']);
  // new Basketball(mapGroup);
  // new Speaker(mapGroup, items['speaker']);
  // new HandStrengthener(mapGroup, items['hand_strengthener']);
  // new ChocolateBar(mapGroup, items['chocolate_bar']);
  // new BasketballNet(mapGroup, items['basketball_net']);
  // new FeathersMcGraw(mapGroup, items['feathers_mcgraw']);

  // mapGroup.scale.setScalar(0.75);

  scene.add(mapGroup);
}
