# Random Seoul — Project Plan

Last updated: 2026-09-14

이 문서는 Random Seoul 개발의 기준 계획입니다. 대화가 길어지거나 새 채팅으로 넘어가더라도 구현 방향이 흐려지지 않도록 저장소 안에서 계속 갱신합니다.

## 1. Product goal

사용자가 별도 계획 없이도 다음 흐름으로 서울/수도권 외출 코스를 정할 수 있게 합니다.

1. 지하철 노선 무작위 추첨
2. 해당 노선의 역 무작위 추첨
3. 대표 볼거리 0~2곳 표시
4. 음식 종목 무작위 추첨
5. 뽑힌 역 주변 추천 식당 최대 3곳 표시
6. 지도 앱/웹으로 이동

메인 버튼은 `노선 → 역 → 음식 → 새 코스 전체 재추첨` 순서로 동작합니다. 역/음식 부분 재추첨은 보조 버튼으로 제공합니다.

핵심 제품 경험은 사용자가 사전에 장소를 조사하지 않아도 몇 번의 추첨만으로 “오늘 어디로 가서 무엇을 먹을지” 결정하게 하는 것입니다.

## 2. Non-negotiable requirements

- 앱 이름은 **Random Seoul**입니다.
- **Android가 현재 주 개발/배포 대상이자 앱 본체입니다.**
- Web은 Android 개발 중에도 계속 사용할 수 있어야 하며, 정식 Web 타깃과 빠른 기능/UX 검증용 reference implementation 역할을 함께 합니다.
- 프로젝트 소유자가 iPhone 사용자이므로 Web은 Android 기기 없이 새 기능을 직접 확인할 수 있는 중요한 검증 경로입니다.
- 모바일 앱 출시 후에도 Web은 지원 대상으로 유지합니다.
- Android 먼저 안정화하고 iOS를 후속 지원합니다.
- Android 때문에 공통 로직을 Kotlin/Java에 복제하지 않습니다.
- iOS 때문에 공통 로직을 Swift에 복제하지 않습니다.
- 플랫폼별 네이티브 코드는 Places SDK, 지도 열기, 저장, 공유, 햅틱, 뒤로가기 등 플랫폼 의존 기능에만 둡니다.
- GPS/현재 위치 권한은 기본 기능에 필요하지 않으므로 요청하지 않는 방향을 유지합니다.
- 새 채팅/세션에서 과거 대화가 없어도 저장소 문서만으로 개발 맥락을 복구할 수 있어야 합니다.

## 3. Current recommendation model

식당 추천 규칙:

- Google Places live candidate 사용
- 역 기준 **직선거리 2 km 초과 제외**
- 최대 20개 후보에서 재랭킹
- 최종 TOP 3

현재 최종 점수:

- Bayesian 보정 별점: **55%**
- `log(1 + 평가 수)` 기반 평가량 신호: **25%**
- Google 검색 관련성: **15%**
- 역과의 거리: **5%**

이 가중치는 제품 튜닝 대상이며 변경 시 `docs/STATUS.md`와 관련 테스트를 함께 갱신합니다.

대표 볼거리는 Google Places 랭킹이 아니라 `src/data/curated-attractions.ts`의 자체 큐레이션 데이터를 사용하며, 역당 최대 2곳만 표시합니다.

## 4. Delivery strategy

### Phase 0 — Baseline preservation

- `main`의 Web을 안정 기준선으로 유지
- GitHub Pages 계속 동작
- 미완성 Android 작업은 별도 브랜치에서 진행

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
- application id `io.github.momone3131.randomseoul`
- targetSdk 36 기준
- 공통 웹 UI/코어를 앱 내부 자산으로 포함

### Phase 3 — Native Android Places adapter

- 앱 내부 Web Places 의존 제거
- Places SDK for Android로 검색
- native layer는 후보 데이터를 공통 모델로 반환만 함
- 최종 2 km 필터/Bayesian/log ranking은 공통 TypeScript에서 계속 수행

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

## 5. Web support and validation policy

Web은 임시 폐기용 프로토타입이 아닙니다. 동시에 Android 기능을 가장 빠르게 확인하는 검증 surface로 사용합니다.

최종 구조에서도 다음을 유지합니다.

- GitHub Pages 배포
- Web Places adapter
- 동일한 공통 추첨/랭킹 엔진
- 동일한 디자인 시스템
- 모바일/데스크톱 반응형 UI
- Android에 공통 기능을 추가할 때 가능하면 Web에서도 먼저 또는 함께 확인 가능한 형태 유지

앱 전용 기능이 추가되어도 Web은 가능한 범위에서 graceful fallback을 제공합니다.

## 6. Documentation continuity policy

저장소 문서는 프로젝트의 장기 기억 역할을 합니다.

- `PROJECT_CONTEXT.md`: 새 채팅/세션 인계용 핵심 요약
- `STATUS.md`: 실제 현재 개발 위치와 검증 결과
- `PROJECT_PLAN.md`: 제품 목표, 요구사항, 로드맵
- `ARCHITECTURE.md`: 구조와 설계 결정

의미 있는 코드/기능/정책 변경 시 관련 문서를 같은 변경에서 함께 수정합니다. 세부 규칙은 `PROJECT_CONTEXT.md`를 따릅니다.

## 7. Change-control rule

다음 항목이 바뀌면 이 문서를 같은 변경에서 수정합니다.

- 제품 흐름
- 플랫폼 전략 및 각 플랫폼 역할
- 식당 랭킹 공식
- 거리 제한
- 외부 API 공급자
- 앱 식별자/브랜드
- Web 지원/검증 정책
- 단계별 출시 계획
- 프로젝트 인계/문서 유지 원칙

구현 세부 상태는 `docs/STATUS.md`, 구조 결정은 `docs/ARCHITECTURE.md`, 새 세션 인계 요약은 `docs/PROJECT_CONTEXT.md`를 기준으로 합니다.
