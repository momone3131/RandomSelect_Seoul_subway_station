# Random Seoul — Development Status

Last updated: 2026-09-18

라이브 Git 상태가 최우선입니다.

## Product / platform role

- **Android:** 현재 주 개발/배포 대상이자 앱 본체
- **Web:** 계속 배포되는 정식 지원 target + Android 공통 UX reference implementation
- **iOS:** Android 안정화 이후 shared core 기반 후속 지원

## Current flow

1. 노선 랜덤
2. 역 랜덤
3. 음식/주류 종목 랜덤
4. first-party 추천 명소 0~2개 즉시 표시
5. 일반 음식이면 `추천 식당 보기`, 주류 전용 종목이면 `추천 술집 보기`
6. 사용자 요청 시에만 Google Places live search
7. TOP 3 렌더 후 recommendation section으로 smooth scroll

추첨만으로 Places lookup을 자동 호출하지 않습니다.

## Food draw scope

Current total: **42종 = 기존 식사 36종 + 주류 전용 6종**.

주류 전용 종목은 “술을 같이 파는 음식점”이 아니라 **음주가 방문의 주목적인 업종**만 별도 분류합니다.

- 이자카야
- 와인바
- 칵테일바
- 수제맥주·펍
- 전통주·막걸리주점
- 위스키바

치킨, 삼겹살, 양꼬치 등 일반 음식 종목은 술을 판매하더라도 주류 전용으로 분류하지 않습니다.

Food settings:
- `전체 선택`
- `전체 해제`
- dynamic alcohol preset: 주류가 하나라도 선택된 상태에서는 `주류 제외`, 주류가 하나도 없으면 `주류 포함`
- `주류 제외`는 6종을 모두 제거
- `주류 포함`은 기존 선택을 보존하면서 6종을 모두 추가
- 화면의 음식 scope count는 실제 선택 개수에 맞춰 갱신

Persistence compatibility:
- 기존 36종이 모두 선택돼 있던 사용자는 과거의 “전체 선택” 의미를 보존해 42종 전체로 자동 확장
- 사용자가 일부 음식만 의도적으로 골라둔 경우에는 주류를 강제로 추가하지 않음

Alcohol recommendation search:
- same explicit-request flow / hard 2 km / max20 → TOP3 shared ranking
- alcohol category query는 `이자카야`, `와인바`, `칵테일바`, `수제맥주 펍`, `전통주 막걸리 주점`, `위스키바`
- candidate type gate is alcohol-oriented (`bar`, `night_club`, plus restaurant/food fallback for 이자카야·전통주점 등)
- alcohol draw에서는 CTA/title/copy가 `술집`/`가자!` 문맥으로 전환; 일반 음식은 기존 `식당`/`먹자!` 유지

## Main UI baseline

- passive palette: `#f5f4f0 / #fffdfa / #e9ebe7`
- active random target: lime + dark ink
- completed station: selected line-color subway-sign style
- visual progress strip hidden
- attraction prominence tier text hidden

## Attraction coverage

Status: **STATIC FIRST-PARTY / MAX 0–2 / FOUR PROMINENCE TIERS + ORTHOGONAL NIGHTSCAPE FEATURE**

Merge priority:

**base → station adjustments → extra → local → dedicated night-viewpoint layer → ID dedupe → max2 → tier/feature attachment**

Current surfaced prominence counts after the 2026-09-18 re-audit:
- Diamond 4
- Gold 25
- Silver 100
- Standard 291
- total unique surfaced attractions 420

Diamond fixed 4: 경복궁 / 국립중앙박물관 / 롯데월드타워 / 북촌한옥마을.

### Physical interchange consistency

Curated attractions are shared across line variants of the **same physical interchange station** before the normal layer merge.

