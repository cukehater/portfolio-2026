import App from './app/index.ts';
import './style.css';
const canvas = document.getElementById('canvas');
if (canvas instanceof HTMLCanvasElement) new App(canvas);
else throw new Error('캔버스 요소를 찾을 수 없습니다.');
