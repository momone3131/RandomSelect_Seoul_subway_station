# Random Seoul — Architecture

Last updated: 2026-09-16

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
│  ├─ curated-attractions-local.ts
│  ├─ curated-attraction-tiers.ts
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

### A. 즉시 결과 단계

`line → station → food`

- `drawLineResult()` / `drawStationResult()` / `drawFoodResult()`는 네트워크 식당 조회를 기다리지 않음
- station 선택 시 `getCuratedAttractions()`가 정적 0~2곳을 즉시 상태에 넣음
- attraction은 merge 시점에 visual tier가 붙음
- food 선택 시 food와 history만 확정하고 `recommendations`는 빈 상태 유지
- UI는 노선/역/음식 바로 아래에 compact attractions를 먼저 표시

### B. 사용자 요청 식당 단계

사용자가 `추천 식당 보기`를 누른 뒤 `controller.loadRecommendations()` 호출:

1. current line/station/food request key 캡처
2. CTA loading state
3. station center resolve
4. Google Places 후보 조회
5. 2 km filter / shared ranking / TOP 3
6. restaurant cards render
7. 결과 준비 후 `restaurant_section.scrollIntoView({ behavior: 'smooth' })`

검색 중 빈 식당 영역으로 먼저 scroll하지 않습니다. 코스가 바뀌면 request key도 바뀌어 이전 restaurant lookup UI state가 초기화됩니다.

## 5. Restaurant ranking ownership

`restaurant-ranking.ts`가 공통 랭킹을 소유합니다.

1. station 기준 직선거리 2 km 초과 제거
2. Bayesian rating
3. `log(1 + review count)`
4. Google relevance
5. distance signal
6. TOP 3

Weights:
- rating 55%
- review volume 25%
- relevance 15%
- distance 5%

Google restaurant result/rating/review values are not persisted as a reusable long-term DB.

## 6. Curated attractions

명소는 first-party static data이며 역당 최대 0~2곳입니다. Google attraction Text Search는 없습니다.

### Data layers and priority

`getCuratedAttractions()` merges in this exact order:

1. `curated-attractions-base.ts` — established strong seed
2. `curated-attractions-extra.ts` — browse-worthy expansion
3. `curated-attractions-local.ts` — broader local streets/markets/sizeable parks/campuses/etc.
4. ID dedupe
5. `slice(0, 2)`
6. visual tier attachment via `curated-attraction-tiers.ts`

The priority prevents a newly added weaker local stop from displacing an established stronger recommendation. The local layer primarily fills previously empty stations or remaining second slots.

### Attraction domain type

`AttractionRecommendation` includes optional:

```ts
tier?: 'gold' | 'silver' | 'standard'
```

The public merged result always attaches a tier.

- gold: nationally iconic / destination-level
- silver: major city/regional destination
- standard: worthwhile local browse/stay stop

Tier assignment is ID-based and centralized in `curated-attraction-tiers.ts`, so the same attraction keeps the same visual tier across stations.

### Quality gate

- editorial curation rather than automatic rating
- real browse/stay value + reasonable station access
- distinctive streets/markets/culture/sizeable parks/waterfronts/campuses/major commercial destinations allowed
- tiny playgrounds and weak generic neighborhood facilities excluded
- genuinely weak station may remain `[]`

### Attraction presentation

`attraction-view.ts` places attraction section immediately after `.panels`.

- max 2 compact cards
- 1 result → one-column
- 0 → section hidden
- tier is never printed as a text badge
- class only: `attraction-tier-gold | attraction-tier-silver | attraction-tier-standard`

A module-level `lastRenderedSignature` uses station + attraction IDs + tiers. If the same result is rendered again because unrelated app state changes, the attraction DOM is not rebuilt. This makes the initial tier effect truly a first-appearance effect rather than something that restarts on every `renderState()`.

### Tier visuals

`minimal-palette-overrides.css` owns final attraction-tier treatment so it can override the base borderless card style.

- gold: metallic multi-stop gradient border + slow sheen + strong gold first-arrival pulse
- silver: metallic silver gradient border + slow sheen + silver first-arrival pulse
- standard: neutral borderless card
- `prefers-reduced-motion: reduce` disables tier animation

### Attraction map-target strategy

`AttractionRecommendation` does not store attraction lat/lng; it uses self-contained `mapQuery`.

- UI does not append station name
- ambiguous places add city/district/road/address
- broad waterfront/path destinations use a concrete access anchor where appropriate
- ambiguous target may be removed instead of linking to the wrong pin

`tests/curated-attractions.test.ts`, `tests/map-links.test.ts`, and `tests/responsive-contract.test.ts` guard data validity, max2, map targets, tier assignment and visual tier contracts.

## 7. Station center strategy

Restaurant search center/distance uses `station-coordinates.ts` first.

1. static coordinate exists → no live station resolution
2. missing station → Google fallback
3. fallback coordinate cached for 30 days

Station center and attraction mapQuery are separate data paths.

## 8. State ownership

`AppState` key result fields:

- `currentLine`
- `currentStation`
- `currentFood`
- `attractions`: static 0–2 tiered results
- `recommendations`: live restaurant TOP 3, filled only after user request
- `history`

Restaurant request lifecycle (`busy/complete/failed/current key`) stays transient in composition/UI layer and is not persisted.

Attraction reveal signature is also transient UI-only state; it is not persisted.

## 9. Storage boundary

- Web: localStorage
- Android/iOS: WebView localStorage compatibility first
- preferences/history persisted
- Google restaurant recommendations not long-term cached
- only Google fallback station coordinates keep the 30-day cache

## 10. Platform services

Platform differences stay behind adapters/plugins:

- native place search
- haptics
- share
- map launch/deep link
- back handling
- persistent storage

Current GPS/current-location permission: none.

## 11. API key strategy

- Web: HTTP referrer restriction
- Android: package + signing certificate restriction
- iOS: bundle identifier restriction

Do not hardcode production keys into shared TypeScript.

## 12. Build / deployment

### Web

`modular.html` → `npm run build` → Vite hashed assets.

`web-release.yml` on relevant `src/**`, `tests/**`, build/workflow changes:

1. tests
2. Vite build
3. headless browser smoke
4. verified root promotion
5. deployment commit rebased/pushed to latest main
6. GitHub Pages

### Android

Vite native build → Capacitor sync → Gradle `assembleDebug`.

Successful `feature/random-seoul-android` build updates:

1. Actions artifact `random-seoul-debug-apk`
2. fixed Release `android-dev-latest` / `random-seoul-latest.apk`

Android shared UX/data includes the same static attraction tiers and local curation as Web; only live restaurant candidate lookup is platform-specific.
