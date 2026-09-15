# Random Seoul — Development Status

Last updated: 2026-09-15

이 문서는 현재 진행 위치와 다음 행동을 기록합니다.

## Product / platform role

- **Android:** 현재 주 개발/배포 대상이자 앱 본체
- **Web:** 계속 배포되는 지원 대상이면서 Android 기능/UX를 빠르게 검증하는 reference implementation
- 프로젝트 소유자는 iPhone 사용자이므로 Web은 Android 기기 없이 새 기능/UX를 직접 확인하는 실사용 검증 경로로도 중요함
- **iOS:** Android 안정화 이후 shared core를 재사용해 후속 지원 예정

## Public Web

Status: **MODULAR WEB DEPLOYED / COMPACT UI + DRAW FEEDBACK LIVE**

- Deployment: GitHub Pages, existing public URL retained
- Maintained source entry: `modular.html`
- Public entry: root `index.html`, generated from verified Vite modular build
- Main draw flow: line → station → food → new course
- Restaurant recommendation: Google Places live TOP 3, hard radius 2 km
- Supplemental station result: own curated 0–2 attractions / browse-worthy destinations
- existing localStorage settings/history keys are preserved
- Web browser key remains separate from Android and is HTTP-referrer restricted

`web-release.yml` owns test → build → browser smoke → root deployment promotion. It runs for relevant `main` source/build changes and supports manual dispatch. Deployment commit creation fetches/rebases onto latest `main` before push.

## Phase 1 — Shared core + modular Web refactor

Status: **COMPLETE / MERGED**

Merged PR: `#2 refactor: modularize Random Seoul shared core`
Main merge commit: `4d7808fd7a21c59991234d86792b141b0d02c150`

Completed: Vite/TypeScript/Vitest scaffold, shared subway/food data, draw engine, state/storage boundaries, Web Places adapter, station resolver/cache, restaurant ranking, shared controller, typed UI modules, deterministic browser self-test, responsive mobile parity gates.

## Primary draw / visual UI

Status: **COMPACT VISUAL SYSTEM + INTERACTION FEEDBACK LIVE ON WEB / IN LATEST ANDROID APK**

### Main interaction

- the same `draw_btn` is moved into the card that will receive the **next** random result
- line stage → line card; station stage → station card; food stage → food card
- completed course → CTA returns to lower action area as `새 코스`
- the whole active card is the primary draw target and keeps the dice affordance
- progress/result labels are `노선 / 역 / 음식`
- secondary actions are concise: `처음부터 / 역 다시 / 음식 다시 / 복사`
- redundant brand/runtime/hero/scope/card/helper/map/restaurant explanatory copy stays hidden
- settings, partial redraw, map, copy, attraction and restaurant actions remain available

### Draw interaction feedback

The primary draw card now has two deliberately short feedback phases instead of decorative long animation.

**Pressed / held feedback**

- pointer-down depresses the active card from its raised baseline to about `translateY(3px) scale(.985)`
- hard shadow collapses from `0 4px` to `0 1px`, so the card reads as a physical button being pressed
- press transition is ~75 ms; release settles back over ~110 ms
- pointer-up, pointer-cancel, lost capture and blur all release the state safely
- implemented in `src/ui/primary-draw-placement.ts` with the Web Animations API while retaining the real full-card button for semantics

**Random-result settled feedback**

- after the actual result has been committed and final UI render completes, the result card alone receives a short ~360 ms thump
- card rises about 4 px / scales to about 1.018, receives a crisp lime outline, then settles through a small compression back to normal
- no particle, glow-cloud or long celebratory animation; effect stays consistent with the stronger-line physical UI language
- `requestAnimationFrame` deliberately defers the effect until after `performDraw()`'s final render so station/food effects are not erased by rerendering
- `prefers-reduced-motion` skips the settled-result motion
- Android keeps the existing `randomseoul:draw-revealed` event before this visual effect, so native result haptics remain intact
- implemented in `src/ui/draw-animation.ts`

### Visual-density policy

