# Random Seoul — Project Plan

Last updated: 2026-09-18

이 문서는 Random Seoul 개발의 기준 계획입니다. 대화가 길어지더라도 구현 방향이 흐려지지 않도록 저장소 안에서 계속 갱신합니다.

## 1. Product goal

사용자가 별도 계획 없이도 다음 흐름으로 서울/수도권 외출 코스를 정할 수 있게 합니다.

1. 지하철 노선 무작위 추첨
2. 해당 노선의 역 무작위 추첨
3. 역 주변에 충분히 추천할 만한 볼거리가 있으면 **비랜덤 1~2곳** 표시
4. 음식 종목 무작위 추첨
5. 뽑힌 역 주변 추천 식당 최대 3곳 표시
6. 지도 앱/웹으로 이동

메인 버튼은 `노선 → 역 → 음식 → 새 코스 전체 재추첨` 순서로 동작합니다. 볼거리 추천은 별도 추첨 단계가 아니라 역 확정 뒤 백그라운드에서 한 번 조회하는 보조 정보입니다. 역/음식 부분 재추첨은 보조 버튼으로 제공합니다.

## 2. Non-negotiable requirements

- 앱 이름은 **Random Seoul**입니다.
- 현재 웹버전은 Android/iOS 개발 중에도 계속 사용할 수 있어야 합니다.
- 모바일 앱 출시 후에도 웹버전은 정식 지원 대상으로 유지합니다.
- Android 먼저 출시하고 iOS를 후속 지원합니다.
- Android 때문에 공통 로직을 Kotlin에 복제하지 않습니다.
- iOS 때문에 공통 로직을 Swift에 복제하지 않습니다.
- 플랫폼별 네이티브 코드는 Places SDK, 지도 열기, 저장, 공유, 햅틱, 뒤로가기 등 플랫폼 의존 기능에만 둡니다.
- GPS/현재 위치 권한은 기본 기능에 필요하지 않으므로 요청하지 않는 방향을 유지합니다.
- 볼거리는 약한 후보를 억지로 추천하지 않습니다. 품질 기준을 통과하지 못하면 영역 자체를 숨깁니다.

## 3. Recommendation models

### Restaurant recommendations

- Google Places Text Search 후보 사용
- 역 기준 **직선거리 2 km 초과 제외**
- 최대 20개 후보에서 재랭킹
- 최종 TOP 3

현재 최종 점수:

- Bayesian 보정 별점: **55%**
- `log(1 + 평가 수)` 기반 평가량 신호: **25%**
- Google 검색 관련성: **15%**
- 역과의 거리: **5%**

### Attraction recommendations

역이 확정되면 같은 `PlaceSearchService`를 사용해 한 번만 검색합니다. 음식 재추첨 때는 다시 검색하지 않습니다.

- 검색 범위: 역 기준 **직선거리 2 km**
- 관광명소/박물관/미술관/공원/역사·문화 명소 계열만 허용
- 최대 20개 후보에서 재랭킹
- 최소 평가 수 및 최소 점수 quality gate 적용
- 최종 **0~2곳**: 기준 통과 후보가 없으면 UI를 표시하지 않음

현재 최종 점수:

- Google 검색 관련성: **45%**
- `log(1 + 평가 수)` 기반 인지도 신호: **30%**
- 역과의 거리: **15%**
- 별점: **10%**

명소 랭킹도 공통 TypeScript가 소유하며, 실제 사용자 테스트에서 이촌역→국립중앙박물관, 한강 인접역→한강공원 같은 대표 결과가 우선되는지 확인해 튜닝합니다.

추천 가중치/거리/quality gate가 바뀌면 `docs/STATUS.md`와 관련 테스트를 함께 갱신합니다.

## 4. Delivery strategy

### Phase 0 — Baseline preservation

- `main`의 현재 웹버전을 안정판으로 유지
- GitHub Pages 계속 동작
- 리팩터링은 별도 브랜치에서만 진행

### Phase 1 — Modular web refactor

목표: 기능 변화 없이 단일 `index.html`을 모듈 프로젝트로 분해합니다.

- Vite + Vanilla TypeScript
- 데이터 분리
- 추첨 엔진 분리
- 상태/저장 분리
- Places service abstraction
- 식당 랭킹 분리
- UI rendering 분리
- CSS 분리
- 자동 테스트 도입

완료 조건:

- 기존 웹 UX/기능과 동등
- GitHub Pages 배포 가능
- 모바일 UI 회귀 없음
- 추천 결과 계산 테스트 통과

### Phase 2 — Android shell

- Capacitor 기반 Android 프로젝트 생성
- 앱 표시명 `Random Seoul`
- application id: `io.github.momone3131.randomseoul`
- targetSdk 36 기준
- 공통 웹 UI/코어를 앱 내부 자산으로 포함

### Phase 3 — Native Android Places adapter

- Places SDK for Android로 검색
- Java/Kotlin은 후보 데이터를 공통 모델로 반환만 함
- 식당/볼거리 최종 필터와 랭킹은 공통 TypeScript에서 계속 수행

### Phase 4 — Android-native UX

- 햅틱
- Android 공유 시트
- Google/Naver 지도 앱 딥링크
- 뒤로가기 처리
- 네트워크 오류 UX
- 앱 아이콘 / 스플래시
- 상태 저장 개선

### Phase 5 — CI and release

- GitHub Actions lint/test/build
- debug APK artifact
- release AAB
- Play App Signing 준비
- 개인정보처리방침 / 데이터 보안 / 스토어 메타데이터
- 비공개 테스트
- 프로덕션 출시

### Phase 6 — iOS

Android에서 검증된 공통 코어를 유지하고 iOS 어댑터만 추가합니다.

- Capacitor iOS
- Swift Places adapter
- iOS 지도/공유/햅틱 adapter
- TestFlight / App Store

## 5. Web support policy

웹은 임시 프로토타입이 아닙니다.

최종 구조에서도 다음을 유지합니다.

- GitHub Pages 배포
- Web Places adapter
- 동일한 공통 추첨/랭킹 엔진
- 동일한 디자인 시스템
- 모바일/데스크톱 반응형 UI

앱 전용 기능이 추가되어도 웹은 가능한 범위에서 graceful fallback을 제공합니다.

## 6. Change-control rule

다음 항목이 바뀌면 이 문서를 같은 변경에서 수정합니다.

- 제품 흐름
- 플랫폼 전략
- 식당/볼거리 랭킹 공식
- 거리 제한 또는 quality gate
- 외부 API 공급자
- 앱 식별자/브랜드
- 웹 지원 정책
- 단계별 출시 계획

구현 세부 상태는 `docs/STATUS.md`, 구조 결정은 `docs/ARCHITECTURE.md`를 기준으로 합니다.


## Interchange consistency rule

동일한 실제 환승역은 어느 노선에서 추첨돼도 동일한 curated attraction 결과를 유지합니다. 동명이역은 자동 병합하지 않습니다.
