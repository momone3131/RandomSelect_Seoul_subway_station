# Random Seoul — Architecture

Last updated: 2026-09-16

## 1. Architecture goals

Random Seoul은 Web / Android / iOS가 동일한 제품 로직을 공유하도록 설계합니다.

- draw/static data/state/restaurant ranking = platform-independent TypeScript
- Web/Android/iOS differences behind adapter/service boundary
- native code stays thin
- Web is supported target + reference implementation
- restaurant candidates come from live provider; shared TypeScript ranks them
- attractions and available station centers are owned static data
- restaurant lookup is separated from food draw and runs only on explicit request

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
│  ├─ curated-attractions-adjustments.ts
│  ├─ curated-attractions-extra.ts
│  ├─ curated-attractions-local.ts
│  ├─ curated-attraction-tiers.ts
│  ├─ curated-attraction-features.ts
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

`PlaceCandidate` is the shared provider candidate model.

- Web: Google Maps JavaScript Places
- Android: Capacitor bridge → Places SDK for Android
- iOS: later native bridge

Provider returns candidates; shared core owns final restaurant ranking.

## 4. Draw → attraction → restaurant data flow

### A. Immediate result

`line → station → food`

- draw functions do not wait for restaurant network lookup
- station draw calls `getCuratedAttractions()` and puts static 0–2 attractions in state immediately
- merged attractions receive both prominence tier and orthogonal features before entering state
- food draw finalizes food/history only; `recommendations` stays empty
- UI shows attractions before restaurant CTA

### B. User-requested restaurant result

After `추천 식당 보기`:
1. capture current line/station/food request key
2. loading CTA state
3. resolve station center
4. Google Places live candidates
5. 2 km filter / shared ranking / TOP 3
6. render restaurant cards
7. smooth-scroll only after results settle

Course change invalidates previous restaurant request UI state.

## 5. Restaurant ranking ownership

`restaurant-ranking.ts`:
1. drop >2 km
2. Bayesian rating
3. log review volume
4. Google relevance
5. distance signal
6. TOP 3

Weights: rating 55% / review volume 25% / relevance 15% / distance 5%.

Provider restaurant result/rating/review values are not persisted as a reusable long-term DB.

## 6. Curated attractions

Attractions are first-party static data, max 0–2. There is no Google attraction Text Search.

### Data layers and priority

`getCuratedAttractions()` merges in this exact order:

1. `curated-attractions-base.ts`
2. `curated-attractions-adjustments.ts`
3. `curated-attractions-extra.ts`
4. `curated-attractions-local.ts`
5. ID dedupe
6. `slice(0, 2)`
7. prominence tier attachment via `curated-attraction-tiers.ts`
8. orthogonal feature attachment via `curated-attraction-features.ts`

Priority prevents a weaker local stop from displacing an established stronger recommendation. `adjustments` is intentionally sparse; Yongsan is the current representative use.

### Attraction domain model

`AttractionRecommendation` includes:

```ts
tier?: 'diamond' | 'gold' | 'silver' | 'standard'
nightscape?: boolean
```

Prominence and feature are intentionally separate dimensions.

#### Prominence tier

- Diamond: ultra-rare jackpot; exactly four
- Gold: nationwide / destination-grade recognition
- Silver: strong city/region destination or nationally known niche place
- Standard: worthwhile local stop

Current classifier: Diamond 4 / Gold 24 / Silver 85 / remaining Standard.

`curated-attraction-tiers.ts` is the source of truth. Same attraction ID has the same tier across stations.

#### Orthogonal feature: Nightscape

`curated-attraction-features.ts` owns independent Nightscape tagging. It is **not a fifth tier**.

Current 10 IDs:
- `ddp`
- `naksan-park`
- `nodeul-island`
- `banpo-hangang-park`
- `sebit-islands`
- `seokchon-lake`
- `lotte-world-tower`
- `songdo-central-park`
- `gwanggyo-lake-park`
- `laveniche`

Because Nightscape is independent, examples include:
- 롯데월드타워 = Diamond + Nightscape
- 반포한강공원 = Gold + Nightscape
- 낙산공원 = Silver + Nightscape

Seasonal-only night openings/festivals are not used for a static Nightscape flag.

### Attraction presentation

`attraction-view.ts` places attraction section immediately after `.panels`.

- max 2 compact cards
- 1 → one-column
- 0 → hidden section
- no tier label and no Nightscape text badge
- tier class: `attraction-tier-${tier}`
- feature class: `attraction-nightscape`
- dataset keeps both tier and Nightscape state

The render signature contains station + attraction ID + tier + `night/plain`. Ordinary unrelated state changes therefore do not rebuild the attraction DOM or replay first-arrival tier effects.

### Visual ownership

`minimal-palette-overrides.css`:
- Diamond: gemstone prism border/facet sparkle + `1.8s` first-arrival jackpot reveal
- Gold: metallic gold border + sheen + gold reveal
- Silver: metallic silver border + sheen + silver reveal
- Standard: neutral borderless
- Nightscape: dark navy/indigo/purple **interior pseudo-layer** with star points and a subtle warm city-light glow

Nightscape never takes ownership of the border. Tier-specific insets (`3px` Diamond, `2px` Gold/Silver) keep the prominence border visible around the night interior.

### Latest tier correction

- `seosomun-shrine-history-museum`: already Silver; unchanged
- `seokchon-dong-tombs`: Standard → Silver

### Quality gate

- editorial curation, not automatic rating
- real browse/stay value + reasonable station access
- distinctive streets/markets/culture/sizeable parks/waterfronts/campuses/major commercial destinations allowed
- tiny playgrounds and generic weak neighborhood facilities excluded
- weak station may remain `[]`

### Map-target strategy

Attraction lat/lng is not stored; each result uses self-contained `mapQuery`.

- UI does not append station name
- ambiguous places add city/district/road/address
- broad waterfront/path destinations use concrete access anchor where appropriate
- ambiguous target can be omitted rather than linking to wrong pin

Tests guard data validity, max2, station keys, map targets, tier boundaries, Nightscape classification and visual overlap contracts.

## 7. Station center strategy

Restaurant center/distance uses `station-coordinates.ts` first.

1. static coordinate exists → no live station resolution
2. missing station → Google fallback
3. fallback coordinate cached 30 days

Station center and attraction mapQuery are separate data paths.

## 8. State ownership

`AppState` key result fields:
- `currentLine`
- `currentStation`
- `currentFood`
- `attractions`: static 0–2 enriched results
- `recommendations`: live restaurant TOP 3 after user request
- `history`

Restaurant request lifecycle and attraction reveal signature are transient UI-only state and are not persisted.

## 9. Storage boundary

- Web localStorage
- Android/iOS WebView localStorage compatibility first
- preferences/history persisted
- restaurant recommendations not long-term cached
- only Google fallback station coordinates keep 30-day cache

## 10. Platform services

Adapters/plugins own native place search, haptics, share, map launch/deep link, back handling and persistent storage. Current GPS/current-location permission: none.

## 11. API key strategy

- Web: HTTP referrer restriction
- Android: package + signing certificate restriction
- iOS: bundle identifier restriction

Do not hardcode production keys into shared TypeScript.

## 12. Build / deployment

### Web

`web-release.yml`: tests → Vite build → headless browser smoke → verified root promotion → Pages.

### Android

Vite native build → Capacitor sync → Gradle `assembleDebug` → artifact → fixed `android-dev-latest` Release.

Web and Android share the same attraction layers, prominence classifier and Nightscape feature classifier; only live restaurant candidate lookup is platform-specific.
