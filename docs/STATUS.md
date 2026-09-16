# Random Seoul — Development Status

Last updated: 2026-09-16

이 문서는 실제 현재 개발 위치와 검증 결과를 기록합니다. 라이브 Git 상태가 최우선입니다.

## Product / platform role

- **Android:** 현재 주 개발/배포 대상이자 앱 본체
- **Web:** 계속 배포되는 정식 지원 target + Android 공통 UX reference implementation
- **iOS:** Android 안정화 이후 shared core 기반 후속 지원

## Public Web

Status: **DEPLOYED — EXPANDED ATTRACTIONS + VISUAL GOLD/SILVER/STANDARD TIERS + MINIMAL UI LIVE**

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
- attraction은 first-party static curation이며 live Google attraction search를 하지 않음
- restaurant lookup 중 course-changing controls 잠금
- search 완료 전 빈 restaurant section으로 자동 scroll하지 않음

Latest verified Web:

- source/regression head: `b8f3bfd6907c245af0bc4f00796516246dbf7fac`
- main CI run `35098576045` — **success**
- Web Release run `35098576063` — **success**
- deployment commit: `2b90832af1cd0bd346d66e7a15aebfa3a92c6ea8`
- public bundle: `assets/modular-p8iru51_.js`
- GitHub Pages run `35098698981` — **success**

The deployed bundle was directly checked for the new local-attraction dataset, tier classifier, `attraction-tier-gold/silver/standard` rendering, and metallic gold/silver arrival animations.

## Primary draw / visual UI

### Minimal passive palette

Passive UI remains a restrained three-neutral system:

- app background: `#f5f4f0`
- paper/content surface: `#fffdfa`
- structural surface: `#e9ebe7`
- active random target remains lime with dark ink
- completed station sign still uses the selected subway-line color
- line badges still use their real line colors

The redundant visual `01 노선 / 02 역 / 03 음식` progress strip remains hidden.

### Dynamic hero prompt

- initial: `어디로 가볼까?`
- line selected: `어느 역에서 내릴까?`
- station selected: `식사도 해야지?`
- food selected: `이 코스로 가자!`

### In-card redraw / station / food / utility

- completed line/station/food cards keep top-right ↻ controls
- refresh glyph: `27 × 27 px`, stroke `2.7`, transparent `36 × 36 px` hit area
- completed station uses line-color subway-sign treatment with vertically centered ordinal + station name
- food pending copy remains centered `뭐 먹을까?`
- station actions remain one row: `복사 / 네이버지도 / 구글지도`
- copy remains conversational: `${역}에서 ${음식} 먹자!`; no line/ordinal/examples/restaurant name

## Attraction-first layout

- attraction section directly follows the random-result panels
- max 0–2 compact cards
- 0 attractions → section hidden
- `추천 식당 보기` follows attractions
- existing stronger curated candidates keep priority; broader local candidates fill empty/second slots rather than replacing them

## Curated nearby attractions

Status: **EXPANDED / STATIC FIRST-PARTY / 3 VISUAL TIERS**

### Coverage policy

The curation threshold was broadened beyond only destination-scale landmarks. A place may now qualify when it is a reasonable nearby outing stop such as:

- distinctive commercial / food / cafe / rodeo streets
- traditional or specialty markets
- sizeable parks, lake parks, riverside / ecological spaces
- campuses worth walking around
- cultural, sports, exhibition and local landmark spaces
- browse-worthy malls / outlets / lifestyle complexes

Tiny playgrounds, ordinary apartment parks, generic convenience facilities, and places with little reason to spend time remain excluded. A genuinely weak station may still have zero recommendations.

A new `curated-attractions-local.ts` layer adds **60+ station keys** on top of the existing base/extra curation. Representative additions include 아현시장, 용마폭포공원, 남한산성, 인천중앙공원, 보라매공원, 잠실종합운동장, 연신내 로데오거리, 양화한강공원, 태릉과 강릉, 청계산, 시흥갯골생태공원 and 동백호수공원.

### Attraction visual tiers

Every surfaced attraction receives one of three internal tiers. The tier name is **never rendered as text**.

- `gold`: nationally iconic / destination-level places
- `silver`: major well-known regional/city destinations
- `standard`: worthwhile local browse/stay stops

Visual contract:

- **gold:** metallic gold reflective border + subtle continuing sheen + strong gold-colored first-arrival pulse
- **silver:** metallic silver reflective border + subtle continuing sheen + silver first-arrival pulse
- **standard:** existing neutral borderless card
- gold/silver reveal runs only when a new station/attraction signature first appears; repeated state renders do not restart it
- `prefers-reduced-motion` disables tier motion