- same-name physical interchanges resolve to one canonical result regardless of which line produced the draw
- known same-name non-interchanges stay separate: 2호선 신촌 vs 경의중앙선 신촌, 5호선 양평 vs 경의중앙선 양평
- differently named physical interchange alias is explicit: 4호선 `총신대입구(이수)` ↔ 7호선 `이수`
- physical-interchange fix baseline: 800 line/station outcomes = 391 with 0 attractions / 307 with 1 / 102 with 2
- final multi-pass zero-coverage re-audit: **262 with 0 / 431 with 1 / 107 with 2**
- overall draw-outcome attraction coverage: **67.3%**
- physical missing-station groups reduced from **346 to 237**
- unique surfaced attractions increased from **330 to 420**
- no forced fill: planned/unbuilt, generic neighborhood-only, or bus-dependent/far candidates remain uncurated


## Zero-coverage attraction re-audit — 2026-09-18

The audit did not rely only on tourism-map listings. Missing stations were repeatedly rechecked against municipal/cultural-tourism pages, map/transit proximity, markets, large parks/waterfronts, museums/cultural venues, campuses, specialized streets and hiking/viewpoint access.

Representative newly covered stations include 남영→민주화운동기념관, 창동→서울시립 사진미술관/서울로봇인공지능과학관, 오산대→물향기수목원, 금곡→홍유릉, 대성리→대성리 국민관광지, 원인재→원인재, 양천향교→양천향교/겸재정선미술관, 길음→서울성북미디어문화마루, 마포구청→마포농수산물시장, 사우→김포 장릉 and 발곡→의정부음악도서관.

Station names alone are never enough evidence. Examples intentionally still uncurated after research include 검단호수공원(park not yet a usable destination), 세종대왕릉역(royal tomb requires onward transit), 신둔도예촌(nearby pottery route is too dispersed for the current near-station rule), and 오남호수공원 from 오남역 where official access still requires a bus transfer.

## Nightscape — strict elevated-view definition

Nightscape is not a fifth tier. Definition:

> 높은 곳에서 도시 불빛·스카이라인을 내려다보는 것이 밤 방문의 주된 이유인 전망 목적지.

Current 12:
- N서울타워
- 낙산공원
- 응봉산 팔각정
- 달맞이봉공원
- 매봉산 팔각정
- 용왕산 스카이워크
- 삼성해맞이공원
- 용마산 스카이워크
- 용양봉저정공원
- 롯데월드타워
- 남한산성 서문 전망대
- 수원화성 서장대

DDP, 노들섬, 반포한강공원, 세빛섬, 석촌호수, 송도 센트럴파크, 광교호수공원, 라베니체는 일반 추천/기존 tier는 유지하지만 Nightscape에서는 제외합니다.

## Latest verified Web — alcohol-enabled release

Functional source head: `82960fbfcd9131709d7302ee3b3e5a991f8662d3`

- CI `35156095117` — **success**
- Web Release `35156095108` — **success**
- deployment commit `306b5e787b6bc7fd42c3905f65bfa5e7efea8040`
- deployment Pages `35156142207` — **success**
- public bundle: `assets/modular-DjJ7bZur.js`

The public bundle was directly fetched and checked for the strict 12-ID Nightscape set, 42 food categories, 6 alcohol IDs, dynamic `주류 포함/제외`, alcohol candidate filtering, and alcohol-aware recommendation copy.

## Latest verified Android — alcohol-enabled release

Branch: `feature/random-seoul-android`
PR: `#3 android: build Random Seoul native shell`
App id: `io.github.momone3131.randomseoul`

- source head: `219a392b203cebd67960c53f4a263f491da7bd2e`
- Android CI `35156192849` — **success**
- APK `random-seoul-latest.apk`
- size: `11,423,212` bytes
- SHA-256: `8ff7f1f16ccbd97218e7331dfd9360cf1bbb4dded05640def5158d06cc990891`

Direct download:
`https://github.com/momone3131/RandomSelect_Seoul_subway_station/releases/download/android-dev-latest/random-seoul-latest.apk`

## Durable visit history — Phase 1

Status: **IMPLEMENTED / VERIFIED WEB + ANDROID**

- recent draw history remains max12 and disposable
- new durable key: `random_seoul_visits_v1`
- history card CTA: 신규 `다녀왔어요` / 저장 후 disabled `발자취에 등록됨`
- station is mandatory
- drawn food category is optional and unchecked by default
- shown attractions are optional and multi-select, unchecked by default
- Google restaurant recommendation is not included
- optional visit date; new record defaults to today and can be cleared
- main 화면의 durable visit card 목록은 제거; 조회/수정/삭제는 발자취 노선도에서 수행
- clearing recent draw history explicitly leaves visits intact
- new draw-history items snapshot shown attraction IDs/names for later visit editing

