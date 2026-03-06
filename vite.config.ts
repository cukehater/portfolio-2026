import restart from 'vite-plugin-restart'; // static 변경 시 dev 서버 재시작

export default {
  root: 'src/', // 프로젝트 루트 (index.html 기준)
  publicDir: '../static/', // 정적 파일 소스 (빌드 시 복사)
  server: {
    host: true, // 0.0.0.0 바인딩 (네트워크 접속 가능)
  },
  build: {
    outDir: '../dist', // 빌드 출력 경로
    emptyOutDir: true, // 빌드 전 비우기
    sourcemap: false, // 소스맵 생성
  },
  plugins: [restart({ restart: ['../static/**'] })], // static/ 변경 시 재시작
};
