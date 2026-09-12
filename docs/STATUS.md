# Random Seoul — Development Status

Last updated: 2026-09-12

이 문서는 현재 진행 위치와 다음 행동을 기록합니다. 구현이 진행될 때마다 갱신합니다.

## Current stable Web

- Branch: `main`
- Deployment: GitHub Pages
- Public entry: root `index.html`
- The currently deployed single-file Web app remains intentionally unchanged while native apps are built.
- Product brand for all new modular/native work: **Random Seoul**
- Core flow: line → station → food → restaurant recommendations
- Main button after food: start a new course from line draw
- Partial redraw buttons: line / station / food
- Restaurant provider: Google Places Web
- Restaurant hard distance limit: 2 km
- Ranking: Bayesian rating 55% + log review count 25% + relevance 15% + distance 5%
- Mobile restaurant cards: vertical single-column layout

## Phase 1 — Shared core + modular Web refactor

Status: **COMPLETE / READY TO MERGE**

Working branch: `refactor/random-seoul-core`
Working PR: `#2 refactor: modularize Random Seoul shared core`

### Completed

- [x] Add Vite + TypeScript + Vitest scaffold
- [x] Preserve current single-file `main/index.html` without changing the deployed Web entry
- [x] Promote the stable visual CSS/DOM shell into permanent modular sources
- [x] Decouple modular build sources from the stable root `index.html`
- [x] Extract all 24 subway lines and station ordering
- [x] Extract all 36 food categories and explicit Google search queries
- [x] Define shared domain types
- [x] Extract deterministic draw engine
- [x] Extract restaurant ranking engine
- [x] Extract station resolver / line-token matching
- [x] Define platform-neutral `PlaceSearchService`
- [x] Put Google Maps JavaScript Places behind a Web-only adapter
- [x] Extract state/store boundaries
- [x] Extract storage boundary and browser adapter
- [x] Preserve the stable Web settings/history localStorage schema
- [x] Extract legal 30-day station-coordinate cache behind the storage boundary
- [x] Extract draw / restaurant / settings / history UI render modules
- [x] Extract cross-platform `RandomSeoulController`
- [x] Restore stable 900 ms draw-preview/reveal behavior with instant/reduced-motion bypass
- [x] Restore settings modal Escape and Tab/Shift+Tab focus behavior
- [x] Add isolated `modular.html` and shared Web composition root
- [x] Add unit tests for draw/ranking/data/station/cache/controller/persistence
- [x] Add deterministic browser self-test without Google quota use
- [x] Verify line → station → food → TOP 3 → 2 km filter → full restart in real headless Chrome
- [x] Verify mobile restaurant grid computes to one column in real Chrome below the responsive breakpoint
- [x] Enforce final mobile restaurant buttons at 44 px minimum height and full width
- [x] Build both the stable and modular Web entries in CI

## Protected architectural requirements

These remain binding for later phases:

- Web is a permanent supported target, not a disposable prototype.
- The deployed Web version must remain usable during Android/iOS development.
- Android-specific business logic must not enter the shared domain/controller/ranking layers.
- iOS-specific assumptions must not enter the shared domain/controller/ranking layers.
- Platform differences belong behind adapters/plugins.
- Product behavior changes should remain separate from architecture-only changes where practical.
- Restaurant ranking remains shared TypeScript unless a future documented decision explicitly changes it.

## Shared architecture now established

`static data → RandomSeoulController → PlaceSearchService → shared ranking → AppStore → typed UI`

Platform adapters are intentionally thin:

- Web: Google Maps JavaScript Places + browser storage/map links
- Android: Places SDK for Android + Capacitor/Kotlin adapter (Phase 2)
- iOS: native Places adapter/Swift bridge (later)

The Android/iOS implementations should return common `PlaceCandidate` data and leave selection/ranking/product flow in shared TypeScript.

## Permanent modular visual assets

The stable visual shell has been promoted to source-controlled assets:

- `src/ui/styles.css`
- `src/ui/mobile-overrides.css`
- `src/ui/shell.html`

A small build generator currently packages those permanent assets into a TypeScript module for the existing modular composition root. It no longer reads or depends on stable `index.html`.

## Automated parity gates

CI currently validates:

- all unit tests
- TypeScript compilation
- Vite build
- stable root Web entry build
- modular Web entry build
- deterministic full browser flow with no Google API consumption
- exactly 3 recommendation cards in the deterministic fixture
- 2 km exclusion behavior
- fourth primary action resets to a newly drawn line
- Random Seoul branding
- responsive one-column restaurant layout in headless Chrome
- mobile touch-target override contract

## Phase 2 — Android shell

Status: **NEXT**

Planned branch: `feature/random-seoul-android`

Immediate Phase 2 sequence:

1. Add Capacitor configuration with app name `Random Seoul` and ID `io.github.momone3131.randomseoul`.
2. Generate Android project without moving shared domain/application logic into Kotlin.
3. Define the native place-search bridge contract matching `PlaceSearchService`.
4. Implement Places SDK for Android adapter in Kotlin.
5. Use a separate Android-restricted Google API key; never reuse the Web key.
6. Add native storage/preferences adapter only where needed; preserve shared state behavior.
7. Add native map/deep-link launcher, haptics, sharing, and Android back handling behind platform adapters.
8. Keep GPS/location permission absent unless a future feature explicitly requires it.
9. Add Android unit/build checks and GitHub Actions APK build.
10. Install debug APK on a real device and verify touch/back/map/restaurant flows.
11. Prepare release AAB only after debug validation.

See `docs/PROJECT_PLAN.md` and `docs/ARCHITECTURE.md` for the longer-term plan including iOS.

## Change log

### 2026-09-12

- Product name fixed as **Random Seoul**.
- Web confirmed as a permanent supported target.
- Cross-platform shared-core architecture adopted.
- Android-first / iOS-second rollout retained.
- Architecture and roadmap documentation established in repository.
- Vite/TypeScript/Vitest scaffold created.
- Shared data/domain/controller/ranking/state/storage boundaries extracted.
- Google Web Places isolated behind `PlaceSearchService`.
- 24-line / 36-food static data extracted and validated.
- Stable Web settings/history persistence contract preserved.
- Draw, restaurant, settings, and history UI rendering modularized.
- Stable 900 ms draw animation and keyboard modal behavior restored.
- Permanent modular CSS/DOM shell promoted and modular build decoupled from stable root `index.html`.
- Deterministic browser end-to-end test added; no Google quota is consumed by CI.
- Responsive Chrome smoke test exposed and fixed a late CSS override that had reduced mobile restaurant map buttons back to 38 px; final mobile override is now 44 px and full width.
- Phase 1 automated parity gates pass; next work is the Capacitor Android shell.
