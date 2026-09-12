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

Status: **STARTING**

Working branch: `refactor/random-seoul-core`

### Immediate tasks

- [ ] Add Vite + TypeScript project scaffold
- [ ] Preserve current single-file baseline as reference fixture
- [ ] Extract CSS from `index.html`
- [ ] Extract subway line data
- [ ] Extract food category/search data
- [ ] Define shared domain types
- [ ] Extract draw engine
- [ ] Extract restaurant ranking function
- [ ] Define `PlaceSearchService`
- [ ] Move Google Web Places implementation behind service boundary
- [ ] Extract state/storage layer
- [ ] Extract UI render modules
- [ ] Add unit tests for draw/ranking
- [ ] Verify mobile/desktop web parity
- [ ] Add GitHub Actions web build/test
- [ ] Merge only after parity verification

## Protected requirements

During this phase:

- `main` GitHub Pages must remain usable.
- Refactor branch must not break the deployed web version.
- No Android-specific business logic may move into shared domain code.
- No iOS-specific assumptions may be introduced.
- Product behavior changes must be separated from architecture-only changes where practical.

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
