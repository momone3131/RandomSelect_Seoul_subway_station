# Random Seoul — Project Plan

Last updated: 2026-09-15

이 문서는 Random Seoul의 제품 방향과 변경 불가 원칙을 기록합니다. 실제 최신 구현/검증 상태는 `STATUS.md`, 구조는 `ARCHITECTURE.md`를 우선 확인합니다.

## 1. Product goal

사용자가 별도 계획 없이도 몇 번의 랜덤 선택만으로 서울/수도권 외출 코스를 정할 수 있게 합니다.

현재 목표 흐름:

1. 지하철 노선 무작위 추첨
2. 해당 노선의 역 무작위 추첨
3. 음식 종목 무작위 추첨
4. 선택된 역의 first-party 추천 명소 0~2곳을 즉시 표시
5. 사용자가 원할 때 **`추천 식당 보기`**를 눌러 Google Places 식당 검색
6. 검색 완료 후 추천 식당 TOP 3를 표시하고 해당 섹션으로 자연스럽게 이동
7. 지도 앱/웹으로 이동

식당 검색은 음식 추첨의 필수 대기 단계가 아닙니다. 랜덤 결과와 추천 명소를 먼저 보여주고, 식당 정보는 사용자가 명시적으로 요청할 때만 조회합니다.

메인 추첨 버튼은 `노선 → 역 → 음식 → 새 코스` 순서로 동작하며 역/음식 부분 재추첨은 보조 액션으로 제공합니다.

## 2. Non-negotiable requirements

- 앱 이름은 **Random Seoul**.
- **Android가 현재 주 개발/배포 대상이자 앱 본체**.
- Web은 계속 지원하며 Android 기능/UX를 빠르게 확인하는 reference implementation 역할도 수행.
- Android 안정화 이후 iOS를 후속 지원.
- 추첨/데이터/식당 필터·랭킹 같은 공통 로직을 Kotlin/Java/Swift에 복제하지 않음.
- 플랫폼별 네이티브 코드는 Places SDK, 지도 열기, 공유, 햅틱, 뒤로가기 등 플랫폼 의존 기능에 한정.
- GPS/현재 위치 권한은 현재 기본 기능에 필요하지 않으므로 요청하지 않음.
- 사용자가 화면만 보고 이해 가능한 설명 문구는 최소화.
- 모바일 터치 영역과 가독성을 지나치게 축소해 한 화면에 억지로 정보를 욱여넣지 않음.
- 저장소 문서만으로 새 세션에서 프로젝트 맥락을 복구할 수 있어야 함.

## 3. Recommendation model

### Restaurants

- Google Places live candidate 사용
- **사용자가 `추천 식당 보기`를 누른 뒤에만 조회**
- 역 기준 직선거리 2 km 초과 제외
- 최대 20개 후보 재랭킹
- 최종 TOP 3
- 결과/별점/리뷰 수를 장기 추천 DB로 축적하지 않음

현재 점수:

- Bayesian 보정 별점 55%
- `log(1 + 평가 수)` 평가량 25%
- Google 검색 관련성 15%
- 역과의 거리 5%

### Attractions

- Google Places popularity 검색이 아니라 first-party curated static data
- 역당 최대 0~2곳
- 음식/식당 네트워크 조회와 무관하게 즉시 표시
- 모바일 완료 화면에서 랜덤 결과 바로 아래에 압축된 형태로 우선 노출
- 적절한 후보가 없으면 0개 허용

합격선은 **그 역에 갔을 때 30분~몇 시간 실제로 둘러볼 가치 + 합리적인 역 접근성**입니다. 시장·특색 있는 거리·문화공간·공원/수변뿐 아니라 스타필드/IKEA/대형 복합몰·아울렛·주요 백화점도 구경 자체가 외출 경험이면 포함할 수 있습니다.

상세 기준은 `docs/ATTRACTION_CURATION.md`를 따릅니다.

## 4. Mobile result-flow policy

완료 시 첫 화면의 우선순위는 다음과 같습니다.

**노선 / 역 / 음식 → 추천 명소 → 추천 식당 보기**

- 추천 명소는 최대 2개라 모바일에서 짧고 밀도 있게 표시.
- 추천 명소가 0개면 그 영역을 생략하고 식당 CTA가 바로 올라옴.
- 식당 CTA를 누르면 현재 위치에서 `추천 식당 찾는 중…` 상태를 보여줌.
- 검색 중에는 빈 식당 섹션으로 먼저 스크롤하지 않음.
- 결과 렌더가 완료된 뒤 추천 식당 섹션으로 smooth scroll.
- 식당 검색을 원하지 않는 사용자는 Places 후보 검색 호출 없이 랜덤 결과/명소만 사용할 수 있음.

## 5. Visual / interaction direction

- 설명형 카피보다 결과와 행동 단어 중심.
- 선/테두리를 과도하게 사용하지 않고 배경색·공간으로 hierarchy 표현.
- 파스텔 무드는 유지하되 인접 영역이 구분될 정도의 색 대비 확보.
- 일반 카드 테두리는 최소화하고 현재 눌러야 하는 랜덤 카드에만 강한 구조적 강조 사용.
- 랜덤 결과 확정은 눈에 띄는 짧은 물리적 reveal + Android 햅틱으로 피드백.
- 작은 글자를 과도하게 축소하지 않고 모바일 주요 터치 타깃은 대체로 44 px 이상 유지.

## 6. Delivery strategy

### Phase 1 — Shared modular Web
완료. Vite + Vanilla TypeScript, 데이터/상태/서비스/UI 분리, 자동 테스트, GitHub Pages 배포.

### Phase 2 — Android shell
진행 중. Capacitor 8, app id `io.github.momone3131.randomseoul`, shared Web/core 자산 재사용.

### Phase 3 — Native Places adapter
Android Places SDK bridge 구현. Native는 후보 데이터를 반환하고 2 km 필터/랭킹은 shared TypeScript가 수행.

### Phase 4 — Android UX
햅틱, 공유, 지도 intent, back handling, icon 등 진행/구현. Web과 가능한 한 동일한 공통 UX를 유지.

### Phase 5 — Release
CI/debug APK → release AAB → Play signing/정책/비공개 테스트 → production.

### Phase 6 — iOS
Android에서 검증된 shared core를 재사용해 후속 지원.

## 7. Web support and validation

Web은 폐기용 프로토타입이 아닙니다.

- GitHub Pages 계속 배포
- Web Places adapter 유지
- 공통 추첨/랭킹 엔진 공유
- 동일 디자인 시스템/반응형 UX
- Android 공통 기능은 가능한 경우 Web에서도 함께 검증

## 8. Documentation continuity / change control

다음이 바뀌면 관련 문서를 같은 변경에서 갱신합니다.

- 제품 흐름
- 플랫폼 역할
- Places 호출 시점/provider
- 식당 랭킹/거리 제한
- 볼거리 큐레이션 정책
- 앱 식별자/브랜드
- 배포 구조
- 핵심 UI/interaction policy

문서 우선순위는 **실제 코드/Git > STATUS > ARCHITECTURE/PROJECT_PLAN > PROJECT_CONTEXT/README** 입니다.
