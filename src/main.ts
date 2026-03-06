/**
 * 앱 진입점 (Entry Point)
 */
import App from './app/index.ts';
import './style.css';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
new App(canvas);
