# Random Seoul — Project Plan

Last updated: 2026-09-17

이 문서는 Random Seoul의 제품 방향과 변경 불가 원칙을 기록합니다. 최신 구현/검증 상태는 `STATUS.md`, 구조는 `ARCHITECTURE.md`를 우선 확인합니다.

## 1. Product goal

사용자가 별도 계획 없이 몇 번의 랜덤 선택만으로 서울/수도권 외출 코스를 정하게 합니다.

현재 흐름:
1. 지하철 노선 무작위 추첨
2. 해당 노선의 역 무작위 추첨
3. 음식 종목 무작위 추첨
4. 선택된 역의 first-party 추천 명소 0~2곳 즉시 표시
5. 원할 때만 `추천 식당 보기`
6. Google Places live 식당 후보 → shared ranking → TOP 3
7. 결과 완료 후 smooth scroll / 지도 이동

식당 조회는 음식 추첨의 필수 단계가 아닙니다.

## 2. Non-negotiable requirements

- 앱 이름 **Random Seoul**
- Android가 현재 주 개발/배포 대상
- Web은 정식 지원 + 공통 UX reference target
- Android 안정화 후 iOS 지원
- draw/data/filter/ranking 공통 로직은 shared TypeScript
- native code는 Places, 지도, 공유, 햅틱, 뒤로가기 등 플랫폼 의존 기능 위주
- GPS/current-location permission 현재 없음
- 설명 문구 최소화, 모바일 touch target/가독성 유지
- repository docs로 새 세션 맥락 복구 가능해야 함

## 3. Recommendation model

### Restaurants

- Google Places live candidates
- explicit `추천 식당 보기` only
- station 기준 hard radius 2 km
- max20 → TOP3
- Bayesian rating 55%, review log 25%, relevance 15%, distance 5%
- provider 결과/별점/리뷰를 장기 own DB로 축적하지 않음

### Attractions

- first-party curated static data
- no live Google attraction Text Search
- station max0–2
- no forced fill
- 랜덤 결과 바로 아래 우선 노출
- 합격선: 해당 역에서 30분~몇 시간 실제로 둘러볼 가치 + 현실적 접근성
- 작은 놀이터·아파트 앞 소공원·평범한 근린시설 제외

## 4. Attraction prominence + feature model

### Prominence tier

명소는 정확히 하나의 `diamond / gold / silver / standard` prominence tier를 갖습니다. Tier 이름은 UI에 텍스트로 표시하지 않습니다.

- **Diamond:** 초희귀 jackpot. 경복궁 / 국립중앙박물관 / 롯데월드타워 / 북촌한옥마을 4곳 고정
- **Gold:** 전국구 / destination-level
- **Silver:** 도시·권역 주요 유명 목적지 또는 nationally known niche destination
- **Standard:** 해당 역에서 둘러볼 가치가 있는 local stop

Current counts: Diamond 4 / Gold 25 / Silver 88 / remaining Standard.

Diamond는 금속성 platinum이 아니라 icy cyan / sky / white / pale-violet gemstone prism으로 표현합니다. Gold/Silver는 metallic border, Standard는 borderless.

### Orthogonal features

특수 속성은 prominence tier와 별도 축입니다. 동일 장소가 `Diamond + Nightscape`, `Silver + Nightscape`, `Standard + Nightscape`가 될 수 있습니다.

#### Nightscape

Nightscape는 5번째 tier가 아닙니다. 제품 의미는 다음으로 고정합니다:

> **높은 곳에서 도시 불빛·스카이라인을 내려다보는 것이 밤 방문의 주된 이유인 전망 목적지.**

따라서 단순히 조명된 건축물, 수변 산책, 야간 분위기가 좋은 상권은 자동으로 Nightscape가 아닙니다.

Current set — 12:
- N서울타워
- 낙산공원
- 응봉산 팔각정
- 달맞이봉공원
- 매봉산 팔각정
- 용왕산 스카이워크
- 삼성해맞이공원
- 용마산 스카이워크
- 용양봉저정공원
- 롯데월드타워
- 남한산성 서문 전망대
- 수원화성 서장대

Removed from Nightscape only: DDP, 노들섬, 반포한강공원, 세빛섬, 석촌호수, 송도 센트럴파크, 광교호수공원, 라베니체. Their normal recommendations/tier remain.

Presentation:
- visible `야경` text badge 없음
- tier border/effect stays intact
- Nightscape changes the **card interior only** to dark navy/indigo/purple night sky + subtle stars/city glow

Data separation:
- `curated-attraction-tiers.ts` → prominence
- `curated-attraction-features.ts` → Nightscape classification
- `curated-attractions-night-viewpoints.ts` → missing elevated viewpoint destinations

The night-viewpoint data layer has the lowest merge priority so it fills spare slots without displacing stronger established recommendations.

## 5. Mobile result-flow policy

**노선 / 역 / 음식 → 추천 명소 → 추천 식당 보기**

- attractions max2; 0이면 section 숨김
- CTA click 후 loading
- empty restaurant section 선-scroll 금지
- result settle 후 smooth scroll
- 식당을 원하지 않으면 Places restaurant call 자체 생략

## 6. Visual / interaction direction

- result/action 중심, 설명 copy 최소화
- passive UI는 neutral bg/paper/surface 중심
- active draw lime + completed station actual line color 유지
- prominence tier border와 Nightscape background는 독립적으로 합성
- `01 노선 / 02 역 / 03 음식` progress strip 숨김
- stage-aware headline + active card로 진행상태 전달
- random settle reveal + Android haptic 유지

## 7. Delivery strategy

- Phase 1 Shared modular Web: 완료
- Phase 2 Android shell: 진행 중
- Phase 3 Native Places adapter: Android bridge, shared ranking
- Phase 4 Android UX: haptics/share/map/back/icon
- Phase 5 Release: debug APK → release AAB → Play testing/production
- Phase 6 iOS: shared core 재사용

## 8. Web support / documentation continuity

Web은 prototype 폐기 대상이 아닙니다. GitHub Pages, Web Places adapter, shared data/draw/ranking/visual contracts를 계속 유지합니다.

다음 변경은 docs에 동기화합니다:
- product flow / platform roles
- Places call timing/provider
- restaurant ranking/distance
- attraction curation / prominence / orthogonal feature policy
- app identifier/brand
- deployment structure
- core UI/interaction policy

Priority: **actual code/Git > STATUS > ARCHITECTURE/PROJECT_PLAN > PROJECT_CONTEXT/README**.