Representative gold examples include 경복궁, 국립중앙박물관, 광화문광장, DDP, 광장시장, 홍대 걷고싶은거리, 반포한강공원, 롯데월드타워, 올림픽공원, 서울대공원, 코엑스 and 에버랜드.

### Data / map integrity

Data layers:

- `curated-attractions-base.ts`: established strong seed
- `curated-attractions-extra.ts`: previous browse-worthy expansion
- `curated-attractions-local.ts`: broader local streets/markets/parks/campuses/etc.
- `curated-attraction-tiers.ts`: visual/editorial tier classifier
- `curated-attractions.ts`: base → extra → local merge, ID dedupe, max2, tier attachment

Map rules remain unchanged:

- no live Google attraction Text Search
- `mapQuery` is self-contained; station name is not automatically appended
- ambiguous targets use city/district/road/address context
- broad linear spaces use an appropriate access point where needed
- max 2; no forced fill

Representative hardened target remains 검암 → `경인아라뱃길 시천가람터` / `시천가람터 인천광역시 서구 시천동 158-11`.

## Restaurant recommendation policy

- provider: Google Places live candidate data
- trigger: explicit `추천 식당 보기`
- hard radius: 2 km
- max search candidates: 20
- TOP 3 ranking: Bayesian rating 55%, review volume log 25%, Google relevance 15%, distance 5%
- Google-derived restaurant results are not persisted as a reusable own DB

## Static station centers

- `station-coordinates.ts` static first
- missing stations only → Google fallback
- fallback coordinate cache: 30 days

## Android app

Status: **ACTIVE — EXPANDED ATTRACTIONS + METALLIC TIERS IN LATEST DEV APK**

Branch: `feature/random-seoul-android`
PR: `#3 android: build Random Seoul native shell`
App id: `io.github.momone3131.randomseoul`

Latest verified Android:

- branch/source head: `07bcdffe402e2f7123902df9d20762dde8581cf0`
- Android CI run `35098362074` — **success**
- shared tests → native Web build → Capacitor sync → Gradle APK → artifact → fixed latest Release all passed
- asset: `random-seoul-latest.apk`
- size: `11,419,332` bytes
- SHA-256: `9e623d71bead67e98f1e7ea67b9ae7f9dc709d69fef7bf998670f3914c569a1e`

Fixed direct download:
`https://github.com/momone3131/RandomSelect_Seoul_subway_station/releases/download/android-dev-latest/random-seoul-latest.apk`

## Implementation ownership

Key files:

- `src/data/curated-attraction-tiers.ts`
  - gold/silver ID sets; all others standard
- `src/data/curated-attractions-local.ts`
  - broader local-outing layer
- `src/data/curated-attractions.ts`
  - base/extra/local merge + dedupe + max2 + tier attachment
- `src/ui/attraction-view.ts`
  - tier classes, no visible tier label, first-render signature guard
- `src/ui/minimal-palette-overrides.css`
  - neutral palette plus metallic gold/silver border/sheens/arrival pulses
- `tests/curated-attractions.test.ts`
  - expanded coverage, tier assignment, map-target and max2 contracts
- `tests/responsive-contract.test.ts`
  - metallic visual tier/no-text/reduced-motion contracts
- `src/application/random-seoul-controller.ts`
  - shared draw/reset semantics and separate restaurant lookup

## Build / CI gates

### Web

`web-release.yml` runs tests → Vite build → headless browser smoke → verified root promotion → Pages deployment.

### Android

shared tests → native Web build → Capacitor sync → Gradle `assembleDebug` → Actions artifact → fixed `android-dev-latest` Release.

## Documentation continuity

Repository docs are durable project memory.

- `PROJECT_CONTEXT.md`: fast recovery
- `STATUS.md`: current implementation + verification
- `PROJECT_PLAN.md`: product/policy
- `ARCHITECTURE.md`: technical/data flow
- `ATTRACTION_CURATION.md`: attraction policy/map targets/tiers

Conflict priority: **actual code/Git > STATUS > ARCHITECTURE/PROJECT_PLAN > PROJECT_CONTEXT/README**.

## Change log — 2026-09-16

- Added `gold / silver / standard` internal attraction tiers without visible tier text.
- Added metallic reflective gold/silver card borders and tier-matched first-arrival effects; standard cards stay borderless.
- Guarded tier reveal so ordinary rerenders do not restart the effect; reduced-motion disables it.
- Added a broad local curation layer covering 60+ additional station keys with commercial streets, markets, sizeable parks, campuses and local cultural/sports destinations.
- Preserved base/extra priority, max2, no forced fill and mapQuery integrity.
- Web CI/Web Release/Pages and Android latest dev APK verified for the expanded-attraction/tier release.
