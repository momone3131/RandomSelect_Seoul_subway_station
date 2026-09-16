# Random Seoul — Project Plan

Last updated: 2026-09-16

이 문서는 Random Seoul의 제품 방향과 변경 불가 원칙을 기록합니다. 실제 최신 구현/검증 상태는 `STATUS.md`, 구조는 `ARCHITECTURE.md`를 우선 확인합니다.

## 1. Product goal

사용자가 별도 계획 없이도 몇 번의 랜덤 선택만으로 서울/수도권 외출 코스를 정할 수 있게 합니다.

현재 목표 흐름:

1. 지하철 노선 무작위 추첨
2. 해당 노선의 역 무작위 추첨
3. 음식 종목 무작위 추첨
4. 선택된 역의 first-party 추천 명소 0~2곳을 즉시 표시
5. 사용자가 원할 때 `추천 식당 보기`를 눌러 Google Places 식당 검색
6. 검색 완료 후 추천 식당 TOP 3 표시 + 해당 섹션으로 smooth scroll
7. 지도 앱/웹으로 이동

식당 검색은 음식 추첨의 필수 대기 단계가 아닙니다. 랜덤 결과와 추천 명소를 먼저 보여주고 식당 정보는 사용자가 명시적으로 요청할 때만 조회합니다.

메인 추첨은 `노선 → 역 → 음식 → 새 코스`, 완료된 각 카드의 ↻로 부분 재추첨합니다.

## 2. Non-negotiable requirements

- 앱 이름은 **Random Seoul**.
- **Android가 현재 주 개발/배포 대상이자 앱 본체**.
- Web은 계속 지원하며 Android 공통 기능/UX reference implementation 역할도 수행.
- Android 안정화 이후 iOS 후속 지원.
- 추첨/데이터/식당 필터·랭킹 같은 공통 로직을 Kotlin/Java/Swift에 복제하지 않음.
- 플랫폼별 native code는 Places SDK, 지도 열기, 공유, 햅틱, 뒤로가기 등 플랫폼 의존 기능에 한정.
- GPS/current-location permission은 현재 기본 기능에 필요하지 않으므로 요청하지 않음.
- 화면만 보고 이해 가능한 설명 문구는 최소화.
- 모바일 터치 영역과 가독성을 과도하게 줄여 한 화면에 욱여넣지 않음.
- 저장소 문서만으로 새 세션에서 프로젝트 맥락을 복구할 수 있어야 함.

## 3. Recommendation model

### Restaurants

- Google Places live candidates
- 사용자가 `추천 식당 보기`를 누른 뒤에만 조회
- 역 기준 2 km hard radius
- 최대 20개 후보 → shared ranking → TOP 3
- 결과/별점/리뷰 수를 장기 own restaurant DB로 축적하지 않음

Weights:
- Bayesian rating 55%
- `log(1 + review count)` 25%
- Google relevance 15%
- distance 5%

### Attractions

- first-party curated static data; no Google attraction Text Search
- 역당 max 0–2
- 음식/식당 network lookup과 무관하게 즉시 표시
- random result 바로 아래 compact surface로 우선 노출
- no forced fill; 적절한 후보 없으면 0개

합격선은 **그 역에 갔을 때 30분~몇 시간 실제로 둘러볼 가치 + 합리적인 역 접근성**입니다.

허용 범위는 관광지뿐 아니라 다음까지 포함합니다.
- 특색 있는 번화가 / 먹자골목 / 카페·로데오·특화거리
- 전통시장
- 규모 있는 공원 / 호수 / 수변·생태 공간
- 문화·전시·체험·스포츠 anchor
- 산책 가치가 있는 캠퍼스
- browse-worthy 대형 쇼핑/라이프스타일 destination

작은 놀이터·아파트 앞 소공원·평범한 근린시설은 제외합니다.

#### Attraction tiers

노출 명소는 내부적으로 `diamond / gold / silver / standard` 4단계 visual prominence를 갖습니다. Tier 이름은 UI에 텍스트로 표시하지 않습니다.

