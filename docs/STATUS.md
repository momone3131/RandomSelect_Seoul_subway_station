# Random Seoul — Development Status

Last updated: 2026-09-15

이 문서는 실제 현재 개발 위치와 검증 결과를 기록합니다. 라이브 Git 상태가 최우선입니다.

## Product / platform role

- **Android:** 현재 주 개발/배포 대상이자 앱 본체
- **Web:** 계속 배포되는 정식 지원 target + Android 공통 UX reference implementation
- **iOS:** Android 안정화 이후 shared core 기반 후속 지원

## Public Web

Status: **DEPLOYED — RESULT-FIRST / ON-DEMAND RESTAURANT FLOW + IN-CARD REDRAW + SUBWAY-SIGN STATION RESULT LIVE**

Current completion flow:

1. 노선 랜덤
2. 역 랜덤
3. 음식 랜덤
4. **추천 명소 0~2개 즉시 표시**
5. **`추천 식당 보기`** CTA 표시
6. CTA 탭 시에만 Google Places 식당 검색
7. TOP 3 렌더 완료 후 추천 식당 section으로 smooth scroll

Important behavior:

- 음식 선택 완료만으로 Google restaurant candidate lookup을 호출하지 않음
- 음식 reveal은 네트워크 지연과 분리됨
- 사용자가 식당 추천을 원하지 않으면 Places 후보 검색을 생략 가능
- restaurant lookup 중에는 course-changing controls를 잠시 막아 stale result/state race를 방지
- 실패 시 CTA가 `추천 식당 다시 찾기`로 복구
- search가 끝나기 전에 빈 restaurant section으로 강제 scroll하지 않음

Latest verified Web:

- source/regression head: `a55e20cfb3f67e18205dd9b3a030476fe0459caa`
- main CI run `34973302421` — **success**
- Web Release run `34973302381` — **success**
- deployment commit: `217125018a347dd708a2893cb7600e305b5cd022`
- public bundle: `assets/modular-ChK-hdZi.js`
- GitHub Pages run `34973314283` — **success**

The deployed bundle was directly checked for the current UI contract, including the larger redraw glyph CSS, line-color station-sign rules, and food pending `?` rendering.

Browser self-test verifies:

- line → station → food completes
- food completion leaves `recommendations.length === 0`
- explicit restaurant request then renders exactly 3 recommendations
- 2 km restaurant filter still holds
- full restart still works

## Primary draw / visual UI

Status: **COMPACT PASTEL / LOW-CHROME UI + IN-CARD REDRAW + SUBWAY-SIGN STATION RESULT LIVE**

Current main interaction:

- next result card itself is the primary draw target
- `노선 / 역 / 음식` labels only
- explanatory copy largely hidden
- completed course returns main CTA to `새 코스`
- previously selected stages can be redrawn directly from their own cards
- once a station has been selected, the waiting food card shows a clear `?` cue without increasing the food-card height

### In-card redraw controls

The old text redraw actions under the main CTA were replaced by subtle circular-arrow glyph controls inside completed cards.

- completed **노선** card → top-right refresh glyph → redraw line and invalidate downstream station/food
- completed **역** card → top-right refresh glyph → redraw station and invalidate downstream food
- completed **음식** card → top-right refresh glyph → redraw food only
- each control appears as soon as that stage has a committed result, including intermediate states such as “food is next but user wants to redraw line/station first”
- redraw keeps the existing controller reset semantics, so stale attractions/recommendations are cleared with upstream changes
- redraw controls reuse the existing buttons/handlers rather than duplicating action logic
- visible treatment remains icon-only: **no separate background, no border, no chip/pill**
- actual button hit area remains `36 × 36 px`
- refresh SVG is now visually stronger at **24 × 24 px** with **2.4 stroke width**
- line/station/food glyph colors remain darker same-family tones so they are discoverable without becoming a visual focal point
- each icon-only button keeps an accessible Korean `aria-label`
- lower secondary area now only carries non-redraw actions such as copy when applicable

### Subway-sign station result

A completed station is styled as a compact Seoul-subway-sign-inspired result rather than a generic pastel card.

- the selected line color is passed into the station card as `--station-line`
- completed station surface uses a white interior with a thick rounded line-color frame
- left circular badge uses the same line color
- the number inside the circle is the app's **ordinal within the selected line list** (“몇 번째 역”), not a fabricated official station code
- station name is large, bold, dark, and placed beside the circle
- responsive sizes preserve the existing card footprint rather than making the result area taller
- station-card redraw glyph follows the line color in a darker blend
- this treatment intentionally borrows the visual grammar of real subway station signage without reproducing one operator's exact sign asset

