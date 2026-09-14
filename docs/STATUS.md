# Random Seoul — Development Status

Last updated: 2026-09-14

이 문서는 현재 진행 위치와 다음 행동을 기록합니다.

## Product / platform role

- **Android:** 현재 주 개발/배포 대상이자 앱 본체
- **Web:** 계속 배포되는 지원 대상이면서 Android 기능/UX를 빠르게 검증하는 reference implementation
- 프로젝트 소유자는 iPhone 사용자이므로 Web은 Android 기기 없이 새 기능을 직접 확인하는 실사용 검증 경로로도 중요함
- **iOS:** Android 안정화 이후 shared core를 재사용해 후속 지원 예정

## Public Web

Status: **MODULAR WEB DEPLOYED / BROADER BROWSE-WORTHY ATTRACTIONS LIVE**

- Deployment: GitHub Pages, existing public URL retained
- Maintained source entry: `modular.html`
- Public entry: root `index.html`, generated from the verified Vite modular build
- Web remains a supported target and rapid validation surface
- Main draw flow: line → station → food → new course
- Restaurant recommendation: Google Places live TOP 3, hard radius 2 km
- Supplemental station result: own curated 0–2 attractions / browse-worthy destinations
- Existing Web localStorage settings/history keys are preserved
- Web browser key remains separate from Android and is HTTP-referrer restricted
- Random Seoul subway-sign + dice icon is published as Web app icon

`web-release.yml` owns public-Web artifact promotion: test → build → browser smoke → root deployment artifact. It runs for relevant `main` source/build changes and also supports manual dispatch.

## Phase 1 — Shared core + modular Web refactor

Status: **COMPLETE / MERGED**

Merged PR: `#2 refactor: modularize Random Seoul shared core`
Main merge commit: `4d7808fd7a21c59991234d86792b141b0d02c150`

Completed: Vite/TypeScript/Vitest scaffold, shared subway/food data, draw engine, state/storage boundaries, Web Places adapter, station resolver/cache, shared restaurant ranking, shared controller, typed UI modules, deterministic browser self-test, responsive mobile parity gates.

## Curated nearby attractions

Status: **LIVE / BROWSE-WORTHY EXPANSION DEPLOYED**

Google Places attraction search/ranking has been removed from runtime.

Current policy:

- station draw remains random; attraction is supplemental information
- first-party curated static data
- maximum 2 places per station
- no recommendation if a station has no worthwhile candidate
- threshold is now **actual browse/stay value + reasonable station accessibility**
- practical question: “이 역에 내려서 30분~몇 시간 정도 둘러보거나 구경할 목적으로 추천해도 괜찮은가?”
- Tier A: major metro-area landmark/destination → include
- Tier B: markets, distinctive streets, cultural spaces, walks, parks/waterfronts, campuses and large browse-worthy shopping/lifestyle destinations → include
- commercial facilities such as Starfield, IKEA, large malls/outlets/major department stores are eligible when browsing the facility itself is a worthwhile outing experience
- Tier C: ordinary playground, apartment pocket park, generic neighborhood facility, ordinary mart/small shopping facility → exclude
- selection is editorial rather than a mechanical rating/review score
- no Google attraction Text Search or attraction rating/review threshold
- map button remains a normal outbound Google Maps search link

Detailed criteria: `docs/ATTRACTION_CURATION.md`.

Data layout:

- `curated-attractions-base.ts`: prior verified seed
- `curated-attractions-extra.ts`: broader browse-worthy expansion
- `curated-attractions.ts`: merge + ID dedupe + max-2 public lookup

Representative additions in the latest expansion include IKEA 광명/고양, 스타필드 수원/고양, 롯데몰 김포공항, 현대백화점 디큐브시티, 더현대 서울, 스타필드시티 위례, 현대백화점 판교, 광교호수공원, 현대프리미엄아울렛 송도, 트리플스트리트, 원마운트, 라페스타, 왕송호수, 철도박물관, 신포국제시장, 여러 전통시장/카페거리/로데오거리/문화공간 등입니다.

The 0–2 rule remains unchanged; weak places are not added merely to fill slots.

Verification state:

