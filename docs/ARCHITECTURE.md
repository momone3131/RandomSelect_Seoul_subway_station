# Random Seoul — Architecture

Last updated: 2026-09-15

## 1. Architecture goals

Random Seoul은 Web / Android / iOS가 동일한 제품 로직을 공유하도록 설계합니다.

핵심 원칙:

- 추첨/정적 데이터/상태/식당 필터·랭킹은 플랫폼 독립 TypeScript
- Web/Android/iOS 차이는 adapter/service 경계 뒤로 숨김
- Android Kotlin/Java와 iOS Swift는 얇게 유지
- Web은 정식 지원 타깃이자 빠른 reference implementation
- 식당 후보는 live provider에서 받고 shared TypeScript가 랭킹
- 명소와 가능한 역 중심 좌표는 자체 정적 데이터로 소유
- 음식 추첨과 식당 네트워크 조회를 분리: **식당 조회는 사용자 요청 시에만**

## 2. Repository structure

```text
src/
├─ application/
│  └─ random-seoul-controller.ts
├─ data/
│  ├─ subway-lines.ts
│  ├─ food-categories.ts
│  ├─ curated-attractions.ts
│  ├─ curated-attractions-base.ts
│  ├─ curated-attractions-extra.ts
│  └─ station-coordinates.ts
├─ domain/
│  ├─ types.ts
│  ├─ draw-engine.ts
│  ├─ station-resolver.ts
│  └─ restaurant-ranking.ts
├─ services/
│  ├─ places/
│  ├─ maps/
│  └─ storage/
├─ state/
├─ ui/
└─ main.ts
```

## 3. Shared place/provider boundary

`PlaceCandidate`는 외부 Places provider 후보를 shared core로 넘기는 공통 모델입니다.

- Web: Google Maps JavaScript Places
- Android: Capacitor bridge → Places SDK for Android
- iOS: later native bridge

Provider는 후보 데이터를 반환하고 최종 추천 순위를 결정하지 않습니다.

## 4. Draw → attraction → restaurant data flow

현재 완료 흐름은 두 단계로 분리됩니다.

### A. 즉시 결과 단계

`line → station → food`

- `drawLineResult()` / `drawStationResult()` / `drawFoodResult()`는 네트워크 식당 조회를 기다리지 않음.
- station 선택 시 `getCuratedAttractions()`가 정적 0~2곳을 즉시 상태에 넣음.
- food 선택 시 food와 history만 확정하고 `recommendations`는 빈 상태로 유지.
- UI는 노선/역/음식 바로 아래에 compact attractions를 먼저 표시.

### B. 사용자 요청 식당 단계

사용자가 **`추천 식당 보기`**를 누른 뒤 `controller.loadRecommendations()`를 호출합니다.

1. 현재 line/station/food 조합을 request key로 캡처
2. CTA를 `추천 식당 찾는 중…`으로 변경
3. station center resolve
4. Google Places 후보 조회
5. 2 km 필터/공통 랭킹/TOP 3
6. restaurant cards 렌더
7. 결과가 준비된 후에만 `restaurant_section.scrollIntoView({ behavior: 'smooth' })`

검색 중 빈 식당 영역으로 먼저 스크롤하지 않습니다. 코스가 바뀌면 request key도 바뀌므로 이전 restaurant lookup UI 상태는 초기화됩니다.

이 분리는 음식 선택 피드백을 네트워크 지연과 분리하고, 사용자가 식당 추천을 원하지 않을 때 Places 후보 조회를 생략하게 합니다.

## 5. Restaurant ranking ownership

`restaurant-ranking.ts`가 공통 랭킹을 소유합니다.

1. 역 기준 직선거리 2 km 초과 제거
2. Bayesian rating
3. `log(1 + review count)`
4. Google relevance
5. distance signal
6. TOP 3

가중치:

- rating 55%
- review volume 25%
- relevance 15%
- distance 5%

Google 식당 결과/별점/리뷰 수는 장기 추천 DB로 저장하지 않습니다.

## 6. Curated attractions

명소는 first-party static data이며 역당 최대 0~2곳입니다.

