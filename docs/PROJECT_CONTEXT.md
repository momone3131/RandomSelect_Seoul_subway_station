# Random Seoul — Project Context / Handoff

Last updated: 2026-09-19

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
- Silver 100
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

Phase 1 + Phase 2 + Phase 4 are implemented and verified on Web + Android. Phase 3 is intentionally skipped. Main visit UX is intentionally minimal: one hero state action plus two quiet utilities below the station list.

Phase 1:
- visits are persisted separately from recent draw history
- first registration is available from both recent-history `발자취 등록하기` and completed-course hero `등록`
- completed-course hero action sits to the right of `이 코스로 가자!`; it uses the same lime/dark-border interaction language as `새 코스` at a compact size, then becomes `발자취` after save and opens the footprint map
- station is always saved
- drawn food is user-confirmed optional
- shown attractions are user-confirmed optional multi-select
- optional visit date
- edit/delete durable visit list
- clearing recent draw history leaves visits untouched

Phase 2:
- no separate main 발자취 hub/module; only quiet `발자취 노선도` + `방문 통계` buttons below the station-list control
- `다녀온 곳 → 발자취 노선도`
- bundled public-domain **수도권 전체 노선도 한 장** 위에 방문 physical station marker overlay
- 24 lines / 800 line×station reference anchors, 800/800 automated audit
- physical interchange variants share an anchor; 신촌/양평 non-interchanges remain separate
- 총신대입구(이수) ↔ 이수 shares one physical anchor
- visit markers stay screen-sized and visible at full-map fit and zoomed views
- horizontal `역명 · 최근 방문일` strip remains scrollable under the map
- no detail is shown on open; marker or strip selection opens visit count/date/line/confirmed food/attraction detail
- selected detail owns per-record edit/delete; main page no longer shows durable visit cards
- confirmed visited attractions in detail reuse current Diamond/Gold/Silver/Standard rim styling and Nightscape interior; station markers remain visit-only
- footprint panel has one stable size before/after selection: map height never changes, detail space is reserved from open, idle copy is `역을 누르면 상세·수정`, and header/close stays visible
- screenshot-driven polish: detail no longer flex-grows into blank space; modal sizes to content with viewport cap and has more comfortable iPhone top spacing
- pan / wheel zoom / pinch zoom / fit-all
- station selection changes only marker/strip state + detail, not the map DOM
- recent history is only for first `발자취 등록하기` registration; saved item becomes `발자취에 등록됨`
- no map provider/tile lookup, station-coordinate resolver, GPS/current-location permission
- one documented synthetic exception: 의정부경전철 차량기지 임시승강장

Phase 3 decision:
- unvisited-first / visited-station exclusion modes are not being built
- repeated draws remain user-controlled via the existing redraw flow; visit history never changes random probability

Phase 4:
- station-list 아래 quiet utility row has sibling `발자취 노선도` + `방문 통계` buttons
- statistics are derived only from durable `VisitRecord`
- physical-station overall coverage dedupes interchanges
- **per-line progress credits every line belonging to a visited interchange**; e.g. a Line 1 신도림 visit also counts 신도림 on Line 2
- confirmed food/alcohol and attractions are counted separately from mere draw candidates
- attraction visit stats include current Diamond / Gold / Silver / Standard breakdown with unique places + revisit-inclusive counts
- no statistics persistence/schema is added; edits/deletes recompute immediately

Source: `docs/VISIT_HISTORY_PLAN.md`.

## 7. Latest verified snapshot

### Compact statistics export — Web
- PR #29 CI `35425218471` — success
- source merge `feef6eed043d881f39d3d8446ecfd50a50133f33`
- main CI `35425264337` / Web Release `35425264330` — success
- deployment commit `98c9468974295d63e4b33ff5e90d43a21cc6c402`
- bundle `assets/modular-CuQ0RdaE.js`
- live statistics modal stays unchanged
- saved image uses a 720px compact export: metric 4-col / tier 4-col / line progress 2-col

### Compact statistics export — Android
- branch `feature/random-seoul-android`, PR #3
- source head `a7aa21724f19ebe56f7dd2a4831206bdce12928a`
- Android CI `35425286104` — success
- native save bridge remains `Pictures/Random Seoul` on Android 10+
- shared export layout includes the compact 720px / 4-4-2 grid rules
- fixed `android-dev-latest` APK republished, size `11,537,461` bytes

### Visit/statistics invariants
- recent-history `발자취 등록하기` remains
- hero `등록` reuses the same VisitRecord/source-history contract
- same source course is not duplicated
- physical interchange equality / 신촌·양평 separation / 이수 alias preserved
- 1호선 신도림 visit credits both 1호선 and 2호선 progress
- no persistence schema or GPS/location permission change

## 8. Source-of-truth docs

- `STATUS.md`: latest verified facts
- `ARCHITECTURE.md`: data flow/modules
- `PROJECT_PLAN.md`: product intent
- `VISIT_HISTORY_PLAN.md`: visit persistence / footprint roadmap
- `FOOTPRINT_MAP_REFERENCE.md`: full-network reference provenance / 800-anchor audit
- `ATTRACTION_CURATION.md`: attraction rules
- `ATTRACTION_TIER_AUDIT.md`: prominence audit

Conflict priority: **actual code/Git > STATUS > ARCHITECTURE/PROJECT_PLAN > PROJECT_CONTEXT/README**.
