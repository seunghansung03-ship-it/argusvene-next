# ArgusVene Reset

이 저장소는 `2026년 3월 16일` 기준으로 전면 리셋되었다.

지금부터의 기준은 두 가지뿐이다.

1. 사용자가 원하는 실제 프로덕트
2. Gemini Live Agent Challenge 제출 규정

이 저장소에는 의도적으로 실행 코드가 없다.
이전 실험 구현, Replit 기반 산출물, 중복 UI, 임시 백엔드는 모두 제거했다.

현재 남아 있는 것은:

- 제품 정의 문서
- 구현 계획 문서
- 아키텍처 참고 문서
- 해커톤 규정 참고 문서
- 새로 시작할 최소 폴더 골격

문서 진입점:

- [제품 요약](./docs/PRODUCT_BRIEF.md)
- [해커톤 요구사항](./docs/HACKATHON_REQUIREMENTS.md)
- [오늘의 구현 순서](./docs/BUILD_SEQUENCE.md)
- [기존 제품 문서 아카이브](./docs/product/README_ARCHIVE.md)

새 구현 골격:

- `apps/web`
- `services/api`
- `packages/contracts`

원칙:

- 기존 임시 코드를 다시 가져오지 않는다
- 목업을 만들지 않는다
- 버튼을 만들면 끝까지 작동하게 만든다
- Live meeting room이 제품의 중심이다
- 해커톤 규정을 만족하지 못하는 기능은 우선순위에서 제외한다