- removing copy must also reclaim vertical space; do not leave the old tall-card skeleton behind
- desktop result cards target about **176 px** minimum height
- phone line/station cards target about **164 px**, about **154 px** on narrow phones
- phone food card targets about **96 px**, about **91 px** on narrow phones
- tiny UI copy is raised toward **12–13 px** where practical
- principal containers use roughly **2 px** structural borders; secondary cards/buttons use **1.5 px** borders
- result-card radii ~13 px, secondary cards ~7–11 px, main shell ~18 px
- broad soft shadows and active-card gradients are avoided
- active draw card uses **flat lime + 2 px dark border + short hard shadow**
- restaurant/attraction cards, station list, history and settings modal follow the same stronger-line / restrained-radius system
- mobile touch targets remain at least 44 px where appropriate

### Implementation / regression ownership

- `src/ui/primary-draw-placement.ts`: main-button placement + held press/release feedback
- `src/ui/draw-animation.ts`: rolling preview + settled-result feedback
- `src/ui/draw-view.ts`: concise stage/result/action copy
- `src/ui/mobile-overrides.css`: density, typography, border/radius/shadow system
- `tests/responsive-contract.test.ts`: integrated-card, minimal-copy, density, visual-weight and interaction-feedback contracts

### Latest verification

Visual-system baseline:

- source `000ba269f118281accf1b8b4f53f4980674f9351`
- regression contract `36a0b048475f4ecb3e3e5e7b4b8f636346556e23`
- CI `34952418260` success

Interaction feedback:

- Web press feedback source `ede2b36aab179c8522c231a43a090ecd6cd50bf4`
- Web settled-result source `e6f5dce7a8c909e364d89be57e8664caacb13313`
- feedback regression contract `0d31ca87d63964a9baa389dcd08ab43ab19430d3`
- main CI run `34953920183` — **success** (tests + Vite build + headless browser smoke)
- Web Release run `34953886921` — **success**
- public deployment commit `ae1e81f8e205b5434874e34e4e9d39097d4d7ad0`
- public bundle `assets/modular-72HrgXAb.js`
- GitHub Pages run `34953937823` — **success**

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

### Attraction map-target integrity

Attraction data does not store dedicated attraction latitude/longitude. `AttractionRecommendation.mapQuery` is the static Google Maps target.

- `googleMapsAttractionUrl()` uses only curated `mapQuery` or attraction-name fallback
- UI never automatically appends station name
- ambiguous streets/markets/parks get city/district/road/address disambiguators
- broad linear/waterfront destinations use a concrete nearby anchor when possible
- vague targets are removed rather than forcing a misleading pin

Representative correction: 검암의 broad `경인아라뱃길` target is the concrete nearby `경인아라뱃길 시천가람터` / `인천광역시 서구 시천동 158-11` target. The vague 오목교·목동 상권 entry was removed.

Regression coverage verifies station keys, max-2, ambiguous targets, absence of station-only map targets and no automatic station suffixing.

## Static station centers

Status: **STATIC-FIRST ACTIVE**

- `station-coordinates.ts` is checked before Google station resolution
- covered stations skip Google station-resolution calls
- uncovered/new stations retain Google fallback
- fallback Google station coordinates keep the existing 30-day cache
- initial static coverage prioritizes curated-attraction stations and major interchanges

Reference/source policy includes public station-master data such as Seoul/TOPIS `서울시 역사마스터 정보`.

## Restaurant recommendation policy

Restaurants remain **live Google Places data**.

- candidate lookup occurs after food draw completion
- ranking uses rating, review volume, Google relevance and distance
- TOP 3 is not persisted as a reusable restaurant DB
- Google rating/review values are not harvested into a long-term database

## Phase 2 — Android app

Status: **ACTIVE — COMPACT UI + DRAW FEEDBACK INCLUDED IN LATEST DEV APK**

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
- Galaxy S20 core line → station → food + live restaurant TOP 3 verified
- Random Seoul launcher/adaptive icon applied
- curated attractions/static station centers/map-target fixes synchronized
- integrated primary draw card + minimal-copy + compact visual system synchronized
- held press/release feedback synchronized
- 360 ms settled-result visual effect synchronized **without removing native `randomseoul:draw-revealed` haptic event**
- Android CI includes `tests/**` in path filters
- successful builds create `random-seoul-debug-apk` and update fixed tag `android-dev-latest`

