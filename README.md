# Random Seoul

Random Seoul은 수도권 지하철 노선 → 역 → 음식 종목을 순서대로 무작위 추첨하고, 뽑힌 역 주변 식당을 추천하는 프로젝트입니다.

## Product direction

- **Brand name:** Random Seoul
- **Android:** 현재 주 개발/배포 대상이자 앱 본체입니다.
- **Web:** GitHub Pages로 계속 제공하며, 정식 Web 타깃인 동시에 Android 기능/UX를 빠르게 검증하는 reference implementation 역할을 합니다. 프로젝트 소유자가 iPhone 사용자이므로 Android 기기 없이 새 기능을 직접 확인하는 경로로도 사용합니다.
- **iOS:** Android 안정화 후 동일한 공통 코어를 재사용해 추가합니다.
- **Core principle:** 플랫폼별 SDK는 검색/지도/저장/공유 같은 어댑터에만 한정하고, 추첨·데이터·랭킹·상태·UI 로직은 최대한 공통으로 유지합니다.

현재 안정 웹버전은 `main` 브랜치에서 관리하고, Android 앱 작업은 `feature/random-seoul-android` 브랜치에서 진행합니다. 공통 변경은 Web/Android 기능 동등성을 확인한 뒤 동기화합니다.

## Project documentation

새 채팅/새 개발 세션에서는 아래 순서로 확인하면 과거 대화 원문 없이도 프로젝트 맥락을 복구할 수 있습니다.

1. `docs/PROJECT_CONTEXT.md` — 프로젝트 목적, 플랫폼 역할, 핵심 결정, 세션 인계 규칙
2. `docs/STATUS.md` — 실제 현재 개발 진행 상태와 최근 변경
3. `docs/PROJECT_PLAN.md` — 제품 요구사항과 로드맵
4. `docs/ARCHITECTURE.md` — 코드/데이터/플랫폼 구조

의미 있는 기능/설계/상태 변경은 코드와 같은 변경에서 관련 문서를 함께 갱신합니다. 세부 문서 업데이트 규칙은 `docs/PROJECT_CONTEXT.md`를 기준으로 합니다.
