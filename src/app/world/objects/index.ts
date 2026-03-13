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
import ComputerScreen from './computerScreen.ts';
import ComputerKeyboard from './computerKeyboard.ts';
import VerticalMouse from './verticalMouse.ts';
import ComputerSpeaker from './computerSpeaker.ts';
import VintageDeskLamp from './vintageDeskLamp.ts';
import StickyNote from './stickyNote.ts';
import ToiletRoll from './toiletRoll.ts';
import Clipboard from './clipboard.ts';
import DeskMat from './deskMat.ts';
import BookStack from './bookStack.ts';

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
  new ComputerScreen(mapGroup, items['computer_screen']);
  new ComputerKeyboard(mapGroup, items['computer_keyboard']);
  new VerticalMouse(mapGroup, items['vertical_mouse']);
  new ComputerSpeaker(mapGroup, items['computer_speaker'], 'left');
  new ComputerSpeaker(mapGroup, items['computer_speaker'], 'right');
  new VintageDeskLamp(mapGroup, items['vintage_desk_lamp']);
  new StickyNote(mapGroup, items['sticky_note']);
  new Clipboard(mapGroup, items['clipboard']);
  new ToiletRoll(mapGroup, items['toilet_roll']);
  new DeskMat(mapGroup, items['desk_mat']);
  new BookStack(mapGroup, items['book']);

  mapGroup.scale.setScalar(0.2);

  scene.add(mapGroup);
}