Latest verified development APK:

- source/build head: `04bb694cb538ef6811f62c3cb00630f4de0a3919`
- Android CI run: `34954032893` — **success**
- shared tests → native build → Capacitor sync → Gradle `assembleDebug` → artifact → fixed Release all passed
- asset: `random-seoul-latest.apk`
- size: 11,411,160 bytes
- SHA-256: `aced5943dd8902887978e3954c424552e97458e75a8184224a26a3126b243f15`
- checksum asset: `random-seoul-latest.apk.sha256`

Easy download locations remain linked at top of `README.md`.

## Shared architecture requirements

- Android is current primary app target.
- Web remains supported and is the fastest cross-device validation surface.
- Android/iOS business logic stays out of shared product rules.
- platform-specific work stays behind adapters/plugins.
- restaurants remain shared TypeScript ranking over live provider candidates.
- attractions are first-party curated product data, not provider-ranked results.
- attraction map targets must be self-contained and must not depend on station-name suffixing.
- static station centers are preferred; live provider lookup is fallback only.
- current-location/GPS permission remains absent unless an explicit later feature requires it.

## Documentation continuity

Status: **ACTIVE / REQUIRED**

Repository docs are durable cross-chat project memory:

- `docs/PROJECT_CONTEXT.md`: fast handoff / recovery
- `docs/STATUS.md`: current implementation and verification
- `docs/PROJECT_PLAN.md`: product intent/platform roadmap
- `docs/ARCHITECTURE.md`: technical ownership/data flow
- `docs/ATTRACTION_CURATION.md`: attraction inclusion/exclusion/map integrity

Meaningful feature, architecture, policy, branch-role or validation changes must update relevant docs. New sessions should read `PROJECT_CONTEXT.md`, then `STATUS.md`, then verify live branches/PR/CI.

## Current automated gates

Web PR/CI:

- TypeScript/unit tests
- integrated primary draw placement/style contract
- minimal main-surface copy contract
- compact density / larger-small-type / stronger-line visual contract
- held press/release and settled-result interaction contract
- curated-attraction regression + station-key/map-target integrity
- static station-center regression
- Vite build
- deterministic headless Chrome full-flow smoke
- restaurant TOP 3 / 2 km contract
- responsive mobile contract

Android CI runs the shared gates plus native Vite build, Capacitor sync, stable signing, Places secret detection, Gradle APK build, certificate report, artifact upload and latest-development Release publication.

## Change log

### 2026-09-15

- Added tactile held-state feedback to the whole-card random button: ~75 ms depression with short-shadow collapse and ~110 ms release.
- Reworked result reveal so the selected card gets a crisp ~360 ms thump + lime outline **after** final state rendering; this fixes the old reveal class being vulnerable to rerender removal.
- Preserved `prefers-reduced-motion` for settled-result animation and preserved Android native `randomseoul:draw-revealed` haptic signaling.
- Added regression coverage for both feedback phases.
- Web CI `34953920183`, Web Release `34953886921` and Pages `34953937823` passed; deployment `ae1e81f8...` publishes `modular-72HrgXAb.js`.
- Android interaction changes synchronized; CI `34954032893` passed completely and republished `android-dev-latest` from source `04bb694c...`.
- Rebalanced visible UI after explanatory-copy removal: reclaimed vertical space, increased formerly tiny copy, strengthened lines to a 1.5–2 px system and reduced excessive radii.
- Removed active-card gradient/large soft shadow in favor of flat lime + dark line + short hard shadow.
- Applied the same visual language to restaurant/attraction cards, station list, history and settings modal.
- Attraction map targets remain hardened against same-name station/unrelated-place matching.

### 2026-09-14

- Added persistent Android dev distribution through fixed tag `android-dev-latest` and direct README download links.
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
