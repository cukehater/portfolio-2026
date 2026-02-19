import * as THREE from "three";
import App from "../app.js";

export default class TestModel {
  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    this.resources = this.app.resources;
    this.time = this.app.time;

    // Resource
    this.resource = this.resources.items.feathersMcGrawModel;

    this.setModel();
    // this.setAnimation();
  }

  setModel() {
    this.model = this.resource.scene;
    this.model.scale.set(0.035, 0.035, 0.035);
    this.model.position.y = -1.5;
    this.model.rotation.y = 0.5;
    this.scene.add(this.model);

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
      }
    });
  }

  // setAnimation() {
  //   this.animation = {};

  //   // Mixer
  //   this.animation.mixer = new THREE.AnimationMixer(this.model);

  //   // Actions
  //   this.animation.actions = {};

  //   this.animation.actions.idle = this.animation.mixer.clipAction(
  //     this.resource.animations[0]
  //   );
  //   this.animation.actions.walking = this.animation.mixer.clipAction(
  //     this.resource.animations[1]
  //   );
  //   this.animation.actions.running = this.animation.mixer.clipAction(
  //     this.resource.animations[2]
  //   );

  //   this.animation.actions.current = this.animation.actions.idle;
  //   this.animation.actions.current.play();

  //   // Play the action
  //   this.animation.play = (name) => {
  //     const newAction = this.animation.actions[name];
  //     const oldAction = this.animation.actions.current;

  //     newAction.reset();
  //     newAction.play();
  //     newAction.crossFadeFrom(oldAction, 1);

  //     this.animation.actions.current = newAction;
  //   };
  // }

  update() {
    // this.animation.mixer.update(this.time.delta * 0.001);
  }
}
