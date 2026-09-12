# Random Seoul

Random Seoul은 수도권 지하철 노선 → 역 → 음식 종목을 순서대로 무작위 추첨하고, 뽑힌 역 주변 식당을 추천하는 프로젝트입니다.

## Product direction

- **Brand name:** Random Seoul
- **Web:** GitHub Pages로 계속 제공하며 Android/iOS 앱 개발 중과 출시 후에도 유지합니다.
- **Android:** 첫 번째 네이티브 배포 대상입니다.
- **iOS:** Android 출시 후 동일한 공통 코어를 재사용해 추가합니다.
- **Core principle:** 플랫폼별 SDK는 검색/지도/저장/공유 같은 어댑터에만 한정하고, 추첨·데이터·랭킹·상태·UI 로직은 최대한 공통으로 유지합니다.

현재 안정 웹버전은 `main` 브랜치의 `index.html`입니다. 구조 분해와 앱화 작업은 별도 브랜치에서 진행한 뒤 기능 동등성 검증 후 병합합니다.

자세한 계획은 아래 문서를 기준으로 관리합니다.

- `docs/PROJECT_PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/STATUS.md`

계획이나 핵심 설계가 변경되면 코드 변경과 같은 PR에서 위 문서를 함께 갱신합니다.
