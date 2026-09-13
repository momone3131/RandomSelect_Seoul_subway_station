# Random Seoul — Development Status

Last updated: 2026-09-13

이 문서는 현재 진행 위치와 다음 행동을 기록합니다. 구현이 진행될 때마다 갱신합니다.

## Current stable Web

- Branch: `main`
- Deployment: GitHub Pages
- Public entry: root `index.html`
- Web is a permanent supported target and remains usable during native-app development.
- The deployed single-file Web entry has intentionally not been replaced by the Android work.
- Product brand for modular/native work: **Random Seoul**
- Main draw flow: line → station → food → new course
- Supplemental station result: up to 2 nearby attractions when strong candidates exist
- Restaurant recommendations: Google Places TOP 3, hard distance limit 2 km
- Restaurant ranking: Bayesian rating 55% + log review count 25% + relevance 15% + distance 5%

## Phase 1 — Shared core + modular Web refactor

Status: **COMPLETE / MERGED**

Merged PR: `#2 refactor: modularize Random Seoul shared core`
Main merge commit: `4d7808fd7a21c59991234d86792b141b0d02c150`

Completed: Vite/TypeScript/Vitest scaffold, shared subway/food data, draw engine, state/storage boundaries, Web Places adapter, station resolver/cache, shared restaurant ranking, shared controller, typed UI modules, 900 ms reveal behavior, browser self-test, responsive mobile parity gates.

## Protected architectural requirements

- Web remains a permanent supported target.
- Android/iOS-specific business logic must not enter shared draw/controller/ranking layers.
- Platform differences belong behind adapters/plugins.
- Native place providers return common `PlaceCandidate` data; shared TypeScript owns restaurant and attraction filtering/ranking.
- GPS/current-location permission remains absent unless a future explicit feature requires it.

## Shared architecture

`static data → RandomSeoulController → PlaceSearchService → shared ranking → AppStore → typed UI`

Platform adapters:

- Web: Google Maps JavaScript Places + browser map links/storage
- Android: Places SDK for Android + Capacitor/Java plugins
- iOS: native Places/Swift adapter later against the same shared contracts

## Phase 2 — Android app

Status: **ACTIVE — REAL-DEVICE CORE FLOW VERIFIED; ATTRACTION FEATURE READY FOR FIELD TEST**

Working branch: `feature/random-seoul-android`
Working PR: `#3 android: build Random Seoul native shell`

### Completed Android foundation

- [x] Capacitor 8 Android project
- [x] App ID `io.github.momone3131.randomseoul`
- [x] minSdk 24 / compileSdk 36 / targetSdk 36
- [x] Java 21 CI
- [x] Places SDK for Android 5.3.0
- [x] Native `RandomSeoulPlacesPlugin` Text Search bridge
- [x] Web / Android runtime Places routing
- [x] Stable secret-backed development signing
- [x] Stable SHA-1 `DD:19:BA:81:FE:11:DE:8F:70:25:0C:D6:48:9C:14:47:76:23:4F:EE`
- [x] Dedicated Android Places API key secret
- [x] Native sharing, map intents, back handling, online/offline state
- [x] Manifest uses `INTERNET` only; no GPS/location permission
- [x] GitHub Actions debug APK artifact
- [x] Duplicate/stale CI execution reduction

### Galaxy S20 physical-device findings

Tested 2026-09-13:

- [x] APK installs and launches normally
- [x] line → station → food flow works
- [x] live Google Places restaurant TOP 3 loads and renders correctly
- [x] line haptic worked in the first APK
- [ ] station/food haptic retest with fixed APK
- [ ] restaurant-specific Google Maps launch confirmation; old S20 Google Maps installation was not operating normally, so emulator validation is planned

Haptic root cause/fix:

