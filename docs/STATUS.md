# Random Seoul — Development Status

Last updated: 2026-09-14

이 문서는 현재 진행 위치와 다음 행동을 기록합니다.

## Product / platform role

- **Android:** 현재 주 개발/배포 대상이자 앱 본체
- **Web:** 계속 배포되는 지원 대상이면서 Android 기능/UX를 빠르게 검증하는 reference implementation
- 프로젝트 소유자는 iPhone 사용자이므로 Web은 Android 기기 없이 새 기능을 직접 확인하는 실사용 검증 경로로도 중요함
- **iOS:** Android 안정화 이후 shared core를 재사용해 후속 지원 예정

## Public Web

Status: **MODULAR WEB DEPLOYED / CURATED ATTRACTIONS LIVE**

- Deployment: GitHub Pages, existing public URL retained
- Maintained source entry: `modular.html`
- Public entry: root `index.html`, generated from the verified Vite modular build
- Web remains a supported target and rapid validation surface
- Main draw flow: line → station → food → new course
- Restaurant recommendation: Google Places live TOP 3, hard radius 2 km
- Supplemental station result: own curated 0–2 representative attractions
- Existing Web localStorage settings/history keys are preserved
- Web browser key remains separate from Android and is HTTP-referrer restricted
- Random Seoul subway-sign + dice icon is published as Web app icon

`web-release.yml` owns public-Web artifact promotion: test → build → browser smoke → root deployment artifact.

## Phase 1 — Shared core + modular Web refactor

Status: **COMPLETE / MERGED**

Merged PR: `#2 refactor: modularize Random Seoul shared core`
Main merge commit: `4d7808fd7a21c59991234d86792b141b0d02c150`

Completed: Vite/TypeScript/Vitest scaffold, shared subway/food data, draw engine, state/storage boundaries, Web Places adapter, station resolver/cache, shared restaurant ranking, shared controller, typed UI modules, deterministic browser self-test, responsive mobile parity gates.

## Curated nearby attractions

Status: **LIVE / TIER A+B EXPANSION APPLIED**

Google Places attraction search/ranking has been removed from runtime.

Current policy:

- station draw remains random; attraction is supplemental information
- own `curated-attractions.ts` station→attraction dataset
- maximum 2 representative places
- no recommendation if a station has no worthwhile candidate
- curation threshold is **regional representativeness + actual visit value**, not “must be a major Seoul-wide landmark”
- Tier A: major metro-area landmark/destination → include
- Tier B: neighborhood-representative market, street, cultural space, walk, park or local destination worth deliberately visiting → include
- Tier C: ordinary playground, small neighborhood park, generic rest area or weak local facility → exclude
- selection is editorial rather than a mechanical rating/review score; official tourism/local-government sources are used to validate existence, access and representativeness where useful
- no Google attraction Text Search
- no Google rating/review threshold for attractions
- no attraction Google-content cache/database
- map button remains a normal outbound Google Maps search link

Detailed criteria: `docs/ATTRACTION_CURATION.md`.

The dataset has been expanded beyond the initial major-landmark-heavy seed. Representative Tier B additions include 문래창작촌, 용리단길, 성수 연무장길, 경의선숲길, 홍제폭포, 샤로수길, 신당동 떡볶이타운, 답십리 고미술상가, 서울새활용플라자, 광명전통시장 and 안양예술공원. The 0–2 rule remains unchanged and weak places are not added merely to fill slots.

The same expanded shared dataset and regression tests are synchronized to `feature/random-seoul-android`.

Post-expansion CI checks should be verified against the actual latest commit before release; older Web/Android CI runs were green before this expansion.

## Static station centers

Status: **STATIC-FIRST ACTIVE**

- `station-coordinates.ts` is checked before Google station resolution
- covered stations skip Google station-resolution calls entirely
- uncovered/new stations retain the existing Google fallback
- fallback Google station coordinates keep the existing 30-day cache behavior
- initial static coverage prioritizes curated-attraction stations and major interchanges

Reference/source policy: public station-master data such as Seoul Metropolitan Government / TOPIS `서울시 역사마스터 정보`, published under 공공누리 제1유형 (attribution; commercial use and modification allowed).

## Restaurant recommendation policy

Restaurants remain **live Google Places data**.

- candidate lookup occurs when the user completes a food draw
- ranking continues to use rating, review volume, Google relevance and distance
- TOP 3 recommendation result is not persisted as a reusable restaurant DB
- Google rating/review values are not harvested into a long-term database
- restaurant UI/data can therefore stay current while static product data removes avoidable calls elsewhere

## Phase 2 — Android app

Status: **ACTIVE — EXPANDED ATTRACTION DATA SYNCED**

