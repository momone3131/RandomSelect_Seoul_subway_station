# Random Seoul — Development Status

Last updated: 2026-09-18

이 문서는 현재 진행 위치와 다음 행동을 기록합니다.

## Public Web

Status: **MODULAR WEB DEPLOYED**

- Deployment: GitHub Pages, existing public URL retained
- Maintained source entry: `modular.html`
- Public entry: root `index.html`, generated from the verified Vite modular build
- Web remains a permanent supported target
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

## Physical interchange consistency

- 동일한 실제 환승역은 어느 노선에서 추첨돼도 동일한 curated attraction 결과를 공유합니다.
- 동명이지만 다른 역인 신촌(2호선/경의중앙선), 양평(5호선/경의중앙선)은 자동 병합하지 않습니다.
- 총신대입구(이수) / 이수는 이름이 다른 동일 환승역으로 명시 연결합니다.
- 이 수정으로 30개의 기존 빈 line/station 결과가 이미 큐레이션된 동일 환승역 명소를 상속합니다.
- 800개 line/station 추첨 결과 기준 명소 0/1/2개 분포는 391 / 307 / 102입니다.

## Curated nearby attractions

Status: **STATIC-DATA MIGRATION IN PROGRESS / PR #6**

Google Places attraction search/ranking is being removed from runtime.

New policy:

- station draw remains random; attraction is supplemental information
- own `curated-attractions.ts` station→attraction dataset
- maximum 2 representative places
- no recommendation if a station lacks a clearly representative destination
- no Google attraction Text Search
- no Google rating/review threshold for attractions
- no attraction Google-content cache/database
- map button remains a normal outbound Google Maps search link

Initial examples include 이촌→국립중앙박물관, 여의나루→여의도한강공원, 자양→뚝섬한강공원, 경복궁→경복궁/국립고궁박물관, 마곡나루→서울식물원 and other high-confidence landmarks.

This replaces the previous `minimum reviews = 20 / score >= 0.45` strategy, which could still surface lesser-known Places results.

## Static station centers

Status: **STATIC-FIRST MIGRATION IN PROGRESS / PR #6**

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

Status: **ACTIVE — CORE FLOW VERIFIED ON GALAXY S20**

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

After PR #6 Web/shared validation, its shared static-attraction/station-coordinate changes must be synced into this Android branch and Android CI re-run.

## Shared architecture requirements

- Web is a permanent product target.
- Android/iOS business logic stays out of shared product rules.
- Platform-specific work stays behind adapters/plugins.
- Restaurants remain shared TypeScript ranking over live provider candidates.
- Attractions are first-party curated product data, not provider-ranked results.
- Static station centers are preferred; live provider lookup is fallback only.
- Current-location/GPS permission remains absent unless a later explicit feature requires it.

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

- Decided not to persist Google-derived restaurant TOP 3 results as a reusable DB.
- Replaced attraction popularity thresholds with a stricter first-party curation approach.
- Added initial station→representative-attraction static dataset, maximum 2 per station.
- Removed live Google attraction Text Search/ranking from the shared controller.
- Added static-first station coordinate lookup with live fallback for uncovered stations.
- Added regression tests for curated attractions and static station centers.

### 2026-09-13

- Galaxy S20 core Android flow and live restaurant TOP 3 verified.
- Nearby attraction recommendation first introduced.
- Public modular Web deployed while unfinished Android native work remained isolated in PR #3.
- Random Seoul official subway-sign + dice icon applied to Web and Android.

### 2026-09-12

- Random Seoul branding, permanent Web support, shared-core architecture, Phase 1 modular refactor, Android native foundation, Places bridge, and CI foundations established.


## Zero-coverage attraction re-audit — 2026-09-18

Shared curated-attraction data was re-audited in multiple passes using actual map/transit proximity plus municipal tourism/cultural sources rather than tourism lists alone.

- baseline after interchange fix: 391 zero / 307 one / 102 two
- final 800 line/station outcomes: **262 zero / 431 one / 107 two**
- attraction coverage: **67.3%**
- physical missing station groups: **237**
- unique surfaced attractions: **420 = Diamond 4 / Gold 25 / Silver 100 / Standard 291**
- planned/unbuilt, generic neighborhood-only, or bus-dependent/far candidates remain intentionally uncurated
- over-aggressive candidates are removed when access evidence does not match the drawn station

Android uses the same shared curation/tier/test contract as Web.


### Hwajeong follow-up
- 화정역 now returns 화정 문화의거리 + 고양어린이박물관.
- 고양어린이박물관 remains Standard prominence.


## Durable visit history — Phase 1

- recent draw history remains max12 and disposable
- durable visit key: `random_seoul_visits_v1`
- recent history card can create/edit a `다녀왔어요` record
- station is mandatory
- drawn food category is optional/user-confirmed; Google restaurant result is not stored
- shown attractions are optional multi-select/user-confirmed
- visit date is optional; new record defaults to today and can be cleared
- visits have separate edit/delete UI
- clearing recent draw history leaves visits intact
- shared Web/Android source snapshots the attraction candidates shown at draw time

Roadmap: `docs/VISIT_HISTORY_PLAN.md`
1. durable visits
2. footprint map
3. unvisited-first / visited-excluded random
4. simple visit statistics


### Phase 1 verification
- shared tests — success
- native Web build — success
- Capacitor Android sync — success
- Gradle debug APK — success
- Android CI `35339228627` — success
- fixed latest development APK republished: `11,433,508` bytes
