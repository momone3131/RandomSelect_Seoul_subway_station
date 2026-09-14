# Random Seoul — Development Status

Last updated: 2026-09-15

이 문서는 현재 진행 위치와 다음 행동을 기록합니다.

## Product / platform role

- **Android:** 현재 주 개발/배포 대상이자 앱 본체
- **Web:** 계속 배포되는 지원 대상이면서 Android 기능/UX를 빠르게 검증하는 reference implementation
- 프로젝트 소유자는 iPhone 사용자이므로 Web은 Android 기기 없이 새 기능을 직접 확인하는 실사용 검증 경로로도 중요함
- **iOS:** Android 안정화 이후 shared core를 재사용해 후속 지원 예정

## Public Web

Status: **MODULAR WEB DEPLOYED / ATTRACTION MAP TARGET FIX LIVE**

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

`web-release.yml` owns public-Web artifact promotion: test → build → browser smoke → root deployment artifact. It runs for relevant `main` source/build changes and also supports manual dispatch. Deployment commit creation now fetches/rebases onto the latest `main` before push so harmless concurrent docs/test commits do not reject the release push.

## Phase 1 — Shared core + modular Web refactor

Status: **COMPLETE / MERGED**

Merged PR: `#2 refactor: modularize Random Seoul shared core`
Main merge commit: `4d7808fd7a21c59991234d86792b141b0d02c150`

Completed: Vite/TypeScript/Vitest scaffold, shared subway/food data, draw engine, state/storage boundaries, Web Places adapter, station resolver/cache, shared restaurant ranking, shared controller, typed UI modules, deterministic browser self-test, responsive mobile parity gates.

## Curated nearby attractions

Status: **LIVE / BROWSE-WORTHY EXPANSION + MAP TARGET HARDENING DEPLOYED**

Google Places attraction search/ranking has been removed from runtime.

Current policy:

- station draw remains random; attraction is supplemental information
- first-party curated static data
- maximum 2 places per station
- no recommendation if a station has no worthwhile candidate
- threshold is **actual browse/stay value + reasonable station accessibility**
- practical question: “이 역에 내려서 30분~몇 시간 정도 둘러보거나 구경할 목적으로 추천해도 괜찮은가?”
- Tier A: major metro-area landmark/destination → include
- Tier B: markets, distinctive streets, cultural spaces, walks, parks/waterfronts, campuses and large browse-worthy shopping/lifestyle destinations → include
- commercial facilities such as Starfield, IKEA, large malls/outlets/major department stores are eligible when browsing the facility itself is a worthwhile outing experience
- Tier C: ordinary playground, apartment pocket park, generic neighborhood facility, ordinary mart/small shopping facility → exclude
- selection is editorial rather than a mechanical rating/review score
- no Google attraction Text Search or attraction rating/review threshold

Detailed criteria: `docs/ATTRACTION_CURATION.md`.

Data layout:

- `curated-attractions-base.ts`: prior verified seed
- `curated-attractions-extra.ts`: broader browse-worthy expansion
- `curated-attractions.ts`: merge + ID dedupe + max-2 public lookup

### Attraction map-target fix

The attraction dataset does **not** store dedicated attraction latitude/longitude. `AttractionRecommendation.mapQuery` is the static Google Maps target.

The previous UI appended the drawn station name to every attraction query (`mapQuery + stationName + 역`). That could make Google Maps prefer the station itself or a same-named nearby place. This has been removed globally.

Current behavior:

- `googleMapsAttractionUrl()` uses only the curated attraction `mapQuery` (or attraction name fallback)
- UI never appends the station name automatically
- ambiguous streets/markets/parks receive city/district/road/address disambiguators where needed
- broad linear/waterfront destinations use a concrete nearby anchor when possible
- vague targets are removed rather than forcing a misleading pin

Representative corrections:

- 검암: broad `경인아라뱃길` → `경인아라뱃길 시천가람터`, map target `시천가람터 인천광역시 서구 시천동 158-11`
- 천호 로데오거리: road context added
- 정자동 카페거리: 성남/분당 context added
- 수원역·범계·산본·서현 로데오거리: city/road context added
- 안양1번가·부평 문화의거리·강촌유원지: regional context added
- 오목교의 vague `오목교·목동 상권` recommendation removed; the station keeps the stronger 현대백화점 목동점 candidate only

Regression coverage now verifies the station-key set, max-2 rule, exact ambiguous target example, absence of station-only map targets, and that attraction URL generation does not append a station name.

Verification:

- main CI run `34903621591` passed the map-target regression suite, Vite build and browser smoke gates.
- later documentation/workflow heads also pass normal main CI.
- Web Release run `34904203485` passed tests → build → release smoke → root promotion → deployment push.
- public Web deployment commit `828b39a04bf2cc577347d6e7302ec55d96fe6509` publishes bundle `assets/modular-Chs_uZ61.js`, which includes the corrected attraction map behavior/data.

The 0–2 rule remains unchanged; weak places are not added merely to fill slots.

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

