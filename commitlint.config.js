/**
 * Conventional Commits — type만 검사, 나머지(scope·subject·본문 등)는 자유
 *
 * 형식: <type>(<scope>): <subject> — type은 아래 목록 중 하나 필수.
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // type은 반드시 아래 중 하나를 선택
    'type-enum': [
      2,
      'always',
      [
        'build', // 빌드·의존성·번들 변경
        'chore', // 기타 작업 (프로덕션 코드 변경 없음)
        'ci', // CI 설정 변경
        'docs', // 문서만 변경 (README 등)
        'feat', // 새 기능 추가
        'fix', // 버그 수정
        'perf', // 성능 개선
        'refactor', // 리팩토링 (기능·버그 수정 아님)
        'revert', // 이전 커밋 되돌리기
        'style', // 포맷·공백 등 (동작 변경 없음)
        'test', // 테스트 추가·수정
      ],
    ],
    // type은 비어 있으면 안 됨 (반드시 위 목록 중 하나)
    'type-empty': [2, 'never'],
    // 이하 규칙 비활성화 — scope·subject·본문 등 자유 작성
    'type-case': [0],
    'scope-case': [0],
    'scope-empty': [0],
    'subject-case': [0],
    'subject-empty': [0],
    'subject-full-stop': [0],
    'header-max-length': [0],
    'body-leading-blank': [0],
    'body-max-line-length': [0],
    'footer-leading-blank': [0],
    'footer-max-line-length': [0],
  },
};
