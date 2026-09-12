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

Status: **IN PROGRESS**

Working branch: `refactor/random-seoul-core`

### Immediate tasks

- [x] Add Vite + TypeScript project scaffold
- [x] Preserve current single-file baseline by leaving `main/index.html` untouched during refactor
- [ ] Extract CSS from `index.html`
- [ ] Extract subway line data
- [ ] Extract food category/search data
- [x] Define shared domain types
- [x] Extract draw engine
- [x] Extract restaurant ranking function
- [x] Define `PlaceSearchService`
- [ ] Move Google Web Places implementation behind service boundary
- [ ] Extract state/storage layer
- [ ] Extract UI render modules
- [x] Add unit tests for draw/ranking
- [ ] Verify mobile/desktop web parity
- [x] Add GitHub Actions web build/test
- [ ] Merge only after parity verification

## Protected requirements

During this phase:

- `main` GitHub Pages must remain usable.
- Refactor branch must not break the deployed web version.
- No Android-specific business logic may move into shared domain code.
- No iOS-specific assumptions may be introduced.
- Product behavior changes must be separated from architecture-only changes where practical.

## Next implementation slice

1. Extract subway/food data from the single file.
2. Extract Google Web Places adapter while keeping current behavior.
3. Extract storage/state boundaries.
4. Move CSS and UI renderers.
5. Switch `index.html` from inline logic to module entrypoint only after the extracted modules are covered by tests.

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
- Unit tests added for draw and restaurant ranking behavior.
- CI workflow added for tests and web build.
