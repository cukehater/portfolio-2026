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
        'design', // 스타일 변경
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
    'subject-empty': [2, 'never'], // subject 비어 있으면 에러

    // 이하 규칙 비활성화 — scope·subject·본문 등 자유 작성
    'type-case': [0], // type 대소문자 무시
    'scope-case': [0], // scope 대소문자 무시
    'scope-empty': [0], // scope 비어 있어도 괜찮음
    'subject-case': [0], // subject 대소문자 무시
    'subject-full-stop': [0], // subject 끝에 마침표 무시
    'header-max-length': [0], // header 최대 길이 무시
    'body-leading-blank': [0], // body 첫 줄 비어 있어도 괜찮음
    'body-max-line-length': [0], // body 최대 줄 길이 무시
    'footer-leading-blank': [0], // footer 첫 줄 비어 있어도 괜찮음
    'footer-max-line-length': [0], // footer 최대 줄 길이 무시
  },
};