- main source commit `7e45dfb3210c1b16a758523bdc5e4d8f2aac967c` introduced the broader data layer and regression tests.
- Web Release run tested the new station-key integrity, unit/regression suite, Vite build and headless Chrome smoke successfully.
- deployment commit `94700886f6d9b7c1ff23dde0cdff71beef024979` publishes bundle `assets/modular-BsK7DWq7.js` to the public Web root.
- Android branch source/tests are synchronized at `c699421006f97dd7356f3951d6708ded875636bd`.
- no fresh Actions run has been generated for that Android head yet; re-verify the current Android branch through shared CI + Android APK CI before merge/release.

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

Status: **ACTIVE — BROADER ATTRACTION DATA SYNCED / FRESH CI PENDING**

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
- latest browse-worthy attraction data + regression tests synchronized at commit `c699421006f97dd7356f3951d6708ded875636bd`
- current Android head has no new Actions run yet; previous APK/CI run was green before this newest expansion

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

The repository itself is the durable project memory for future chats and development sessions.

- `docs/PROJECT_CONTEXT.md`: fast handoff / project recovery document
- `docs/STATUS.md`: current implementation state and recent verified changes
- `docs/PROJECT_PLAN.md`: product intent, platform strategy and roadmap
- `docs/ARCHITECTURE.md`: technical structure and design ownership
- `docs/ATTRACTION_CURATION.md`: attraction inclusion/exclusion policy

Meaningful feature, architecture, policy, branch-role or validation changes must update the relevant documentation in the same change/PR. New sessions should read `PROJECT_CONTEXT.md` first, then `STATUS.md`, and verify actual GitHub branches/PRs/CI before modifying code.

## Current automated gates

Web PR/CI:

- TypeScript/unit tests
- curated-attraction regression + station-key integrity tests
- static-station-center regression test
- Vite modular build
- deterministic headless Chrome full-flow smoke
- restaurant TOP 3 / 2 km contract
- responsive mobile contract

Android CI additionally verifies native Vite build, Capacitor sync, stable signing, Places secret detection, Gradle APK build, certificate report and APK artifact upload.

## Change log

### 2026-09-14

- Broadened attraction acceptance from mainly landmark/region-representative destinations to **places that are genuinely worth browsing or spending time at after a random station draw**.
- Added commercial/lifestyle destinations such as IKEA 광명/고양, 스타필드 수원/고양, 더현대 서울, 대형 몰·아울렛·백화점 alongside markets, parks, waterfronts, campuses and cultural spaces.
- Kept ordinary playgrounds, apartment pocket parks and weak generic neighborhood facilities excluded.
- Split curated attraction data into base + extra layers while keeping `curated-attractions.ts` as the stable public lookup entry.
- Added regression coverage for browse-worthy commercial destinations, base+extra supplement behavior and invalid station-key detection.
- Verified and deployed the broader Web data: source `7e45dfb...` → deployed root commit `94700886...` / bundle `modular-BsK7DWq7.js`.
- Synchronized the same data/test changes to Android branch commit `c699421...`; fresh Android CI remains pending.
- Earlier in the day, expanded the initial landmark-heavy seed with Tier B regional destinations such as 문래창작촌, 용리단길, 성수 연무장길, 경의선숲길, 홍제폭포, 샤로수길, 신당동 떡볶이타운, 서울새활용플라자, 광명전통시장 and 안양예술공원.
- Added `docs/ATTRACTION_CURATION.md` and established repository documentation as durable cross-chat project memory.
- Clarified platform roles: Android primary, Web supported/reference validation surface, iOS later.
- Decided not to persist Google-derived restaurant TOP 3 results as a reusable DB.
- Removed live Google attraction Text Search/ranking and added static-first station coordinate lookup with live fallback.

### 2026-09-13

- Galaxy S20 core Android flow and live restaurant TOP 3 verified.
- Nearby attraction recommendation first introduced.
- Public modular Web deployed while unfinished Android native work remained isolated in PR #3.
- Random Seoul official subway-sign + dice icon applied to Web and Android.

### 2026-09-12

- Random Seoul branding, permanent Web support, shared-core architecture, Phase 1 modular refactor, Android native foundation, Places bridge, and CI foundations established.