Working branch: `feature/random-seoul-android`
Working PR: `#3 android: build Random Seoul native shell`

Implemented/verified:

- Capacitor 8 Android project
- app ID `io.github.momone3131.randomseoul`
- Places SDK for Android native bridge
- separate Android-restricted Places API key
- stable development signing
- native share, haptics, back handling, map intents
- no GPS/location permission
- Galaxy S20: install/launch, line → station → food, live restaurant TOP 3 verified
- station/food haptic event-based fix built
- Random Seoul subway-sign + dice launcher/adaptive icon applied
- curated-attraction/static-station-center shared changes synchronized to Android branch
- expanded Tier A/B attraction dataset and its regression tests synchronized to Android branch
- pre-expansion Web CI and Android APK CI were passing; verify current head checks before release/merge

## Shared architecture requirements

- Android is the current primary app-development target.
- Web remains supported and doubles as the fastest cross-device validation surface.
- Android/iOS business logic stays out of shared product rules.
- Platform-specific work stays behind adapters/plugins.
- Restaurants remain shared TypeScript ranking over live provider candidates.
- Attractions are first-party curated product data, not provider-ranked results.
- Static station centers are preferred; live provider lookup is fallback only.
- Current-location/GPS permission remains absent unless a later explicit feature requires it.

## Documentation continuity

Status: **ACTIVE / REQUIRED**

The repository itself is now the durable project memory for future chats and development sessions.

- `docs/PROJECT_CONTEXT.md`: fast handoff / project recovery document
- `docs/STATUS.md`: current implementation state and recent verified changes
- `docs/PROJECT_PLAN.md`: product intent, platform strategy and roadmap
- `docs/ARCHITECTURE.md`: technical structure and design ownership
- `docs/ATTRACTION_CURATION.md`: attraction inclusion/exclusion policy

Meaningful feature, architecture, policy, branch-role or validation changes must update the relevant documentation in the same change/PR. New sessions should read `PROJECT_CONTEXT.md` first, then `STATUS.md`, and verify actual GitHub branches/PRs/CI before modifying code.

## Current automated gates

Web PR/CI:

- TypeScript/unit tests
- curated-attraction regression tests
- static-station-center regression test
- Vite modular build
- deterministic headless Chrome full-flow smoke
- restaurant TOP 3 / 2 km contract
- responsive mobile contract

Android CI additionally verifies native Vite build, Capacitor sync, stable signing, Places secret detection, Gradle APK build, certificate report and APK artifact upload.

## Change log

### 2026-09-14

- Expanded `curated-attractions.ts` using the Tier A/B policy instead of keeping the initial major-landmark-heavy seed.
- Added regional destinations such as 문래창작촌, 용리단길, 성수 연무장길, 경의선숲길, 홍제폭포, 샤로수길, 신당동 떡볶이타운, 서울새활용플라자, 광명전통시장 and 안양예술공원 while preserving the 0–2/no-forced-fill rule.
- Added Tier B regression coverage and synchronized the expanded dataset/tests to the Android working branch.
- Formalized editorial attraction selection: context and visit value are primary; official sources validate existence/access/representativeness; generic Tier C neighborhood facilities remain excluded.
- Relaxed attraction curation threshold from mostly major landmarks to `regional representativeness + actual visit value`; Tier A/B are eligible.
- Added `docs/ATTRACTION_CURATION.md` as the explicit attraction inclusion/exclusion standard.
- Clarified platform roles: Android is the current primary app target; Web remains supported and is also the rapid feature/UX validation path, especially because the project owner uses an iPhone.
- Added `docs/PROJECT_CONTEXT.md` so a new chat/session can recover purpose, architecture assumptions, branch roles, data policy and restart procedure from Git alone.
- Established mandatory documentation-maintenance rules for meaningful code/feature/architecture/status changes.
- Decided not to persist Google-derived restaurant TOP 3 results as a reusable DB.
- Replaced attraction popularity thresholds with a first-party curation approach.
- Removed live Google attraction Text Search/ranking from the shared controller.
- Added static-first station coordinate lookup with live fallback for uncovered stations.
- Added regression tests for curated attractions and static station centers.
- Merged PR #6, completed verified Web release, and synchronized the same shared behavior into Android PR #3.

### 2026-09-13

- Galaxy S20 core Android flow and live restaurant TOP 3 verified.
- Nearby attraction recommendation first introduced.
- Public modular Web deployed while unfinished Android native work remained isolated in PR #3.
- Random Seoul official subway-sign + dice icon applied to Web and Android.

### 2026-09-12

- Random Seoul branding, permanent Web support, shared-core architecture, Phase 1 modular refactor, Android native foundation, Places bridge, and CI foundations established.
