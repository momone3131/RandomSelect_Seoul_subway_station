# Random Seoul — Development Status

Last updated: 2026-09-16

라이브 Git 상태가 최우선입니다.

## Product / platform role

- **Android:** 현재 주 개발/배포 대상이자 앱 본체
- **Web:** 계속 배포되는 정식 지원 target + Android 공통 UX reference implementation
- **iOS:** Android 안정화 이후 shared core 기반 후속 지원

## Current flow

1. 노선 랜덤
2. 역 랜덤
3. 음식 랜덤
4. first-party 추천 명소 0~2개 즉시 표시
5. `추천 식당 보기`
6. 사용자 요청 시에만 Google Places 식당 검색
7. TOP 3 렌더 후 추천 식당 section으로 smooth scroll

음식 선택만으로 restaurant lookup을 자동 호출하지 않습니다. Attraction은 Google live search가 아닌 static curation입니다.

## UI baseline

- passive palette: `#f5f4f0 / #fffdfa / #e9ebe7`
- active random target: lime + dark ink
- completed station: selected subway-line color의 지하철 역명판 스타일
- `01 노선 / 02 역 / 03 음식` visual strip hidden
- dynamic headline:
  - `어디로 가볼까?`
  - `어느 역에서 내릴까?`
  - `식사도 해야지?`
  - `이 코스로 가자!`
- in-card ↻: 27 px / stroke 2.7 / 36×36 hit area
- food pending: centered `뭐 먹을까?`
- utility row: `복사 / 네이버지도 / 구글지도`
- copy: `${역}에서 ${음식} 먹자!`; line/ordinal/examples/restaurant name omitted

## Attraction coverage

Status: **STATIC FIRST-PARTY / MAX 0–2 / BROAD LOCAL COVERAGE / FOUR VISUAL PROMINENCE TIERS**

Allowed candidates include:
- major landmarks / heritage / museums
- distinctive commercial, food, cafe and rodeo streets
- traditional / specialty markets
- sizeable parks, lake parks, riverside and ecology destinations
- browse-worthy campuses
- cultural, sports, exhibition and experiential destinations
- large browse-worthy retail/lifestyle complexes

Tiny playgrounds, ordinary apartment parks and generic neighborhood facilities remain excluded. A weak station may still legitimately return zero attractions.

Data priority:

**base → station adjustments → extra → local → ID dedupe → max2 → tier attachment**

Key files:
- `curated-attractions-base.ts`
- `curated-attractions-adjustments.ts`
- `curated-attractions-extra.ts`
- `curated-attractions-local.ts`
- `curated-attraction-tiers.ts`
- `curated-attractions.ts`

`curated-attractions-local.ts` adds 60+ station keys beyond the older seed layers.

## Attraction prominence tiers

The tier name is **never shown as text**.

Current classifier:
- **Diamond: 4**
- **Gold: 24**
- **Silver: 84**
- all other surfaced attraction IDs: Standard

### Diamond — ultra-rare jackpot tier

Exactly four attractions:
- 경복궁
- 국립중앙박물관
- 롯데월드타워
- 북촌한옥마을

Diamond exists primarily as a rare/fun jackpot experience above Gold. It is intentionally kept extremely small and should not be expanded casually.

Visual contract — **gemstone, not metal**:
- 3 px icy cyan / sky blue / white / pale-violet prism border
- faceted color movement via `attraction-diamond-prism` rather than a platinum metallic sheen
- tiny white/cyan/violet facet sparkles around the card
- resting prism cycle: `4.2s`; sparkle cycle: `3.4s`
- first-arrival reveal: **1.8s**, deliberately stronger than Gold/Silver
- peak expansion: scale `1.075`, cyan outer ring up to `16px`, glow out to roughly `42–58px`
- multiple pulse moments + sparkle burst so the user can clearly notice a jackpot result
- reveal only when a genuinely new station/attraction signature appears
- reduced-motion disables all tier animation

### Gold

Nationwide / destination-grade recognition. Representative current Gold:
- 창덕궁 / 종묘
- 광화문광장 / 청계천
- 광장시장 / 남대문시장
- DDP / 명동거리 / 홍대
- 성수 연무장길 / 서울숲
- 반포한강공원
- 석촌호수 / 올림픽공원
- 코엑스 / 서울대공원 / 에버랜드
- 두물머리 / 남한산성 / 임진각 평화누리
- 송도 센트럴파크 / 인천 차이나타운 / 개항장거리

Visual: metallic gold border + continuing sheen + strong first-arrival gold pulse.

### Silver

Strong city/region destination or nationally known niche place. Examples include 가로수길, 용리단길, 대학로, 낙산공원, 서울식물원, 보라매공원, 국립과천과학관, 일산호수공원, 모란민속5일장, 고척스카이돔, 잠실종합운동장, 동구릉, 인천대공원, 강촌유원지, 라베니체 등.

