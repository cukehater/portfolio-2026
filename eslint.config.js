import js from '@eslint/js';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import checkFile from 'eslint-plugin-check-file';

export default [
  { ignores: ['dist', 'node_modules', 'static'] }, // 린트 제외 경로
  js.configs.recommended, // JS 기본 권장
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.ts'], // TS 파일에만 TS 규칙
  })),
  prettierConfig, // Prettier와 충돌 규칙 비활성화
  {
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest', // 최신 ECMAScript
      sourceType: 'module', // ESM
      globals: { ...globals.browser }, // 브라우저 전역
      parserOptions: {
        projectService: true, // tsconfig 기반 타입 인식
        tsconfigRootDir: import.meta.dirname, // tsconfig 위치
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettierPlugin,
      importPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ], // _ 접두사 무시
      '@typescript-eslint/no-this-alias': 'off', // this 별칭 무시 (싱글톤 패턴 사용)

      'no-unused-vars': 'off', // 아래 TS 규칙으로 대체
      'no-console': ['warn', { allow: ['warn', 'error'] }], // console.log 금지
      eqeqeq: ['error', 'always'], // ===/!== 사용
      'no-implicit-coercion': 'warn', // 암묵적 타입 변환 경고
      'no-constant-condition': ['warn', { checkLoops: false }], // 상수 조건 경고
      'no-var': 'error', // var 금지
      'prefer-const': ['warn', { destructuring: 'all' }], // const 권장
      'no-shadow': ['warn', { builtinGlobals: false, hoist: 'functions' }], // 변수 가리기 경고
      'no-redeclare': 'error', // 재선언 금지
      'no-duplicate-imports': 'error', // 중복 import 금지
      'prefer-template': 'warn', // 템플릿 리터럴 권장
      'no-useless-return': 'warn', // 불필요한 return 경고
      'no-useless-escape': 'warn', // 불필요한 이스케이프 경고
      'no-unused-expressions': [
        'warn',
        { allowShortCircuit: true, allowTernary: true },
      ], // 미사용 표현식 경고
      'default-case': 'warn', // switch default 권장
      'no-empty': ['warn', { allowEmptyCatch: true }], // 빈 블록 경고
      'no-empty-function': 'warn', // 빈 함수 경고
      'no-lonely-if': 'warn', // else if 권장
      'no-nested-ternary': 'warn', // 중첩 삼항 경고
      'no-unneeded-ternary': 'warn', // 불필요한 삼항 경고
      'no-dupe-else-if': 'error', // 중복 else if 금지
      'no-throw-literal': 'error', // Error 인스턴스만 throw
      'require-await': 'warn', // await 없는 async 경고
      'no-self-assign': 'error', // 자기 할당 금지
      'no-useless-catch': 'warn', // 불필요한 catch 경고
      'prettierPlugin/prettier': 'error', // Prettier 위반 시 에러
      'importPlugin/extensions': [
        'error',
        'ignorePackages',
        { js: 'always', ts: 'always' },
      ], // import 확장자 필수
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          // 한 모듈에서 값+타입을 같이 쓸 때는 `import { type T, v }` 한 줄로 유지 (no-duplicate-imports와 충돌 방지)
          fixStyle: 'inline-type-imports',
        },
      ],
    },
  },
  {
    files: ['src/app/**/*.ts'],
    plugins: {
      'check-file': checkFile,
    },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        { 'src/app/**/*.ts': 'KEBAB_CASE' },
        { ignoreMiddleExtensions: true },
      ],
      'check-file/folder-naming-convention': [
        'error',
        { 'src/app/**/': 'KEBAB_CASE' },
      ],
    },
  },
];
