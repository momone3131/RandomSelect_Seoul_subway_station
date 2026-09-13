# Random Seoul — Development Status

Last updated: 2026-09-13

이 문서는 현재 진행 위치와 다음 행동을 기록합니다.

## Public Web

Status: **MODULAR WEB DEPLOYED**

- Deployment: GitHub Pages, existing public URL retained
- Web migration PR: `#5 web: deploy modular Random Seoul with nearby attractions` — merged
- Source merge commit: `3c6384f548b1b4b9fd20bec7193b3cc6e9af2efd`
- Deployment artifact commit: `e21765f4b48e249eb2250cd91d64f9c2877c599e`
- Maintained source entry: `modular.html`
- Public entry: root `index.html`, generated from the verified Vite modular build
- Public root `index.html` is now the compact Random Seoul build artifact rather than the legacy single-file source
- Web remains a permanent supported target
- Main draw flow: line → station → food → new course
- Supplemental station result: up to 2 nearby attractions when strong candidates exist
- Restaurant recommendation: Google Places TOP 3, hard radius 2 km
- Existing Web localStorage settings/history keys are preserved
- Web browser key remains separate from Android and is HTTP-referrer restricted

`web-release.yml` owns public-Web artifact promotion: test → build → browser smoke → `dist/modular.html` → root `index.html` + hashed assets.

## Phase 1 — Shared core + modular Web refactor

Status: **COMPLETE / MERGED**

Merged PR: `#2 refactor: modularize Random Seoul shared core`
Main merge commit: `4d7808fd7a21c59991234d86792b141b0d02c150`

Completed: Vite/TypeScript/Vitest scaffold, shared subway/food data, draw engine, state/storage boundaries, Web Places adapter, station resolver/cache, shared restaurant ranking, shared controller, typed UI modules, 900 ms reveal behavior, deterministic browser self-test, responsive mobile parity gates.

## Nearby attraction recommendation

Implemented as shared Web/Android product logic.

- Station draw remains random; attraction recommendation is not another random stage.
- One background Places Text Search runs after a station is finalized.
- Station result is not blocked by network latency.
- Hard radius: 2 km.
- Eligible candidates: attraction / museum / gallery / park / cultural / historical types.
- Maximum: 2 results.
- Minimum review count: 20.
- Minimum attraction score: 0.45.
- Ranking: Google relevance 45% + log(review count) 30% + distance 15% + rating 10%.
- No qualifying candidate → attraction section is hidden.
- Food-only redraw does not repeat attraction search.
- Station redraw clears old attractions and performs one search for the new station.
- Stale async results are rejected if the station changes.
- Places result data is not added to long-term cache.

Current query: `<station>역 관광명소`.

Field targets include 이촌역 → 국립중앙박물관 and Hangang-adjacent stations → representative Hangang parks when returned strongly by Places.

## Phase 2 — Android app

Status: **ACTIVE — CORE FLOW VERIFIED ON GALAXY S20**

Working branch: `feature/random-seoul-android`
Working PR: `#3 android: build Random Seoul native shell`

### Verified / implemented

- Capacitor 8 Android project
- app ID `io.github.momone3131.randomseoul`
- minSdk 24 / compileSdk 36 / targetSdk 36
- Places SDK for Android native bridge
- separate Android-restricted Places API key
- stable development signing and SHA-1
- native share, haptics, back handling, map intents
- `INTERNET` only; no GPS/location permission
- Galaxy S20: install/launch, line → station → food, live restaurant TOP 3 verified
- station/food haptic issue root cause found and event-based fix built
- nearby-attraction feature included in current Android shared core

### Remaining Android field checks

- re-test line/station/food haptics with latest APK
- test attraction quality on 이촌역 / Hangang-adjacent stations
- verify attraction-specific Google Maps link
- verify station Google/Naver map launch and restaurant-specific Google Maps link in a healthy Maps/emulator environment
- verify share/back/offline behavior

PR #3 remains draft and is not merged to `main` until native behavior validation is sufficiently complete.

## Shared architecture requirements

- Web is a permanent product target.
- Android/iOS business logic must not enter shared draw/controller/ranking rules.
- Platform-specific work stays behind adapters/plugins.
- Native/Web Places providers return common `PlaceCandidate` data.
- Restaurant and attraction ranking remain shared TypeScript.
- Current-location/GPS permission remains absent unless a later explicit feature requires it.

## Current automated gates

Web PR/CI:

- TypeScript/unit tests including attraction quality gate
- Vite modular build
- deterministic headless Chrome full-flow smoke
- restaurant TOP 3 contract
- 2 km restaurant exclusion
- responsive mobile contract
- Web release artifact upload

Web Release additionally verifies the release build again before promoting root `index.html` and hashed assets.

Android CI additionally verifies native Vite build, Capacitor sync, stable signing, Places secret detection, Gradle APK build, SHA-1 report, and APK artifact upload.

## Change log

### 2026-09-13

- Galaxy S20 core Android flow and live restaurant TOP 3 verified.
- Station/food haptic issue identified and event-based trigger fix built.
- Nearby attraction recommendation added as non-random station supplemental information.
- Attraction ranking/quality gates unit-tested.
- Public Web migration PR #5 merged without merging the unfinished Android project.
- `modular.html` became the maintained Web source entry.
- Verified Web Release generated and committed the new root `index.html` and hashed assets.
- Browser-restricted Web Places key remains separate from Android and is injected at build time.
- GitHub Pages is rebuilt from the deployed modular root files while the public URL remains unchanged.

### 2026-09-12

- Random Seoul branding, permanent Web support, shared-core architecture, Phase 1 modular refactor, Android native foundation, Places bridge, and CI foundations established.
