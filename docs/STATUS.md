# Random Seoul — Development Status

Last updated: 2026-09-15

이 문서는 실제 현재 개발 위치와 검증 결과를 기록합니다. 라이브 Git 상태가 최우선입니다.

## Product / platform role

- **Android:** 현재 주 개발/배포 대상이자 앱 본체
- **Web:** 계속 배포되는 정식 지원 target + Android 공통 UX reference implementation
- **iOS:** Android 안정화 이후 shared core 기반 후속 지원

## Public Web

Status: **DEPLOYED — MINIMAL NEUTRAL PALETTE / DYNAMIC STAGE PROMPTS / SUBWAY-SIGN RESULT LIVE**

Current completion flow:

1. 노선 랜덤
2. 역 랜덤
3. 음식 랜덤
4. 추천 명소 0~2개 즉시 표시
5. `추천 식당 보기`
6. 사용자 요청 시에만 Google Places 식당 검색
7. TOP 3 렌더 후 추천 식당 section으로 smooth scroll

Important behavior:

- 음식 선택만으로 restaurant lookup을 자동 호출하지 않음
- 음식 reveal과 네트워크 lookup 분리
- restaurant lookup 중 course-changing controls 잠금
- 실패 시 `추천 식당 다시 찾기`
- search 완료 전 빈 restaurant section으로 자동 scroll하지 않음

Latest verified Web:

- source/regression head: `394fc9188a669a63a45652e9cf018b76bdf06f4d`
- main CI run `34980301473` — **success**
- Web Release run `34980301797` — **success**
- deployment commit carrying the current bundle: `86a73df0f5d222268484aa02ddea3d0412c62c3f`
- public bundle: `assets/modular-nSZu7knQ.js`
- GitHub Pages run `34980299496` — **success**

The deployed bundle was directly checked for the minimal palette override and `.progress{display:none!important}` contract.

## Primary draw / visual UI

### Minimal passive palette

Passive surfaces were simplified to a three-neutral system while preserving the strong functional accents:

- app background: `#f5f4f0`
- paper/content surface: `#fffdfa`
- structural surface: `#e9ebe7`
- active random target remains lime with dark ink
- completed station sign still uses the selected subway-line color
- line badges still use their real line colors

The following now share the same structural neutral surface:

- main draw shell
- station list panel
- recent-course cards
- restaurant section
- attraction section
- selection-choice surfaces

Completed/passive line, station, food, restaurant, attraction and station-list cards use the same paper tone rather than separate green/blue/peach/mauve surfaces.

Extra utility color tints were also neutralized:

- station map buttons
- copy button
- restaurant map links
- restaurant metadata chips
- hero underline now reuses the same lime accent instead of adding another highlight hue

### Progress strip removed

The visual `01 노선 / 02 역 / 03 음식` strip is hidden. Stage is already communicated by:

- the active lime draw card
- stage-aware hero headline
- the selected line/station/food results

The underlying state/ARIA logic remains intact; only the redundant visual strip is removed.

### Dynamic hero prompt

The main headline follows the draw state:

- initial: `어디로 가볼까?`
- line selected: `어느 역에서 내릴까?`
- station selected: `식사도 해야지?`
- food selected: `이 코스로 가자!`

The headline deliberately avoids `오늘` or other time-specific wording.

### In-card redraw controls

- completed line/station/food cards keep top-right refresh controls
- redraw semantics remain line → downstream reset, station → food reset, food → food only
- no icon background/border/chip
- actual hit area remains `36 × 36 px`
- refresh glyph is **27 × 27 px** with **2.7 stroke width**

### Subway-sign station result

A completed station uses a Seoul-subway-sign-inspired surface:

- selected line color drives the thick rounded frame and circular ordinal badge
- white sign interior
- circular badge contains the app's ordinal within the selected line list, not a fabricated official station code
- badge + station name are vertically centered
- station-name scale: desktop `28px`, mobile `23px`, small phone `21px`
- long station names continue using responsive reduced sizes to stay inside the card

### Food pending state

- pending copy: `뭐 먹을까?`
- before food stage: faint neutral text
- active food stage: full-strength dark text on the lime target card
- centered in the existing food-card footprint
- pending emoji hidden
- no card-height increase

### Utility row

After a station is selected:

**복사 / 네이버지도 / 구글지도**

- three equal columns in one row
- old lower secondary-action row hidden
- mobile button height remains usable

### Copy behavior

- station + food: `신설동에서 떡볶이 먹자!` style
- station only: `신설동 가자!` style
- line name/number omitted
- ordinal omitted
- food examples omitted
- recommended restaurant name is never inserted

## Draw feedback

