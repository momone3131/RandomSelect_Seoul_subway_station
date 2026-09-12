# Random Seoul — Development Status

Last updated: 2026-09-12

이 문서는 현재 진행 위치와 다음 행동을 기록합니다. 구현이 진행될 때마다 갱신합니다.

## Current stable Web

- Branch: `main`
- Deployment: GitHub Pages
- Public entry: root `index.html`
- Web is a permanent supported target and remains usable during native-app development.
- The deployed single-file Web entry has intentionally not been replaced by the Android work.
- Product brand for modular/native work: **Random Seoul**
- Core flow: line → station → food → restaurant recommendations
- Restaurant hard distance limit: 2 km
- Ranking: Bayesian rating 55% + log review count 25% + relevance 15% + distance 5%
- Mobile restaurant cards: vertical single-column layout

## Phase 1 — Shared core + modular Web refactor

Status: **COMPLETE / MERGED**

Merged PR: `#2 refactor: modularize Random Seoul shared core`
Main merge commit: `4d7808fd7a21c59991234d86792b141b0d02c150`

### Completed

- [x] Vite + TypeScript + Vitest scaffold
- [x] Preserve current deployed `main/index.html`
- [x] Source-controlled modular CSS/DOM shell independent from stable `index.html`
- [x] Extract all 24 subway lines and station ordering
- [x] Extract all 36 food categories and search queries
- [x] Shared domain types and deterministic draw engine
- [x] Shared station resolver and 30-day station-coordinate cache
- [x] Platform-neutral `PlaceSearchService`
- [x] Web Google Places adapter
- [x] Shared restaurant ranking engine
- [x] Shared `RandomSeoulController`
- [x] Shared state/storage boundaries with existing Web persistence compatibility
- [x] Typed draw / restaurant / settings / history UI modules
- [x] Stable 900 ms draw preview/reveal behavior
- [x] Settings modal keyboard/focus behavior
- [x] Deterministic browser self-test without Google quota use
- [x] Responsive one-column restaurant cards and 44 px mobile touch targets
- [x] Web unit/build/real-Chrome parity gates

## Protected architectural requirements

These remain binding:

- Web remains a permanent supported target.
- Android-specific business logic must not enter shared draw/controller/ranking layers.
- iOS-specific assumptions must not enter shared draw/controller/ranking layers.
- Platform differences belong behind adapters/plugins.
- Restaurant ranking remains shared TypeScript unless a future documented decision explicitly changes it.
- Native place providers return common `PlaceCandidate` data; shared TypeScript owns ranking and product flow.

## Shared architecture

`static data → RandomSeoulController → PlaceSearchService → shared ranking → AppStore → typed UI`

Platform adapters:

- Web: Google Maps JavaScript Places + browser map links/storage
- Android: Places SDK for Android + Capacitor/Java plugins
- iOS: native Places/Swift adapter later, against the same shared contracts

## Phase 2 — Android app

Status: **ACTIVE — DEBUG APP BUILDS SUCCESSFULLY**

Working branch: `feature/random-seoul-android`
Working PR: `#3 android: build Random Seoul native shell`

### Completed

- [x] Capacitor 8 Android project generated
- [x] App name `Random Seoul`
- [x] Application ID `io.github.momone3131.randomseoul`
- [x] minSdk 24 / compileSdk 36 / targetSdk 36
- [x] Java 21 Android CI toolchain
- [x] Places SDK for Android 5.3.0 dependency
- [x] Native `RandomSeoulPlacesPlugin` Text Search bridge
- [x] Native `PlaceCandidate` normalization while keeping ranking in shared TypeScript
- [x] Runtime Web / Android / iOS detection
- [x] Native runtime automatically uses `NativePlaceSearchService`; Web keeps the Web adapter
- [x] Separate Android Places API-key injection path; Web key is not reused
- [x] GitHub Actions debug APK build and artifact upload
- [x] Android CI passes shared tests → native Web build → Capacitor sync → Gradle `assembleDebug`
- [x] Capacitor App / Haptics / Share plugins synced
- [x] Native result sharing on Android
- [x] Haptic feedback on finalized line/station/food results
- [x] Android back handling: close settings first, otherwise normal back/exit behavior
- [x] Native Google Maps / Naver Map launch adapter with Web fallback
- [x] Restaurant-specific external Google Maps link opens outside the app
- [x] Offline state indicator for native runtime
- [x] Offline behavior keeps line/station/food draws usable and limits failure to restaurant recommendations
- [x] Offline restaurant error copy clearly explains the available behavior
- [x] Remove duplicate Android push+PR CI execution and cancel stale runs automatically
- [x] Optional stable development-signing support via GitHub Actions secrets
- [x] When stable development signing is configured, CI reports the SHA-1 needed for Android API-key restriction

### Current validation

Latest shared CI and Android CI both pass on the Phase 2 branch after native sharing/haptics/back/map/offline changes.

### Next checkpoint — stable Android identity + real device

- [ ] Provision one stable development signing keystore outside the repository
- [ ] Add development signing values as GitHub Actions secrets
- [ ] Read the stable debug SHA-1 from the Android CI summary
- [ ] Create a dedicated Android Google Places key
- [ ] Restrict that key to:
  - package `io.github.momone3131.randomseoul`
  - stable development certificate SHA-1
  - required Places API only
- [ ] Add the Android Places key as `RANDOM_SEOUL_PLACES_API_KEY` GitHub secret
- [ ] Build/download the key-enabled debug APK
- [ ] Install on a real Android device
- [ ] Verify line → station → food → live TOP 3 restaurant flow
- [ ] Verify Google/Naver map launch, restaurant link, share, haptics, back button, and offline behavior

### After real-device debug validation

- [ ] Decide/produce final app icon and splash assets
- [ ] Revisit native Preferences storage if needed for stronger mobile persistence
- [ ] Prepare release signing strategy separately from development signing
- [ ] Build signed release AAB
- [ ] Play Console listing / data safety / privacy policy / closed testing preparation

## CI policy during Phase 2

Android CI now runs once per PR update rather than once for both push and PR events. `concurrency.cancel-in-progress` cancels stale Android builds when a newer commit arrives. This reduces duplicate failure emails while keeping the current head fully validated.

## Change log

### 2026-09-12

- Product name fixed as **Random Seoul**.
- Web confirmed as a permanent supported target.
- Cross-platform shared-core architecture adopted.
- Phase 1 modular refactor completed and merged to `main` without replacing the stable Web entry.
- Capacitor Android project generated with API 36 target.
- Places SDK for Android native bridge implemented without duplicating shared ranking/product logic.
- Android debug APK successfully built in GitHub Actions.
- Native Places routing, sharing, haptics, Android back handling, and map intents added.
- Offline draw behavior preserved and restaurant-specific offline messaging added.
- Android CI duplicate executions reduced and stale runs are automatically cancelled.
- Stable secret-backed development signing path prepared so Android API-key SHA-1 restrictions can remain fixed across CI builds.