### Food pending cue

When a station is already selected but food has not yet been drawn:

- the food result area displays `?`
- the question mark uses the existing food-card space (`min-height: 0` on the cue itself)
- the food panel's existing mobile min-height remains unchanged
- once food is selected, the normal emoji/category result replaces the cue

Visual system:

- body: warm cream
- line: pastel green
- station waiting state: pastel blue
- completed station: white subway-sign surface framed in the selected line color
- food: pastel peach
- attraction: compact pastel mauve surface
- ordinary card outlines largely removed
- active next-draw card alone keeps strong dark outline + hard short shadow
- small type raised where practical rather than shrinking everything
- mobile touch targets remain usable

Draw feedback:

- press/hold: card physically depresses, shadow collapses
- settled result: about **900 ms**, max `translateY(-12px) scale(1.09)` with visible pastel-gold ring and short held peak
- Android native haptic event remains
- `prefers-reduced-motion` skips visual reveal motion

## Attraction-first result layout

Status: **LIVE**

`src/ui/attraction-view.ts` places attraction section directly after `.panels`.

Mobile behavior:

- title: `추천 명소`
- max 2 compact cards
- 2 attractions → 2-column grid
- 1 attraction → single column
- 0 attractions → section hidden entirely
- compact cards prioritize name/category/`지도 보기`
- long meta/note treatment is omitted from the compact first-result surface

Immediately after this section is the full-width **`추천 식당 보기`** CTA.

This layout intentionally makes the first completed mobile view feel like:

**랜덤 결과 → 명소 → 식당 보기 선택**

rather than making live restaurant cards part of the mandatory completion path.

## Restaurant recommendation policy

Status: **LIVE / USER-TRIGGERED**

- provider: Google Places live candidate data
- trigger: only after `추천 식당 보기`
- hard radius: 2 km
- max search candidates: 20
- shared ranking TOP 3

Weights:

- Bayesian rating 55%
- review volume log 25%
- Google relevance 15%
- distance 5%

Persistence:

- recommendation TOP 3 not stored as reusable restaurant DB
- Google rating/review values not harvested into long-term DB

`RandomSeoulController.drawFoodResult()` owns food selection only. `loadRecommendations()` owns restaurant lookup/ranking as a separate operation.

Any line/station/food redraw changes the current restaurant key, resetting transient restaurant loading/complete/error state so a previous recommendation set cannot leak into a newly redrawn course.

## Curated nearby attractions

Status: **LIVE / STATIC FIRST-PARTY / MAX 0–2**

- no Google attraction Text Search
- editorial curation, not review-score threshold
- browse/stay-value threshold
- major malls/IKEA/Starfield/outlets/department stores can qualify when the facility itself is an outing destination
- weak ordinary neighborhood facilities excluded
- no forced fill

Data:

- `curated-attractions-base.ts`
- `curated-attractions-extra.ts`
- `curated-attractions.ts` merge/dedupe/max2

### Attraction map-target integrity

- no dedicated attraction lat/lng
- static `mapQuery` is the map target
- UI never automatically appends station name
- ambiguous targets are disambiguated by city/district/road/address
- vague candidates can be removed rather than showing misleading pins

Representative fixes remain:

- 검암 → `경인아라뱃길 시천가람터` / `시천가람터 인천광역시 서구 시천동 158-11`
- vague 오목교·목동 상권 candidate removed

## Static station centers

Status: **STATIC-FIRST ACTIVE**

- `station-coordinates.ts` first
- missing stations only → Google fallback
- fallback coordinate cache: 30 days
- station center is for restaurant search/distance; attraction mapQuery is separate

## Android app

Status: **ACTIVE — SUBWAY-SIGN RESULT / FOOD CUE / ON-DEMAND RESTAURANT FLOW IN LATEST DEV APK**

Branch: `feature/random-seoul-android`
PR: `#3 android: build Random Seoul native shell`
App id: `io.github.momone3131.randomseoul`

Implemented/synchronized:

- Capacitor 8 Android project
- native Places SDK bridge
- separate Android-restricted Places key
- stable development signing
- share/haptics/back/map intents
- no GPS/location permission
- static attractions/station centers/map-target hardening
- integrated card-as-button draw flow
- low-chrome higher-contrast pastel UI
- 900 ms settled-result reveal + native haptic
- compact attraction-first completion surface
- **restaurant lookup only after `추천 식당 보기`**
- auto-scroll after restaurant results render
- line/station/food redraw controls inside corresponding completed cards
- enlarged/heavier refresh glyph visual while preserving 36 px hit area
- line-color subway-sign completed station treatment
- pending food `?` cue without increasing card height