Verification:
- Web CI `35339108030` — success
- Web Release `35339108075` — success
- Pages deployment — success
- Android CI `35339228627` — success
- Android fixed latest APK updated 2026-09-18, `11,433,508` bytes

Roadmap source: `VISIT_HISTORY_PLAN.md`.

## Visit footprint map — Phase 2

Status: **IMPLEMENTED / VERIFIED WEB + ANDROID**

- main에는 방문 기록이 하나 이상 있으면 compact `발자취 노선도 보기` CTA + count만 노출
- 한 노선씩 나열하지 않고 **수도권 전체 노선도 한 장**을 reference surface로 사용
- bundled public-domain SVG + generated static anchor table; footprint open 시 외부 지도 네트워크 호출 없음
- **24개 노선 / 800개 line×station mappings = 800/800 verified**
- durable `VisitRecord`를 physical station 기준으로 그룹화
- 환승역 line variants는 같은 marker, 신촌/양평 동명이역은 서로 다른 anchor
- `총신대입구(이수)` ↔ `이수`는 동일 anchor
- 의정부경전철 차량기지 임시승강장만 reference 밖 synthetic dashed terminal extension
- 방문 marker는 SVG scale과 분리된 screen-space overlay라 전체보기/확대 모두에서 고정 크기로 식별 가능
- 노선도 아래 `역명 · 최근 방문일` horizontal strip을 드래그/스크롤해 방문역 탐색
- 초기에는 상세를 숨기고 marker/strip 선택 시에만 방문일·당시 노선·실제 방문 음식/명소 history 표시
- selected detail에서 개별 방문기록 수정/삭제 가능; strip은 상세가 열린 상태에서도 계속 스크롤 가능
- marker/strip 선택 시 full map이나 marker DOM을 재렌더하지 않아 기존 모바일 tap/reposition 문제 제거
- drag / wheel zoom / pinch zoom / fit-all 지원
- 신규 방문 저장 toast는 `발자취 노선도에서 확인할 수 있어요`로 안내
- GPS/current-location permission 추가 없음

Reference/audit source: `FOOTPRINT_MAP_REFERENCE.md`.

Verification:
- full reference anchor audit: **800 / 800**
- physical interchange equivalence audit: success
- same-name non-interchange separation audit: success
- exact bundled-SVG label + coordinate audit for all 799 reference anchors: success
- adjacent reference-geometry sanity audit: success
- deterministic anchor regeneration / zero-diff gate: success
- Web PR #9 final CI `35352888242` — **success**
- source merge `08cf695bb8e29881777cbb3ac5aeca4b203894e3`
- Web deployment commit `a356ccf847a6496b26df9f673b94333263efc1af`
- deployed bundle `assets/modular-CQ1CWBmD.js` + root reference SVG directly verified

Next planned phases:
3. unvisited-first/exclude random modes
4. simple visit statistics

## Build / CI gates

Web: tests → Vite build → headless browser smoke → verified root promotion → Pages.

Android: shared tests → native Web build → Capacitor sync → Gradle `assembleDebug` → artifact → fixed `android-dev-latest` Release.

## Documentation continuity

- `PROJECT_CONTEXT.md`: fast recovery
- `STATUS.md`: current facts / verification
- `PROJECT_PLAN.md`: product intent / policy
- `VISIT_HISTORY_PLAN.md`: long-term visit loop roadmap
- `FOOTPRINT_MAP_REFERENCE.md`: full-network reference provenance / 800-anchor audit
- `ARCHITECTURE.md`: technical/data flow
- `ATTRACTION_CURATION.md`: attraction selection/map/tier/feature policy
- `ATTRACTION_TIER_AUDIT.md`: prominence audit evidence

Conflict priority: **actual code/Git > STATUS > ARCHITECTURE/PROJECT_PLAN > PROJECT_CONTEXT/README**.
