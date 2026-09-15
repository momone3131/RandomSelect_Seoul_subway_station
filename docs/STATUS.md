# Random Seoul — Development Status

Last updated: 2026-09-15

이 문서는 현재 진행 위치와 다음 행동을 기록합니다.

## Product / platform role

- **Android:** 현재 주 개발/배포 대상이자 앱 본체
- **Web:** 계속 배포되는 지원 대상이면서 Android 기능/UX를 빠르게 검증하는 reference implementation
- 프로젝트 소유자는 iPhone 사용자이므로 Web은 Android 기기 없이 새 기능/UX를 직접 확인하는 실사용 검증 경로로도 중요함
- **iOS:** Android 안정화 이후 shared core를 재사용해 후속 지원 예정

## Public Web

Status: **MODULAR WEB DEPLOYED / COMPACT MINIMAL UI LIVE**

- Deployment: GitHub Pages, existing public URL retained
- Maintained source entry: `modular.html`
- Public entry: root `index.html`, generated from the verified Vite modular build
- Main draw flow: line → station → food → new course
- Restaurant recommendation: Google Places live TOP 3, hard radius 2 km
- Supplemental station result: own curated 0–2 attractions / browse-worthy destinations
- Existing Web localStorage settings/history keys are preserved
- Web browser key remains separate from Android and is HTTP-referrer restricted
- Random Seoul subway-sign + dice icon is published as Web app icon

`web-release.yml` owns public-Web artifact promotion: test → build → browser smoke → root deployment artifact. It runs for relevant `main` source/build changes and supports manual dispatch. Deployment commit creation fetches/rebases onto latest `main` before push so harmless concurrent commits do not reject the release push.

## Phase 1 — Shared core + modular Web refactor

Status: **COMPLETE / MERGED**

Merged PR: `#2 refactor: modularize Random Seoul shared core`
Main merge commit: `4d7808fd7a21c59991234d86792b141b0d02c150`

Completed: Vite/TypeScript/Vitest scaffold, shared subway/food data, draw engine, state/storage boundaries, Web Places adapter, station resolver/cache, shared restaurant ranking, shared controller, typed UI modules, deterministic browser self-test, responsive mobile parity gates.

## Primary draw / visual UI

Status: **COMPACT VISUAL SYSTEM LIVE ON WEB / INCLUDED IN LATEST ANDROID DEV APK**

The main screen intentionally avoids explanatory copy that a user can infer from the interaction itself.

Current interaction:

- the same `draw_btn` is moved into the card that will receive the **next** random result
- line stage → line card; station stage → station card; food stage → food card
- completed course → CTA returns to the lower action area as `새 코스`
- the whole active card is the primary draw target and keeps the dice affordance
- progress/result labels are `노선 / 역 / 음식`
- secondary actions are concise: `처음부터 / 역 다시 / 음식 다시 / 복사`
- redundant brand/runtime/hero/scope/card/helper/map/restaurant explanatory copy stays hidden
- settings, partial redraw, map, copy, attraction and restaurant actions remain available

Current visual-density policy:

- removing copy must also reclaim vertical space; do not leave the old tall-card skeleton behind
- desktop result cards target about **176 px** minimum height instead of the previous ~220–249 px treatment
- phone line/station cards target about **164 px**, and about **154 px** on narrow phones
- phone food card targets about **96 px**, and about **91 px** on narrow phones
- tiny UI copy is raised toward **12–13 px** where practical; restaurant names are 16 px, section/summary text is also larger than the prior 9–11 px treatment
- principal containers use roughly **2 px** structural borders; secondary cards/buttons use **1.5 px** borders
- radii are reduced: result cards ~13 px, secondary cards ~7–11 px, main shell ~18 px
- broad soft shadows and the previous active-card gradient are removed
- active draw card uses **flat lime + 2 px dark border + short hard shadow**, giving a more deliberate physical-control feel
- restaurant/attraction cards, station list, history and settings modal follow the same stronger-line / restrained-radius system instead of looking like unrelated soft cards
- main result hierarchy remains large enough to scan quickly while small labels/actions no longer look undersized

Implementation:

- `src/ui/primary-draw-placement.ts`: existing main-button placement
- `src/ui/draw-view.ts`: concise stage/result/action copy
- `src/ui/mobile-overrides.css`: final density, typography, border/radius/shadow system and responsive overrides
- `tests/responsive-contract.test.ts`: integrated-card, minimal-copy, density, typography and visual-weight regression contract

