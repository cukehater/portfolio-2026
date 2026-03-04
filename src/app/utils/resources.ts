import * as THREE from 'three';
import EventEmitter from './event-emitter.ts';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/Addons.js';

export interface SourceItem {
  name: string;
  type: 'gltfModel' | 'texture' | 'cubeTexture';
  path: string;
}

interface Loaders {
  gltfLoader: GLTFLoader;
  textureLoader: THREE.TextureLoader;
  cubeTextureLoader: THREE.CubeTextureLoader;
}

type LoadedItem = GLTF | THREE.Texture | THREE.CubeTexture;

export default class Resources extends EventEmitter {
  sources: SourceItem[];
  items: Record<string, LoadedItem>;
  toLoad: number;
  loaded: number;
  loaders: Loaders;

  constructor(sources: SourceItem[]) {
    super();

    this.sources = sources;

    this.items = {};
    this.toLoad = this.sources.length;
    this.loaded = 0;

    this.loaders = {
      gltfLoader: new GLTFLoader(),
      textureLoader: new THREE.TextureLoader(),
      cubeTextureLoader: new THREE.CubeTextureLoader(),
    };

    this.startLoading();
  }

  startLoading(): void {
    for (const source of this.sources) {
      if (source.type === 'gltfModel') {
        this.loaders.gltfLoader.load(source.path, (file: GLTF) => {
          this.sourceLoaded(source, file);
        });
      } else if (source.type === 'texture') {
        this.loaders.textureLoader.load(source.path, (file: THREE.Texture) => {
          this.sourceLoaded(source, file);
        });
      } else if (source.type === 'cubeTexture') {
        this.loaders.cubeTextureLoader.load(
          [source.path],
          (file: THREE.CubeTexture) => {
            this.sourceLoaded(source, file);
          }
        );
      }
    }
  }

  sourceLoaded(source: SourceItem, file: LoadedItem): void {
    this.items[source.name] = file;

    this.loaded++;

    if (this.loaded === this.toLoad) {
      this.trigger('ready');
    }
  }
}