Status: **ACTIVE — MAP TARGET FIX INCLUDED IN LATEST DEV APK**

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
- exact attraction map-target behavior/data/tests synchronized to Android branch
- Android CI runs on relevant pushes to `feature/random-seoul-android`
- Android SDK setup explicitly requests `platform-tools` and no longer requests the removed legacy `tools` package
- successful branch builds create `random-seoul-debug-apk` Actions artifact and update fixed Release tag `android-dev-latest`

Latest verified development APK:

- source commit: `b4e2e41616c88881b5ef054f20d6d6f992d26159`
- Android CI run: `34903899348` — success
- asset: `random-seoul-latest.apk`
- size: 11,407,520 bytes
- SHA-256: `597b5cd675f538b1b0e95793a2aec2f3a173fe5d0023475e4560b201a617846a`
- checksum asset: `random-seoul-latest.apk.sha256`

Easy download locations remain linked at the top of `README.md`.

## Shared architecture requirements

- Android is the current primary app-development target.
- Web remains supported and doubles as the fastest cross-device validation surface.
- Android/iOS business logic stays out of shared product rules.
- Platform-specific work stays behind adapters/plugins.
- Restaurants remain shared TypeScript ranking over live provider candidates.
- Attractions are first-party curated product data, not provider-ranked results.
- Attraction map targets must be self-contained and must not depend on automatically appending a station name.
- Static station centers are preferred; live provider lookup is fallback only.
- Current-location/GPS permission remains absent unless a later explicit feature requires it.

## Documentation continuity

Status: **ACTIVE / REQUIRED**

The repository itself is the durable project memory for future chats and development sessions.

- `docs/PROJECT_CONTEXT.md`: fast handoff / project recovery document
- `docs/STATUS.md`: current implementation state and recent verified changes
- `docs/PROJECT_PLAN.md`: product intent, platform strategy and roadmap
- `docs/ARCHITECTURE.md`: technical structure and design ownership
- `docs/ATTRACTION_CURATION.md`: attraction inclusion/exclusion and map-target integrity policy

Meaningful feature, architecture, policy, branch-role or validation changes must update the relevant documentation in the same change/PR. New sessions should read `PROJECT_CONTEXT.md` first, then `STATUS.md`, and verify actual GitHub branches/PRs/CI before modifying code.

## Current automated gates

Web PR/CI:

- TypeScript/unit tests
- curated-attraction regression + station-key/map-target integrity tests
- map-link regression test preventing automatic station-name suffixes
- static-station-center regression test
- Vite modular build
- deterministic headless Chrome full-flow smoke
- restaurant TOP 3 / 2 km contract
- responsive mobile contract

Android CI additionally verifies native Vite build, Capacitor sync, stable signing, Places secret detection, Gradle APK build, certificate report, APK artifact upload and latest-development Release publication on Android branch pushes.

## Change log

### 2026-09-15

- Investigated reports that attraction map links sometimes opened a same-named station or unrelated nearby place.
- Confirmed there were no dedicated attraction coordinates; the root cause was Google Maps search query construction that appended the drawn station name to `mapQuery`.
- Added `googleMapsAttractionUrl()` and changed attraction UI to use each curated `mapQuery` directly with no automatic station suffix.
- Disambiguated high-risk market/street/park targets with city/district/road/address context.
- Replaced 검암's broad `경인아라뱃길` target with the concrete nearby `경인아라뱃길 시천가람터` anchor and address target.
- Removed the vague 오목교·목동 상권 entry rather than keeping a misleading map result.
- Added regression tests for map-target integrity and no-station-suffix URL generation.
- Synchronized all map-target fixes/tests to the Android branch and rebuilt the latest development APK.
- Android CI initially hit GitHub runner incompatibility because `setup-android` tried to install removed SDK package `tools`; workflow now requests `platform-tools` explicitly. Run `34903899348` then passed completely and republished `android-dev-latest`.
- Hardened `web-release.yml` against concurrent docs/test commits by rebasing the generated deployment commit onto latest `main` before push.
- Web Release run `34904203485` passed and deployment commit `828b39a0...` published bundle `modular-Chs_uZ61.js` with the corrected map targets.

### 2026-09-14

- Added a persistent Android development distribution path: successful Android branch builds publish `random-seoul-latest.apk` to fixed Release tag `android-dev-latest` and keep the Actions artifact as a secondary path.
- Added direct latest-APK and Release links to the repository `README.md` so the APK can be downloaded without navigating Actions internals.
- Broadened attraction acceptance from mainly landmark/region-representative destinations to **places that are genuinely worth browsing or spending time at after a random station draw**.
- Added commercial/lifestyle destinations such as IKEA 광명/고양, 스타필드 수원/고양, 더현대 서울, 대형 몰·아울렛·백화점 alongside markets, parks, waterfronts, campuses and cultural spaces.
- Kept ordinary playgrounds, apartment pocket parks and weak generic neighborhood facilities excluded.
- Split curated attraction data into base + extra layers while keeping `curated-attractions.ts` as the stable public lookup entry.
- Added regression coverage for browse-worthy commercial destinations, base+extra supplement behavior and invalid station-key detection.
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
