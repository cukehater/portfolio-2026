/** @see https://prettier.io/docs/en/options.html */
export default {
  singleQuote: true, // 작은따옴표
  printWidth: 80, // 한 줄 최대 길이
  tabWidth: 2, // 들여쓰기 칸 수
  bracketSpacing: true, // 객체 중괄호 안 공백
  bracketSameLine: false, // JSX 닫는 > 다음 줄
  jsxSingleQuote: false, // JSX 속성 큰따옴표
  proseWrap: 'preserve', // 마크다운 줄바꿈 유지
  semi: true, // 세미콜론
  trailingComma: 'es5', // 끝 쉼표 (객체/배열 등)
  useTabs: false, // 스페이스 사용
  endOfLine: 'lf', // 줄 끝 \n
};