- Previous native haptics observed transient `bounce` CSS class mutations.
- Station/food render functions replace panel `className`, making that signal unreliable.
- `revealDrawStage()` now emits an explicit draw-revealed event; native haptics listen to that event so line/station/food use the same trigger path.
- Web CI and Android APK CI pass after the fix.

## Nearby attraction recommendation feature

Implemented 2026-09-13 after user approval.

Behavior:

- [x] Station draw remains random; attraction recommendation is **not random**.
- [x] After station finalization, one background Places Text Search runs for that station.
- [x] Station result is shown immediately; attraction network latency does not block the draw.
- [x] Hard radius: 2 km.
- [x] Only attraction / museum / gallery / park / cultural / historical type candidates are eligible.
- [x] Maximum 2 results.
- [x] Minimum review count: 20.
- [x] Minimum attraction score: 0.45.
- [x] Ranking: relevance 45% + log(review count) 30% + distance 15% + rating 10%.
- [x] No eligible result → attraction section remains hidden; no forced weak recommendation.
- [x] Food-only redraw does not repeat attraction search.
- [x] Station redraw clears old attractions and performs one new search.
- [x] Stale asynchronous result is rejected if the station changed before the request completed.
- [x] Attraction cards reuse the existing vetted recommendation-card/mobile layout and Google Maps link behavior.
- [x] Attraction results are current in-memory state only; no new Places-result cache was added.
- [x] Attraction ranking quality-gate unit tests added.
- [x] Shared Web CI passed with the attraction feature.
- [x] Android CI passed through native Vite → Capacitor sync → stable signing → `assembleDebug` → APK artifact.

Current attraction query: `<station>역 관광명소`.

Field-test targets include:

- 이촌역 → 국립중앙박물관 should rank strongly if returned by Places.
- 한강 인접역 → representative Hangang park should surface when Google relevance/review signals support it.
- ordinary stations with only weak POIs should show no attraction section.

The query and quality thresholds are intentionally tunable after real results are observed.

## Current automated validation

- shared TypeScript tests including attraction ranking
- native Vite build
- Web build and headless Chrome flow smoke test
- Capacitor Android sync
- stable development signing
- Android Places secret detection
- Gradle `assembleDebug`
- certificate SHA-1 report
- debug APK artifact upload

## Remaining real-device / emulator checks

- [ ] Re-test haptic on line, station, and food using the fixed/new APK
- [ ] Verify attraction quality on several stations, especially 이촌역 and Hangang-adjacent stations
- [ ] Verify attraction-specific Google Maps link
- [ ] Verify Google/Naver station map launch
- [ ] Verify restaurant-specific Google Maps launch in emulator/healthy Maps environment
- [ ] Verify native result sharing
- [ ] Verify Android back-button behavior
- [ ] Verify offline behavior: draws continue, network-backed recommendations disappear/fail gracefully

## After debug validation

- [ ] Tune attraction query/thresholds if field data shows noise or misses
- [ ] Decide/produce final app icon and splash assets
- [ ] Revisit native Preferences storage if needed
- [ ] Prepare release signing separately from development signing
- [ ] Build signed release AAB
- [ ] Play Console listing / data safety / privacy policy / closed testing preparation

## CI policy during Phase 2

Android CI runs once per PR update and cancels stale builds. Shared Web CI also cancels stale PR runs and uses `npm ci`.

## Change log

### 2026-09-13

- Secret-backed Android signing/API key setup completed and verified.
- Galaxy S20 core flow and live restaurant TOP 3 verified.
- Station/food haptic issue found; event-based trigger fix implemented and built.
- Nearby attraction recommendation feature added as a non-random station supplement.
- Attraction ranking/quality gate documented and unit-tested.
- Web and Android CI both pass with attraction functionality included.
- Attraction/map-link quality now moves to real-device/emulator field testing.

### 2026-09-12

- Random Seoul branding, permanent Web support, shared-core architecture, Phase 1 modular refactor, Capacitor Android project, native Places bridge, API 36 build, native UX adapters, and CI foundations established.