- **diamond:** 재미를 위한 초희귀 jackpot tier. 정확히 4곳만 유지
  - 경복궁
  - 국립중앙박물관
  - 롯데월드타워
  - 북촌한옥마을
- **gold:** 전국구 / destination-level
- **silver:** 도시·권역 단위 주요 유명 목적지
- **standard:** 해당 역에서 둘러볼 가치가 있는 local stop

Diamond rarity contract:
- 쉽게 늘리지 않음
- 추가하려면 기존 4곳 중 하나를 교체할 정도의 이유가 필요
- 3px platinum/prism metallic border
- 3.8s reflective sheen
- 사용자가 놓치지 않도록 1.65s multi-stage first-arrival reveal
- reduced-motion에서는 animation off

Other tiers:
- gold → metallic gold border + reflection + first-arrival gold effect
- silver → metallic silver border + reflection + first-arrival silver effect
- standard → neutral borderless card

상세 선정/등급/mapQuery 기준은 `docs/ATTRACTION_CURATION.md`, 전체 audit은 `docs/ATTRACTION_TIER_AUDIT.md`를 따릅니다.

## 4. Mobile result-flow policy

완료 시 우선순위:

**노선 / 역 / 음식 → 추천 명소 → 추천 식당 보기**

- 추천 명소 max 2, mobile에서 짧고 밀도 있게 표시
- 명소 0개면 section 생략
- 식당 CTA click 후 현재 viewport에서 loading
- empty restaurant section으로 선-scroll 금지
- 결과 render 완료 후 restaurant section smooth scroll
- 식당을 원하지 않으면 Places restaurant candidate call 자체를 생략 가능

## 5. Visual / interaction direction

- 설명형 copy보다 결과와 행동 단어 중심
- passive UI color count를 최소화: neutral bg / paper / structural surface 중심
- active random target의 lime과 선택된 역의 actual line color는 functional accent로 유지
- 일반 card border는 최소화
- attraction diamond/gold/silver는 의미 있는 예외로 metallic border 사용
- Diamond는 매우 드물기 때문에 Gold보다 눈에 띄되 전체 minimal UI를 깨는 과도한 무지개/게임 UI는 피함
- `01 노선 / 02 역 / 03 음식` 같은 중복 progress strip은 표시하지 않음
- stage-aware headline + active card + result state가 진행 상황 전달
- random result settled reveal + Android haptic 유지
- mobile 주요 touch target 가독성과 크기를 지나치게 축소하지 않음

## 6. Delivery strategy

### Phase 1 — Shared modular Web
완료. Vite + Vanilla TypeScript, data/state/service/UI 분리, tests, GitHub Pages.

### Phase 2 — Android shell
진행 중. Capacitor 8, app id `io.github.momone3131.randomseoul`, shared Web/core reuse.

### Phase 3 — Native Places adapter
Android Places SDK bridge. Native는 후보 data 반환, 2 km filter/ranking은 shared TypeScript.

### Phase 4 — Android UX
haptics/share/map intent/back handling/icon 등. Web과 가능한 한 동일한 shared UX 유지.

### Phase 5 — Release
CI/debug APK → release AAB → Play signing/policy/closed testing → production.

### Phase 6 — iOS
Android에서 검증된 shared core 재사용.

## 7. Web support and validation

Web은 폐기용 prototype이 아닙니다.

- GitHub Pages 계속 배포
- Web Places adapter 유지
- common draw/ranking/data engine 공유
- same design/interaction contracts
- Android common features는 가능한 경우 Web에서도 먼저/함께 검증

## 8. Documentation continuity / change control

다음이 바뀌면 관련 문서를 같은 변경에서 갱신합니다.

- product flow
- platform roles
- Places call timing/provider
- restaurant ranking/distance
- attraction curation/tier/rarity policy
- app identifier/brand
- deployment structure
- core UI/interaction policy

Priority: **actual code/Git > STATUS > ARCHITECTURE/PROJECT_PLAN > PROJECT_CONTEXT/README**.