- `curated-attractions-base.ts`: 기존 시드
- `curated-attractions-extra.ts`: browse-worthy 확장
- `curated-attractions.ts`: merge/dedupe/max-2 public entry

품질 gate:

- 자동 평점이 아닌 editorial curation
- 실제 체류/구경 가치 + 합리적인 역 접근성
- 시장/거리/문화/공원/수변과 browse-worthy 대형 상업시설 허용
- 약한 근린시설은 제외
- 적절한 후보 없으면 `[]`

### Attraction presentation

`attraction-view.ts`는 attraction section을 `.panels` 바로 뒤에 배치합니다.

- 완료 결과의 1차 정보로 식당보다 먼저 노출
- 모바일 최대 2개를 compact 2-column layout으로 표시
- 1개면 single column
- 0개면 section 전체 생략
- compact 카드에서는 과도한 meta를 숨기고 이름/종류/지도 액션 중심

### Attraction map-target strategy

`AttractionRecommendation`은 명소 lat/lng를 저장하지 않고 self-contained `mapQuery`를 사용합니다.

- UI가 역 이름을 자동 suffix하지 않음
- 동명이인 가능 장소는 도시/구/도로/주소로 보강
- 넓은 수변/선형 목적지는 구체적인 접근 anchor 사용
- 애매하면 잘못된 pin 대신 후보 제거 가능

`tests/curated-attractions.test.ts`와 `tests/map-links.test.ts`가 무결성을 검증합니다.

## 7. Station center strategy

식당 검색의 center/distance에는 `station-coordinates.ts` 정적 좌표를 우선 사용합니다.

1. 정적 좌표 존재 → live station resolution 없음
2. 미수록 역만 Google fallback
3. fallback 좌표는 기존 30일 cache

station center와 attraction mapQuery는 완전히 다른 데이터 경로입니다.

## 8. State ownership

`AppState` 주요 결과:

- `currentLine`
- `currentStation`
- `currentFood`
- `attractions`: 정적 0~2곳
- `recommendations`: 사용자 요청 후 채워지는 live restaurant TOP 3
- `history`

Restaurant request의 UI lifecycle(`busy/complete/failed/current key`)은 현재 composition/UI layer에서 transient state로 관리하며 장기 저장하지 않습니다.

## 9. Storage boundary

- Web: localStorage
- Android/iOS: 현재 WebView localStorage 호환 우선
- preferences/history 유지
- Google restaurant recommendations 장기 cache 없음
- Google fallback station coordinates만 기존 30일 cache

## 10. Platform services

플랫폼 차이는 adapter/plugin 뒤에 둡니다.

- native place search
- haptics
- share
- map launch/deep link
- back handling
- persistent storage

현재 GPS/current-location permission은 사용하지 않습니다.

## 11. API key strategy

- Web: HTTP referrer restriction
- Android: package + signing certificate restriction
- iOS: bundle identifier restriction

공통 TypeScript에 production key를 하드코딩하지 않습니다.

## 12. Build / deployment

### Web

`modular.html` → `npm run build` → Vite hashed assets.

`web-release.yml`은 `src/**`, `tests/**` 등 관련 변경에서 test → build → headless browser smoke → root artifact promotion을 수행합니다. 최종 deployment commit은 최신 main에 rebase 후 push합니다.

Browser self-test는 현재 다음도 검증합니다.

- line/station/food 완료 직후 recommendations = 0
- explicit restaurant request 이후 TOP 3 렌더
- 2 km contract
- full reset flow

### Android

Vite native build → Capacitor sync → Gradle `assembleDebug`.

성공한 `feature/random-seoul-android` build는:

1. Actions artifact `random-seoul-debug-apk`
2. fixed Release `android-dev-latest`의 `random-seoul-latest.apk`

를 갱신합니다.

Android shared UX는 Web과 같은 on-demand restaurant flow를 사용하고 실제 후보 조회만 native Places adapter를 통과합니다.

### iOS

향후 동일 shared core + native adapters.

## 13. Architecture decision maintenance

다음 변경은 코드와 문서를 함께 갱신합니다.

- product flow / network request timing
- ranking/filter thresholds
- Places provider
- attraction/station-coordinate/map-target policy
- transient/persistent state ownership
- platform bridge
- Web/Android build/deploy structure
