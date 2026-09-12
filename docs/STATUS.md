# Random Seoul — Development Status

Last updated: 2026-09-12

이 문서는 현재 진행 위치와 다음 행동을 기록합니다. 구현이 진행될 때마다 갱신합니다.

## Current stable baseline

- Branch: `main`
- Deployment: GitHub Pages
- Source form: single `index.html`
- Brand transition: NEXT STOP → **Random Seoul**
- Core flow: line → station → food → restaurant recommendations
- Main button after food: start a new course from line draw
- Partial redraw buttons: line / station / food
- Restaurant provider: Google Places Web
- Restaurant hard distance limit: 2 km
- Ranking: Bayesian rating 55% + log review count 25% + relevance 15% + distance 5%
- Mobile restaurant cards: vertical single-column layout

## Current phase

### Phase 1 — Modular web refactor

Status: **IN PROGRESS — modular Web boots successfully**

Working branch: `refactor/random-seoul-core`
Working PR: `#2 refactor: modularize Random Seoul shared core`

### Immediate tasks

- [x] Add Vite + TypeScript project scaffold
- [x] Preserve current single-file baseline by leaving `main/index.html` untouched during refactor
- [~] Extract CSS from `index.html` — exact legacy CSS is generated through a temporary migration bridge; permanent `src/ui/styles.css` promotion remains
- [x] Extract subway line data
- [x] Extract food category/search data
- [x] Define shared domain types
- [x] Extract draw engine
- [x] Extract restaurant ranking function
- [x] Extract station resolver / line-token matching
- [x] Define `PlaceSearchService`
- [x] Move Google Web Places implementation behind service boundary
- [x] Extract state/storage boundaries
- [x] Extract 30-day station coordinate cache behind storage boundary
- [x] Extract draw / restaurant / settings / history UI render modules
- [x] Extract cross-platform application controller
- [x] Preserve stable Web settings/history storage format during migration
- [x] Add unit tests for draw/ranking/data/station resolution/cache/controller/persistence
- [x] Add isolated `modular.html` entry alongside stable `index.html`
- [x] Add `src/main.ts` Web composition root
- [x] Add GitHub Actions web build/test
- [x] Add headless-Chrome boot smoke test for `modular.html`
- [ ] Add interactive browser smoke flow (line → station → food → restaurants → new course)
- [ ] Match legacy draw/reveal animation behavior
- [ ] Verify mobile/desktop visual parity
- [ ] Promote generated legacy CSS/shell into permanent modular assets
- [ ] Merge only after parity verification

## Protected requirements

During this phase:

- `main` GitHub Pages must remain usable.
- Refactor branch must not break the deployed web version.
- No Android-specific business logic may move into shared domain code.
- No iOS-specific assumptions may be introduced.
- Product behavior changes must be separated from architecture-only changes where practical.
- Web remains a permanent supported target after Android/iOS launch.

## Current architecture slice

The new modular Web path now composes:

`static data → shared controller → PlaceSearchService → Google Web adapter → shared ranking → AppStore → typed UI renderers`

The same controller/ranking/data/state modules are intended to be embedded unchanged in Android/iOS. Native platform code will replace only adapters such as Places, storage, map launch, sharing, haptics, and back navigation.

## Migration bridge

To reduce parity risk, `scripts/extract-legacy-shell.mjs` temporarily reads the stable `index.html` during build and generates the exact legacy CSS/DOM shell for `modular.html`.

This bridge is temporary. After visual/behavioral parity is proven, the generated CSS and shell will be promoted into normal source modules and the legacy extraction dependency removed.

## Next implementation slice

1. Add deterministic browser self-test mode with an in-memory Places adapter so CI can exercise the complete user flow without consuming Google API calls.
2. Extend headless-Chrome smoke test to verify line → station → food → TOP 3 rendering → full restart.
3. Restore the stable draw/reveal animation semantics in the modular UI.
4. Verify responsive/mobile card layout and settings modal behavior in browser automation.
5. Promote legacy CSS/markup from migration bridge into permanent modular source files.
6. Only then consider Phase 1 parity complete.

## Next phase

After Web parity is confirmed:

**Phase 2 — Capacitor Android shell**

See `docs/PROJECT_PLAN.md` for the full sequence.

## Change log

### 2026-09-12

- Product name fixed as **Random Seoul**.
- Web is confirmed as a permanent supported target, not a disposable prototype.
- Cross-platform shared-core architecture adopted.
- Android-first / iOS-second rollout retained.
- Architecture and roadmap documentation established in repository.
- Vite/TypeScript/Vitest scaffold added on the refactor branch.
- Shared domain types, deterministic draw engine, platform-neutral place-search boundary, and restaurant-ranking engine extracted.
- Full 24-line subway dataset and 36-food dataset extracted from the stable single-file app.
- Food display labels and Google search queries are now explicit static data rather than inline script literals.
- Shared station resolver and line search vocabulary extracted.
- Google Maps JavaScript Places implementation moved behind `PlaceSearchService` as a Web-only adapter.
- State store, storage interface, browser storage adapter, persistence compatibility layer, and 30-day station coordinate cache extracted.
- Shared `RandomSeoulController` now owns line/station/food/full-restart and restaurant orchestration.
- Draw, restaurant, settings, and history DOM rendering moved into typed UI modules.
- Build-time legacy-shell migration bridge and isolated `modular.html` added; stable root `index.html` remains untouched.
- Unit tests cover draw, ranking, static-data integrity, station resolution/cache, controller flow, and stable storage compatibility.
- CI builds both stable and modular Web entries.
- Headless Chrome successfully booted the modular page and verified `RANDOM SEOUL`, `노선 뽑기`, and `data-app-ready=true`.