Latest verified Android:

- branch/source head: `04cb963b1cf9c2aed10e19a3b316f13fad40f119`
- Android CI run `34973468315` — **success**
- shared tests → Vite native build → Capacitor sync → Gradle APK → artifact → fixed latest Release all passed
- asset: `random-seoul-latest.apk`
- size: `11,412,492` bytes
- SHA-256: `418b78f667508ca902f3f6eb25bcf045328edb9d2b4399d4f4089d4f3ab811d4`

Fixed direct download:
`https://github.com/momone3131/RandomSelect_Seoul_subway_station/releases/download/android-dev-latest/random-seoul-latest.apk`

## Implementation ownership

Key files:

- `src/application/random-seoul-controller.ts`
  - synchronous line/station/food selection
  - upstream redraw reset semantics
  - separate `loadRecommendations()`
- `src/main.ts`
  - restaurant request lifecycle
  - `추천 식당 보기` CTA
  - loading/error/complete transient state
  - post-render smooth scroll
  - existing redraw event handlers
- `src/ui/draw-view.ts`
  - concise stage/result rendering
  - moves existing redraw buttons into completed line/station/food cards
  - passes selected line color to station result
  - renders pending food `?`
- `src/ui/subway-sign-overrides.css`
  - larger/heavier redraw icon visuals
  - completed station subway-sign treatment
  - responsive station-sign sizing
  - food pending cue styling
- `src/ui/attraction-view.ts`
  - compact attraction section immediately after `.panels`
- `src/ui/draw-animation.ts`
  - rolling preview + settled reveal
- `src/ui/primary-draw-placement.ts`
  - integrated active-card button + press feedback
- `src/ui/mobile-overrides.css`
  - pastel/low-chrome/compact attraction/CTA layout
- `tests/random-seoul-controller.test.ts`
  - deferred lookup + 2 km contract
- `tests/responsive-contract.test.ts`
  - UX ordering/CTA/scroll/visual/in-card redraw/subway-sign/food-cue contracts

## Build / CI gates

### Web

`web-release.yml` triggers on relevant `src/**`, `tests/**`, build/workflow changes.

Gate:
- unit/contract tests
- Vite build
- headless browser full-flow smoke
- verified artifact promotion
- generated deploy commit rebase onto latest main
- GitHub Pages deployment

### Android

- shared tests
- native Vite build
- Capacitor sync
- Android signing/key checks
- Gradle `assembleDebug`
- Actions artifact
- fixed `android-dev-latest` Release replacement

## Documentation continuity

Repository docs are durable project memory.

- `PROJECT_CONTEXT.md`: fast recovery
- `STATUS.md`: current facts/verification
- `PROJECT_PLAN.md`: product/policy
- `ARCHITECTURE.md`: technical/data flow
- `ATTRACTION_CURATION.md`: attraction policy/map targets

Conflict priority: **actual code/Git > STATUS > ARCHITECTURE/PROJECT_PLAN > PROJECT_CONTEXT/README**.

## Change log — 2026-09-15

- Integrated main draw CTA into next-result card.
- Removed explanatory copy and reclaimed vertical space.
- Rebalanced card sizes/small typography/touch areas.
- Removed redundant borders and shifted hierarchy toward pastel color surfaces.
- Strengthened draw press/reveal feedback.
- Hardened attraction map targets and removed station-name search bias.
- Expanded browse-worthy attraction curation.
- Changed restaurant flow from automatic post-food lookup to **explicit user-triggered lookup**.
- Moved/compacted 추천 명소 directly under random-result panels.
- Added full-width `추천 식당 보기` CTA.
- Added loading state and smooth auto-scroll only after restaurant results are ready.
- Moved line/station/food redraw actions from lower text buttons into the corresponding completed cards as low-contrast top-right refresh glyphs.
- Enlarged the refresh glyph to 24 px and increased its stroke to 2.4 while keeping the transparent 36 px hit target.
- Reworked completed station results into a line-color, white-interior subway-sign-inspired card with the selected ordinal in a circular badge.
- Restored `?` in the ready-to-draw food card without increasing its card height.
- Preserved upstream reset semantics and restaurant-state invalidation on partial redraw.
- Updated Web and Android regression contracts for the current visual behavior.
- Web CI/Web Release/Pages and Android latest dev APK verified for the subway-sign / food-cue release.
