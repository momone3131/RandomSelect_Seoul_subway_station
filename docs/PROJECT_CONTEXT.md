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
- `VisitRecord` groups by physical station; multiple line variants/visits share one physical visit state
- 신촌/양평 same-name non-interchanges remain separate
- 총신대입구(이수) ↔ 이수 is one pin
- every subway line/station is shown as a schematic rail + node; visited nodes are larger/filled
- node detail shows visit count and date/line/confirmed food/confirmed attraction history
- node selection changes only selection/detail state, not the schematic DOM
- no map tiles, station-coordinate resolver, GPS/current-location permission or footprint network lookup
- Android back closes footprint/visit overlays before app navigation/exit

Next: Phase 3 unvisited-aware/excluded random → Phase 4 simple visit statistics.

Source: `docs/VISIT_HISTORY_PLAN.md`.

## 7. Latest verified snapshot

### Web footprint map
- Phase 2 PR #7 CI `35346526225` — success
- source merge `2484cc7b323ec27a8049d165d027ae19894249b4`
- deployment commit `ee493bdc4a6e875696d3c4984d352e644d30af53`
- deployed bundle `assets/modular-Buo-h1dI.js` directly checked for footprint UI, OSM tiles and physical-station grouping

### Android footprint map
- working branch `feature/random-seoul-android`
- working PR #3
- Phase 2 code head `a42458fd229322f10914d8f023a0b89286dd484c`
- fixed `android-dev-latest` advanced after shared tests → native Web build → Capacitor sync → Gradle assembleDebug → release publish

## 8. Source-of-truth docs

- `STATUS.md`: latest verified facts
- `ARCHITECTURE.md`: data flow/modules
- `PROJECT_PLAN.md`: product intent
- `VISIT_HISTORY_PLAN.md`: visit persistence / footprint roadmap
- `ATTRACTION_CURATION.md`: attraction rules
- `ATTRACTION_TIER_AUDIT.md`: prominence audit

Conflict priority: **actual code/Git > STATUS > ARCHITECTURE/PROJECT_PLAN > PROJECT_CONTEXT/README**.
