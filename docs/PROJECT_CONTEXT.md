# Random Seoul — Project Context / Handoff

Last updated: 2026-09-18

새 채팅/개발 세션은 **live GitHub → STATUS → ARCHITECTURE/PROJECT_PLAN → 이 문서** 순으로 최신성을 확인합니다.

## 1. Product

Random Seoul은 서울/수도권에서 `노선 → 역 → 음식/주류 종목`을 랜덤으로 정하고, 역 주변 first-party 추천 명소 0~2곳을 즉시 보여주는 외출 앱입니다.

추천 장소 검색은 추첨과 분리되어 있습니다. 일반 음식은 `추천 식당 보기`, 주류 전용 종목은 `추천 술집 보기`를 사용자가 눌렀을 때만 Google Places live 후보를 조회합니다. Hard radius 2 km, max20 후보를 shared ranking으로 TOP3까지 줄입니다.

## 2. Platform roles

- Android: 현재 주 개발/배포 target, branch `feature/random-seoul-android`, app id `io.github.momone3131.randomseoul`
- Web: `main`에서 계속 배포되는 정식 지원 target + 공통 UX reference
- iOS: Android 안정화 이후 shared core 재사용 예정

## 3. Food / alcohol model

Food draw total: **42 categories**.

- 기존 meal-oriented categories: 36
- alcohol-primary categories: 6
  - 이자카야
  - 와인바
  - 칵테일바
  - 수제맥주·펍
  - 전통주·막걸리주점
  - 위스키바

Source:
- `src/data/food-categories.ts`
- `src/data/food-category-features.ts`

Alcohol-primary means drinking itself is a primary destination purpose. Chicken, pork/beef grill, lamb skewers etc. are not alcohol categories merely because they sell alcohol.

Food settings has a dynamic `주류 제외 / 주류 포함` preset:
- if any alcohol ID is selected → shows `주류 제외`, removes all 6
- if none are selected → shows `주류 포함`, adds all 6 while preserving existing selections
- `전체 선택 / 전체 해제` remain

Persistence migration:
- previous exact full-36 selection migrates to full-42
- custom/narrow saved food selections are preserved without automatic alcohol injection

Alcohol search uses the same explicit lookup/ranking flow but uses an alcohol-oriented candidate type gate. UI copy switches to `추천 술집 ...` and copy result uses `${역}에서 ${주류종목} 가자!` instead of `먹자!`.

## 4. Attraction architecture

Attractions are static first-party curation, max0–2, no live attraction Text Search.

Merge priority:

**base → station adjustments → extra → local → night-viewpoints → ID dedupe → max2 → tier/feature attachment**

The `night-viewpoints` layer is last so it can fill a spare slot without pushing out an established stronger recommendation.

Physical interchange handling:
- same physical station shares one curated result across all line variants
- same-name non-interchanges `신촌` and `양평` remain separate
- `총신대입구(이수)` / `이수` is an explicit alias interchange
- source: `src/data/station-equivalence.ts`


Current prominence:
- Diamond 4
- Gold 25
- Silver 88
- remaining surfaced IDs Standard

Diamond fixed: 경복궁 / 국립중앙박물관 / 롯데월드타워 / 북촌한옥마을.

### Zero-coverage re-audit (2026-09-18)

Missing stations were re-researched using map/transit proximity plus municipal tourism/cultural sources, including markets, parks, waterfronts, museums, specialized streets and trailheads rather than tourism lists alone.

Current coverage after audit:
- 800 line/station outcomes: 262 zero / 431 one / 107 two
- 67.3% of draw outcomes have at least one curated attraction
- 237 physical station groups remain uncurated
- 420 unique surfaced attractions: Diamond 4 / Gold 25 / Silver 100 / Standard 291

Planned/unbuilt, generic neighborhood-only, or too-distant/onward-transit candidates remain intentionally excluded.

## 5. Nightscape feature

Nightscape is independent from prominence, not a fifth tier.

Definition: **elevated destination where looking over city lights after dark is itself a main reason to visit.**

Current 12:
N서울타워 / 낙산공원 / 응봉산 팔각정 / 달맞이봉공원 / 매봉산 팔각정 / 용왕산 스카이워크 / 삼성해맞이공원 / 용마산 스카이워크 / 용양봉저정공원 / 롯데월드타워 / 남한산성 서문 전망대 / 수원화성 서장대.

