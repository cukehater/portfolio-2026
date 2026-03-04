/**
 * 앱 진입점 (Entry Point)
 * - 전역 스타일을 불러오고, DOM의 canvas 요소를 App에 넘겨 3D 씬을 시작합니다.
 */
import App from './js/app';
import './style.css';

// canvas 요소를 App에 전달. App은 싱글톤이므로 한 번만 생성됩니다.
new App(document.getElementById('canvas'));