- next-result card itself is the primary draw target
- press/hold physically depresses card
- settled result: ~900 ms, max `translateY(-12px) scale(1.09)` + reveal ring
- Android native haptic event remains
- reduced-motion skips visual reveal motion

## Attraction-first / restaurant-on-demand layout

- attraction section directly follows `.panels`
- max 2 compact attraction cards; 0 means section hidden
- `추천 식당 보기` follows attractions
- restaurant lookup is opt-in
- completed restaurant results auto-scroll into view

## Restaurant recommendation policy

- provider: Google Places live candidate data
- hard radius: 2 km
- max search candidates: 20
- TOP 3 shared ranking
- Bayesian rating 55%
- review volume log 25%
- Google relevance 15%
- distance 5%
- Google-derived restaurant results are not persisted as a reusable own DB

## Curated nearby attractions

- static first-party curated data
- max 0–2, no forced fill
- no Google attraction Text Search
- browse/stay-value editorial threshold
- `mapQuery` is a self-contained map target; station name is not automatically appended

Representative map-target fixes remain:

- 검암 → `경인아라뱃길 시천가람터` / `시천가람터 인천광역시 서구 시천동 158-11`
- vague 오목교·목동 상권 candidate removed

## Static station centers

- `station-coordinates.ts` static first
- missing stations only → Google fallback
- fallback coordinate cache: 30 days

## Android app

Status: **ACTIVE — SAME MINIMAL-PALETTE UX IN LATEST DEV APK**

Branch: `feature/random-seoul-android`
PR: `#3 android: build Random Seoul native shell`
App id: `io.github.momone3131.randomseoul`

Latest verified Android:

- branch/source head: `934b984e55588c777678a17b75861686bf2e748a`
- Android CI run `34980384360` — **success**
- shared tests → native Web build → Capacitor sync → Gradle APK → artifact → fixed latest Release all passed
- asset: `random-seoul-latest.apk`
- size: `11,413,240` bytes
- SHA-256: `647e86ed5a7c73f0271a6898ed1e5d73c5021073d5600394a3b587dd69204d2f`

Fixed direct download:
`https://github.com/momone3131/RandomSelect_Seoul_subway_station/releases/download/android-dev-latest/random-seoul-latest.apk`

## Implementation ownership

Key files:

- `src/application/random-seoul-controller.ts`
  - shared draw/reset semantics
  - separate `loadRecommendations()`
- `src/main.ts`
  - restaurant request lifecycle
  - conversational copy text
  - utility action handlers
- `src/ui/draw-view.ts`
  - stage-aware hero headline
  - line/station/food rendering
  - in-card redraw controls
  - food pending prompt
  - copy reparent into map action row
- `src/ui/subway-sign-overrides.css`
  - station-sign alignment/type sizing
  - refresh icon sizing
  - food waiting/ready prompt treatment
  - compact 3-column utility row
- `src/ui/minimal-palette-overrides.css`
  - final passive palette simplification
  - progress strip removal
  - neutral card/section/map-control surfaces
- `src/ui/attraction-view.ts`
  - compact attraction-first section
- `src/ui/draw-animation.ts`
  - rolling preview + settled reveal
- `tests/responsive-contract.test.ts`
  - current visual/UX contract

## Build / CI gates

### Web

`web-release.yml` runs tests → Vite build → headless browser smoke → verified root promotion → Pages deployment.

### Android

shared tests → native Web build → Capacitor sync → Gradle `assembleDebug` → Actions artifact → fixed `android-dev-latest` Release.

## Documentation continuity

Repository docs are durable project memory.

- `PROJECT_CONTEXT.md`: fast recovery
- `STATUS.md`: current facts/verification
- `PROJECT_PLAN.md`: product/policy
- `ARCHITECTURE.md`: technical/data flow
- `ATTRACTION_CURATION.md`: attraction policy/map targets

Conflict priority: **actual code/Git > STATUS > ARCHITECTURE/PROJECT_PLAN > PROJECT_CONTEXT/README**.

## Change log — 2026-09-15

- Kept active random-target lime treatment and line-colored completed station sign.
- Reduced passive UI to three neutral tones (`bg / paper / surface`).
- Unified main shell, station list, history, attraction and restaurant section backgrounds.
- Removed separate line/station/food pastel completed-state backgrounds in favor of one paper surface.
- Neutralized map/copy/restaurant utility tints and reused lime for the hero underline.
- Hid the redundant `01 노선 / 02 역 / 03 음식` visual progress strip.
- Preserved dynamic headline, subway-sign station result, centered food prompt, compact utility row and conversational copy behavior.
- Web CI/Web Release/Pages and Android latest dev APK verified for this palette simplification.
