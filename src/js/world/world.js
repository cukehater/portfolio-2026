import App from "../app.js";
import Environment from "./environment.js";
import TestModel from "./testModel.js";

export default class World {
  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    this.resources = this.app.resources;

    this.resources.on("ready", this.ready.bind(this));
  }

  ready() {
    this.testModel = new TestModel();
    this.environment = new Environment();
  }

  update() {
    if (this.testModel) {
      this.testModel.update();
    }
  }
}