DDP, 노들섬, 반포한강공원, 세빛섬, 석촌호수, 송도 센트럴파크, 광교호수공원, 라베니체 are not Nightscape, while their ordinary attraction recommendation/tier remains.

Nightscape changes the card interior to dark navy/indigo/purple night sky; prominence tier still owns the outer border/effect.

## 6. Durable visit loop

Phase 1 + Phase 2 are implemented and verified on Web + Android.

Phase 1:
- visits are persisted separately from recent draw history
- station is always saved
- drawn food is user-confirmed optional
- shown attractions are user-confirmed optional multi-select
- optional visit date
- edit/delete durable visit list
- clearing recent draw history leaves visits untouched

Phase 2:
- `다녀온 곳 → 발자취 노선도`
- bundled public-domain **수도권 전체 노선도 한 장** 위에 방문 physical station marker overlay
- 24 lines / 800 line×station reference anchors, 800/800 automated audit
- physical interchange variants share an anchor; 신촌/양평 non-interchanges remain separate
- 총신대입구(이수) ↔ 이수 shares one physical anchor
- visit markers stay screen-sized and visible at full-map fit and zoomed views
- horizontal `역명 · 최근 방문일` strip remains scrollable under the map
- no detail is shown on open; marker or strip selection opens visit count/date/line/confirmed food/attraction detail
- selected detail owns per-record edit/delete; main page no longer shows durable visit cards
- selected detail uses a viewport-safe `detail-open` layout: line badge + station + visit count share one row, map height contracts/refits, header/close stays visible
- pan / wheel zoom / pinch zoom / fit-all
- station selection changes only marker/strip state + detail, not the map DOM
- recent history is only for first `다녀왔어요` registration; saved item becomes `발자취에 등록됨`
- no map provider/tile lookup, station-coordinate resolver, GPS/current-location permission
- one documented synthetic exception: 의정부경전철 차량기지 임시승강장

Next: Phase 3 unvisited-aware/excluded random → Phase 4 simple visit statistics.

Source: `docs/VISIT_HISTORY_PLAN.md`.

## 7. Latest verified snapshot

### Web full-network footprint
- PR #10 visit-history hub CI `35356470654` — success
- current source merge `bdf9326584648786e7679389e66c931a09c265d8`
- current deployment commit `526f3ab6431cbd2481546a12fce040d78beeb3ba`
- deployed bundle `assets/modular-_UoS7_f0.js`
- visited markers remain screen-sized at fit-all/zoom
- horizontal visit strip + explicit detail selection + footprint-only edit/delete verified in deployed bundle
- main durable cards removed; recent-history saved state is registration-only
- Android fixed `android-dev-latest` now matches the visit-hub footprint view, visit/main UI, styles and contract tests
- native Vite uses the shared `public/` directory so the full-network SVG ships in Android

### Mapping verification
- app outcomes: 800
- generated anchors: 800
- 799 anchors match the exact station label + coordinate in the bundled reference SVG
- 1 documented synthetic exception: 의정부경전철 차량기지 임시승강장
- physical interchange equality / 신촌·양평 separation / adjacent geometry sanity: all passed
- deterministic regeneration zero-diff gate: passed

### Android full-network footprint
- working branch `feature/random-seoul-android`, PR #3
- fixed `android-dev-latest` has the full-network footprint view, 800-anchor table, bundled reference SVG and exact SVG-anchor audit test
- Android build/release workflow publishes only after shared tests → native Web build → Capacitor sync → Gradle assembleDebug

## 8. Source-of-truth docs

- `STATUS.md`: latest verified facts
- `ARCHITECTURE.md`: data flow/modules
- `PROJECT_PLAN.md`: product intent
- `VISIT_HISTORY_PLAN.md`: visit persistence / footprint roadmap
- `FOOTPRINT_MAP_REFERENCE.md`: full-network reference provenance / 800-anchor audit
- `ATTRACTION_CURATION.md`: attraction rules
- `ATTRACTION_TIER_AUDIT.md`: prominence audit

Conflict priority: **actual code/Git > STATUS > ARCHITECTURE/PROJECT_PLAN > PROJECT_CONTEXT/README**.