Visual: metallic silver border + continuing sheen + first-arrival silver pulse.

### Standard

Worthwhile local stop without metallic prominence. Demotion does not remove a recommendation; it only removes the special border/effect.

Full audit rationale: `docs/ATTRACTION_TIER_AUDIT.md`.

## Attraction visual implementation

- type: `AttractionTier = 'diamond' | 'gold' | 'silver' | 'standard'`
- classifier: `src/data/curated-attraction-tiers.ts`
- render class: `attraction-tier-${tier}`
- no visible tier badge/text
- `attraction-view.ts` signature guard prevents replay on unrelated state rerenders
- `minimal-palette-overrides.css` owns Diamond gemstone visuals and Gold/Silver metallic treatments
- reduced-motion disables tier motion

## Map integrity

- no live Google attraction Text Search
- `mapQuery` is self-contained
- UI never auto-appends station name
- ambiguous target gets district/road/address context
- broad linear spaces use a concrete access anchor when needed
- max2 / no forced fill

Representative hardened target: 검암 → `경인아라뱃길 시천가람터` / `시천가람터 인천광역시 서구 시천동 158-11`.

Yongsan station adjustment:
- `l1:용산`, `gc:용산` → `아이파크몰 용산 + 용리단길`
- 용리단길 is Silver
- 신용산 keeps `용리단길 + 아모레퍼시픽미술관`

## Restaurant recommendation policy

- Google Places live candidates
- explicit `추천 식당 보기` only
- hard radius 2 km
- max 20 candidates → TOP 3
- Bayesian rating 55%
- review volume log 25%
- Google relevance 15%
- distance 5%
- Google-derived restaurant results are not persisted as a reusable DB

## Latest verified Web — gemstone Diamond release

- source/regression head: `ada83825726afd43ceed202d40be5b0da4a902e9`
- main CI run `35109359593` — **success**
- Web Release run `35109359439` — **success**
- deployment commit: `459545c14cbda1d87fe12aac2833691e1fda4c5f`
- public bundle: `assets/modular-IguZemH4.js`
- GitHub Pages run `35109358128` — **success**

The public bundle was directly fetched and checked. It contains:
- exactly four Diamond IDs: 경복궁 / 국립중앙박물관 / 롯데월드타워 / 북촌한옥마을
- Diamond classifier before Gold
- `attraction-diamond-prism 4.2s`
- `attraction-diamond-sparkle 3.4s`
- `attraction-diamond-arrive 1.8s`
- `16px` cyan expansion ring and larger multi-stage cyan/violet glow

## Latest verified Android — gemstone Diamond release

Branch: `feature/random-seoul-android`
PR: `#3 android: build Random Seoul native shell`
App id: `io.github.momone3131.randomseoul`

- branch/source head: `37755a7f3b02101b334286a6e16ff4212dce6ecd`
- Android CI run `35109420952` — **success**
- shared tests → native Web build → Capacitor sync → Gradle APK → artifact → fixed latest Release all passed
- fixed Release asset: `random-seoul-latest.apk`
- size: `11,420,860` bytes
- SHA-256: `3b7e6d66d17a8600a6fb70428e11085a3e9e7c3a6275e8cb911624861aaad285`

Direct download:
`https://github.com/momone3131/RandomSelect_Seoul_subway_station/releases/download/android-dev-latest/random-seoul-latest.apk`

## Build / CI gates

Web: tests → Vite build → headless browser smoke → verified root promotion → Pages.

Android: shared tests → native Web build → Capacitor sync → Gradle `assembleDebug` → artifact → fixed `android-dev-latest` Release.

## Documentation continuity

- `PROJECT_CONTEXT.md`: fast recovery
- `STATUS.md`: current facts / verification
- `PROJECT_PLAN.md`: product intent / policy
- `ARCHITECTURE.md`: technical/data flow
- `ATTRACTION_CURATION.md`: selection/map/tier policy
- `ATTRACTION_TIER_AUDIT.md`: prominence audit evidence, decisions and Diamond rarity contract

Conflict priority: **actual code/Git > STATUS > ARCHITECTURE/PROJECT_PLAN > PROJECT_CONTEXT/README**.

## Change log — 2026-09-16

- Diamond remains fixed to exactly four attractions: 경복궁, 국립중앙박물관, 롯데월드타워, 북촌한옥마을.
- Replaced the previous platinum/metal-like Diamond treatment with a true gemstone-style icy cyan / sky / white / violet prism treatment.
- Added subtle facet sparkles to the resting Diamond card.
- Increased Diamond first-arrival reveal from `1.65s` to `1.8s` and expanded its visual radius to a `16px` outer ring plus `42–58px` glow.
- Added several visible pulse/sparkle beats while preserving one-time signature behavior and reduced-motion handling.
- Verified Web CI/Web Release/public bundle/Pages and Android CI/latest APK for the gemstone Diamond release.