Verification:

- visual-system source commit: `000ba269f118281accf1b8b4f53f4980674f9351`
- visual regression contract commit: `36a0b048475f4ecb3e3e5e7b4b8f636346556e23`
- main CI run `34952418260` — success (tests + Vite build + headless browser smoke)
- Web Release run `34952389544` — success after rebuilding current verified `main`
- public Web deployment commit: `4bb8548772464c21717957dbf23df9ba2a0749b1`
- public Web bundle: `assets/modular-BQbRd3MQ.js`
- Android visual source/test commits: `75d24a34fdc1665cfcf1e95d3c9beaccbd0a0d85` / `5fb8df50627538646bf012abc7274fa52564f033`
- GitHub produced one transient `startup_failure` before a job started; this was not an app/test failure
- Android build head `3443d9cbdb38f144cdb7c8a0e5952d2c6b3fffbc` also refreshes `actions/setup-java` to v5
- Android CI run `34952826346` — success through tests → native build → Capacitor sync → Gradle APK → artifact → fixed latest Release

## Curated nearby attractions

Status: **LIVE / BROWSE-WORTHY EXPANSION + MAP TARGET HARDENING DEPLOYED**

Google Places attraction search/ranking has been removed from runtime.

Current policy:

- station draw remains random; attraction is supplemental information
- first-party curated static data, maximum 0–2 places per station
- threshold is **actual browse/stay value + reasonable station accessibility**
- Tier A: major metro-area landmark/destination
- Tier B: markets, distinctive streets, cultural spaces, walks, parks/waterfronts, campuses and large browse-worthy shopping/lifestyle destinations
- Starfield, IKEA, large malls/outlets/major department stores are eligible when browsing the facility itself is a worthwhile outing experience
- Tier C ordinary playgrounds, apartment pocket parks, generic neighborhood facilities and ordinary marts/small shopping facilities are excluded
- selection is editorial rather than a mechanical rating/review score
- no Google attraction Text Search or attraction rating/review threshold

Detailed criteria: `docs/ATTRACTION_CURATION.md`.

Data layout:

- `curated-attractions-base.ts`: prior verified seed
- `curated-attractions-extra.ts`: broader browse-worthy expansion
- `curated-attractions.ts`: merge + ID dedupe + max-2 public lookup

### Attraction map-target fix

The attraction dataset does not store dedicated attraction latitude/longitude. `AttractionRecommendation.mapQuery` is the static Google Maps target.

Current behavior:

- `googleMapsAttractionUrl()` uses only the curated attraction `mapQuery` (or attraction name fallback)
- UI never appends the station name automatically
- ambiguous streets/markets/parks receive city/district/road/address disambiguators where needed
- broad linear/waterfront destinations use a concrete nearby anchor when possible
- vague targets are removed rather than forcing a misleading pin

Representative correction: 검암의 broad `경인아라뱃길` target is now the concrete nearby `경인아라뱃길 시천가람터` / `인천광역시 서구 시천동 158-11` target. The vague 오목교·목동 상권 entry was removed.

Regression coverage verifies station keys, max-2, ambiguous targets, absence of station-only map targets and no automatic station suffixing.

## Static station centers

Status: **STATIC-FIRST ACTIVE**

- `station-coordinates.ts` is checked before Google station resolution
- covered stations skip Google station-resolution calls entirely
- uncovered/new stations retain Google fallback
- fallback Google station coordinates keep the existing 30-day cache behavior
- initial static coverage prioritizes curated-attraction stations and major interchanges

Reference/source policy: public station-master data such as Seoul Metropolitan Government / TOPIS `서울시 역사마스터 정보`, published under 공공누리 제1유형.

## Restaurant recommendation policy

Restaurants remain **live Google Places data**.

- candidate lookup occurs when the user completes a food draw
- ranking continues to use rating, review volume, Google relevance and distance
- TOP 3 recommendation result is not persisted as a reusable restaurant DB
- Google rating/review values are not harvested into a long-term database

## Phase 2 — Android app

