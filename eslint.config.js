import js from '@eslint/js';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  {
    ignores: ['dist', 'node_modules', 'static'],
  },
  js.configs.recommended,
  prettierConfig,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      prettierPlugin,
    },
    rules: {
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ], // 사용하지 않는 변수는 에러
      'no-console': ['warn', { allow: ['warn', 'error'] }], // console.log 비허용
      eqeqeq: ['error', 'always'], // ==/!= 금지, ===/!== 사용
      'no-implicit-coercion': 'warn', // +x, !!x 등 암묵적 타입 변환 경고
      'no-constant-condition': ['warn', { checkLoops: false }], // 상수 조건(예: if (true)) 경고
      'no-var': 'error', // var 금지, let/const 사용
      'prefer-const': ['warn', { destructuring: 'all' }], // 재할당 없으면 const 권장
      'no-shadow': ['warn', { builtinGlobals: false, hoist: 'functions' }], // 상위 스코프 변수 가리기 경고
      'no-redeclare': 'error', // 같은 스코프 재선언 금지
      'no-duplicate-imports': 'error', // 중복 import 경고
      'prefer-template': 'warn', // 문자열 연결은 템플릿 리터럴 권장
      'no-useless-return': 'warn', // 불필요한 return 경고
      'no-useless-escape': 'warn', // 불필요한 escape 경고
      'no-unused-expressions': [
        'warn',
        { allowShortCircuit: true, allowTernary: true },
      ], // 사용되지 않는 표현식 경고
      'default-case': 'warn', // switch문에 default 누락 경고
      'no-empty': ['warn', { allowEmptyCatch: true }], // 빈 블록 경고
      'no-empty-function': 'warn', // 빈 함수 경고
      'no-lonely-if': 'warn', // else { if ... } → else if 권장
      'no-nested-ternary': 'warn', // 중첩 삼항 연산자 경고
      'no-unneeded-ternary': 'warn', // 불필요한 삼항 연산자 경고
      'no-dupe-else-if': 'error', //같은 조건의 중복 else if 금지
      'no-throw-literal': 'error', // Error 인스턴스만 throw
      'require-await': 'warn', // await 없는 async 함수 경고
      'no-self-assign': 'error', // 자기 자신에 재할당 금지
      'no-useless-catch': 'warn', // 불필요한 catch 경고
      'prettierPlugin/prettier': 'error',
    },
  },
];
