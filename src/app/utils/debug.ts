import GUI from 'lil-gui';

export default class Debug {
  gui: GUI;

  constructor() {
    this.gui = new GUI({
      width: 200,
      title: '🪲 Debug UI',
    });

    this.gui.close();
  }
}
