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
- merged attraction gets its visual tier at merge time
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

Weights:
- rating 55%
- review volume 25%
- relevance 15%
- distance 5%

Provider restaurant result/rating/review values are not persisted as a reusable long-term DB.

## 6. Curated attractions

Attractions are first-party static data, max 0–2. There is no Google attraction Text Search.

### Data layers and priority

`getCuratedAttractions()` merges in this exact order:

1. `curated-attractions-base.ts` — established strong seed
2. `curated-attractions-adjustments.ts` — sparse station-specific priority override
3. `curated-attractions-extra.ts` — browse-worthy expansion
4. `curated-attractions-local.ts` — broader local streets/markets/sizeable parks/campuses/culture/sports
5. ID dedupe
6. `slice(0, 2)`
7. tier attachment via `curated-attraction-tiers.ts`

Priority prevents a weaker local stop from displacing an established stronger recommendation. `adjustments` is intentionally sparse; it is for cases such as Yongsan where the desired top-two combination crosses layers.

Current Yongsan adjustment:
- `l1:용산`, `gc:용산` → 아이파크몰 용산 + 용리단길
- 신용산 remains 용리단길 + 아모레퍼시픽미술관

### Attraction type and tiers

`AttractionRecommendation` includes optional:

```ts
tier?: 'diamond' | 'gold' | 'silver' | 'standard'
```

Public merged results always attach a tier.

- diamond: ultra-rare jackpot destination; fixed four
- gold: nationwide / destination-grade recognition
- silver: strong city/region destination or nationally known niche place
- standard: worthwhile local stop

Tier assignment is ID-based and centralized in `curated-attraction-tiers.ts` so the same place keeps the same visual prominence across stations.

Current classifier:
- Diamond 4
- Gold 24
- Silver 84
- remaining surfaced attractions Standard

Diamond is intentionally fixed to 경복궁 / 국립중앙박물관 / 롯데월드타워 / 북촌한옥마을. It is a rarity/fun layer rather than an absolute quality score. Audit rationale is documented in `docs/ATTRACTION_TIER_AUDIT.md`.

### Quality gate

- editorial curation, not automatic rating
- real browse/stay value + reasonable station access
- distinctive streets/markets/culture/sizeable parks/waterfronts/campuses/major commercial destinations allowed
- tiny playgrounds and generic weak neighborhood facilities excluded
- weak station may remain `[]`

### Attraction presentation

`attraction-view.ts` places attraction section immediately after `.panels`.

- max 2 compact cards
- 1 → one-column
- 0 → section hidden
- tier text is never rendered
- class only: `attraction-tier-diamond | attraction-tier-gold | attraction-tier-silver | attraction-tier-standard`

A module-level signature uses station + attraction IDs + tiers. Same-result rerenders do not rebuild attraction DOM, so the tier reveal is genuinely first-arrival rather than replaying on unrelated state changes.

### Tier visuals

`minimal-palette-overrides.css` owns final tier treatment:
- diamond: 3px platinum/prism metallic gradient border + 3.8s sheen + deliberately noticeable 1.65s two-pulse/multi-stage first-arrival reveal
- gold: metallic gradient border + slow sheen + strong gold first-arrival pulse
- silver: metallic silver border + slow sheen + silver first-arrival pulse
- standard: neutral borderless card
- reduced-motion disables tier animation

### Map-target strategy

Attraction lat/lng is not stored; each result uses self-contained `mapQuery`.

- UI does not append station name
- ambiguous places add city/district/road/address
- broad waterfront/path destinations use concrete access anchor where appropriate
- ambiguous target can be omitted rather than linking to wrong pin

Tests guard data validity, max2, station keys, map targets, Diamond exclusivity, audited tier boundaries and visual contracts.

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
- `attractions`: static 0–2 tiered results
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

Adapters/plugins own:
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

`modular.html` → Vite hashed assets.

`web-release.yml`:
1. tests
2. Vite build
3. headless browser smoke
4. verified root promotion
5. deployment commit rebase/push to latest main
6. GitHub Pages

### Android

Vite native build → Capacitor sync → Gradle `assembleDebug`.

Successful Android branch build updates:
1. Actions artifact `random-seoul-debug-apk`
2. fixed Release `android-dev-latest` / `random-seoul-latest.apk`

Web and Android share the same static attraction layers and four-tier classifier; only live restaurant candidate lookup is platform-specific.