Status: **ACTIVE — COMPACT VISUAL UI INCLUDED IN LATEST DEV APK**

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
- Random Seoul launcher/adaptive icon applied
- curated attractions/static station centers/map-target fixes synchronized
- integrated primary draw-card + minimal-copy + compact visual system synchronized
- Android CI runs on relevant branch pushes and includes `tests/**` in its path filter
- successful builds create `random-seoul-debug-apk` and update fixed Release tag `android-dev-latest`

Latest verified development APK:

- source/build head: `3443d9cbdb38f144cdb7c8a0e5952d2c6b3fffbc`
- Android CI run: `34952826346` — success
- asset: `random-seoul-latest.apk`
- size: 11,410,672 bytes
- SHA-256: `2558c618f711d6d9628bad5c3554985d865f6a0994def21ccdf846ab447fc361`
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

- `docs/PROJECT_CONTEXT.md`: fast handoff / project recovery
- `docs/STATUS.md`: current implementation state and recent verified changes
- `docs/PROJECT_PLAN.md`: product intent, platform strategy and roadmap
- `docs/ARCHITECTURE.md`: technical structure and design ownership
- `docs/ATTRACTION_CURATION.md`: attraction inclusion/exclusion and map-target integrity policy

Meaningful feature, architecture, policy, branch-role or validation changes must update the relevant documentation. New sessions should read `PROJECT_CONTEXT.md`, then `STATUS.md`, then verify live branches/PR/CI.

## Current automated gates

Web PR/CI:

- TypeScript/unit tests
- integrated primary draw placement/style contract
- minimal main-surface copy contract
- compact density / larger-small-type / stronger-line visual contract
- curated-attraction regression + station-key/map-target integrity
- map-link regression preventing automatic station-name suffixes
- static station-center regression
- Vite modular build
- deterministic headless Chrome full-flow smoke
- restaurant TOP 3 / 2 km contract
- responsive mobile contract

Android CI runs the same shared tests and additionally verifies native Vite build, Capacitor sync, stable signing, Places secret detection, Gradle APK build, certificate report, artifact upload and latest-development Release publication.

## Change log

### 2026-09-15

- Rebalanced the entire visible UI after explanatory-copy removal: reclaimed stale vertical space instead of leaving empty tall cards.
- Reduced result-card heights and surrounding padding/gaps across desktop, phone and narrow-phone layouts.
- Increased formerly tiny labels/actions/meta copy toward a 12–13 px small-type scale while retaining strong result hierarchy.
- Increased structural borders from the previous mostly-1px treatment to a 1.5–2px system and reduced excessive corner radii.
- Removed the active-card soft gradient / large soft shadow treatment; active draw card is now flat lime with a dark 2px border and short hard shadow.
- Applied the same visual language to restaurant/attraction cards, station list, history and settings modal.
- Added regression tests for density, typography, line weight, restrained radii and no-gradient active card.
- Main CI `34952418260` passed; Web Release `34952389544` succeeded and deployment `4bb85487...` published `modular-BQbRd3MQ.js`.
- Synchronized the visual system to Android. A GitHub runner startup failure occurred before one job could start; a fresh head upgraded setup-java to v5 and run `34952826346` then passed completely, publishing the new latest APK.
- Earlier the main UI copy was simplified aggressively to `노선 / 역 / 음식` and concise actions, with the next-result card itself acting as the primary draw target.
- Attraction map targets were hardened by removing automatic station-name suffixing and disambiguating ambiguous curated map queries.

### 2026-09-14

- Added persistent Android development distribution through fixed Release tag `android-dev-latest` and direct README download links.
- Broadened attraction acceptance to places genuinely worth browsing/spending time at, including IKEA/Starfield/major commercial destinations where appropriate.
- Split curated attraction data into base + extra layers and added curation documentation/regression coverage.
- Clarified platform roles: Android primary, Web supported/reference validation surface, iOS later.
- Kept restaurant results live rather than persisting Google rating/review-derived TOP 3 as a reusable DB.
- Added static-first station coordinate lookup with live fallback.

### 2026-09-13

- Galaxy S20 core Android flow and live restaurant TOP 3 verified.
- Nearby attraction recommendation introduced.
- Public modular Web deployed while unfinished Android native work remained isolated in PR #3.
- Random Seoul official subway-sign + dice icon applied to Web and Android.

### 2026-09-12

- Random Seoul branding, permanent Web support, shared-core architecture, Phase 1 modular refactor, Android native foundation, Places bridge and CI foundations established.
