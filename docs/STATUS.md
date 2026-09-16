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

음식 선택만으로 restaurant lookup을 자동 호출하지 않습니다. Attraction은 live Google attraction search가 아닌 static curation입니다.

## Main UI baseline

- passive palette: `#f5f4f0 / #fffdfa / #e9ebe7`
- active random target: lime + dark ink
- completed station: selected line-color subway-sign style
- `01 노선 / 02 역 / 03 음식` visual strip hidden
- headline: `어디로 가볼까? → 어느 역에서 내릴까? → 식사도 해야지? → 이 코스로 가자!`
- in-card ↻: 27 px / stroke 2.7 / 36×36 hit area
- food pending: centered `뭐 먹을까?`
- actions: `복사 / 네이버지도 / 구글지도` one row
- copy: `${역}에서 ${음식} 먹자!`; line/ordinal/examples/restaurant name omitted

## Attraction coverage

Status: **STATIC FIRST-PARTY / MAX 0–2 / BROAD LOCAL COVERAGE / FOUR PROMINENCE TIERS + ORTHOGONAL NIGHTSCAPE FEATURE**

Merge priority:

**base → station adjustments → extra → local → ID dedupe → max2 → prominence tier + orthogonal feature attachment**

Key files:
- `curated-attractions-base.ts`
- `curated-attractions-adjustments.ts`
- `curated-attractions-extra.ts`
- `curated-attractions-local.ts`
- `curated-attraction-tiers.ts`
- `curated-attraction-features.ts`
- `curated-attractions.ts`

Tiny playgrounds, ordinary apartment parks and generic weak neighborhood facilities remain excluded. A weak station may legitimately return zero attractions.

## Attraction prominence tiers

Tier name is **never shown as text**.

Current classifier:
- **Diamond: 4**
- **Gold: 24**
- **Silver: 85**
- all other surfaced IDs: Standard

### Diamond

Exactly four: 경복궁 / 국립중앙박물관 / 롯데월드타워 / 북촌한옥마을.

Diamond is an intentionally rare jackpot layer, not an absolute quality score. Visual is gemstone rather than metal:
- 3 px icy cyan / sky-blue / white / pale-violet prism border
- `4.2s` prism motion + `3.4s` facet sparkle
- `1.8s` large multi-stage first-arrival reveal
- peak scale `1.075`, `16px` cyan ring, roughly `42–58px` glow
- signature guard prevents replay on unrelated rerenders
- reduced-motion disables motion

### Gold / Silver / Standard

- Gold: nationwide / destination-grade recognition; metallic gold border
- Silver: strong city/region destination or nationally known niche place; metallic silver border
- Standard: worthwhile local stop; neutral borderless card

Latest tier correction:
- **서소문성지역사박물관** was already Silver and remains Silver.
- **서울 석촌동 고분군** was Standard and is now promoted to Silver.

Full rationale: `docs/ATTRACTION_TIER_AUDIT.md`.

## Nightscape feature — independent of tier

Nightscape is **not a fifth tier and not a ranking**. It is an orthogonal attraction feature, so the same card can simultaneously be Diamond/Gold/Silver/Standard **and** Nightscape.

Source of truth: `src/data/curated-attraction-features.ts`.

Current conservative Nightscape set — **10 attractions**:
- DDP
- 낙산공원
- 노들섬
- 반포한강공원
- 세빛섬
- 석촌호수
- 롯데월드타워
- 송도 센트럴파크
- 광교호수공원
- 라베니체 마치에비뉴

Selection rule: night itself must be a meaningful reason to visit. Seasonal-only night opening or overly broad destinations are not statically tagged.

Visual contract:
- prominence tier continues to own the **outer border/effect**
- Nightscape owns the **card interior/background**
- dark navy → indigo/purple night-sky gradient
- tiny star points + subtle warm city-light glow near the bottom
- near-white attraction name / muted blue secondary text / translucent map action
- no visible `야경` text badge
- Diamond + Nightscape therefore renders Diamond gemstone border/sparkles over a night-sky interior; Gold/Silver keep their own metallic borders over the same night interior

`attraction-view.ts` includes `night/plain` in its render signature, and adds `attraction-nightscape` independently from `attraction-tier-${tier}`.

## Map integrity

- no live Google attraction Text Search
- `mapQuery` is self-contained
- UI never auto-appends station name
- ambiguous target gets district/road/address context
- broad linear spaces use a concrete access anchor when needed
- max2 / no forced fill

Representative hardened target: 검암 → `경인아라뱃길 시천가람터` / `시천가람터 인천광역시 서구 시천동 158-11`.

## Restaurant recommendation policy

- Google Places live candidates
- explicit `추천 식당 보기` only
- hard radius 2 km
- max 20 candidates → TOP 3
- Bayesian rating 55%, review volume log 25%, Google relevance 15%, distance 5%
- Google-derived restaurant results are not persisted as a reusable DB

## Latest verified Web — Nightscape release

- source/regression head: `b35c2be8e1182343929655e869ff234c649f082a`
- main CI run `35112696311` — **success**
- Web Release run `35112696302` — **success**
- public bundle: `assets/modular-BRia8hmx.js`
- GitHub Pages run `35112694619` — **success**

The deployed bundle was directly fetched and checked for:
- all 10 Nightscape IDs
- independent `nightscape` feature attachment
- `attraction-nightscape` rendering alongside `attraction-tier-*`
- night-sky gradient `#081227 → #132343 → #241a40`
- 석촌동 고분군 + 서소문성지역사박물관 in Silver

## Latest verified Android — Nightscape release

Branch: `feature/random-seoul-android`
PR: `#3 android: build Random Seoul native shell`
App id: `io.github.momone3131.randomseoul`

- branch/source head: `398a272fa3ef04ad7970393ff105b6a6e1e6a844`
- Android CI run `35113150949` — **success**
- shared tests → native Web build → Capacitor sync → Gradle APK → artifact → fixed latest Release all passed
- fixed Release asset: `random-seoul-latest.apk`
- size: `11,421,500` bytes
- SHA-256: `34519dcf9396e655cbee49e8ad547660df3d55040becafd1c0ff4b42ce46e338`

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
- `ATTRACTION_CURATION.md`: selection/map/tier/feature policy
- `ATTRACTION_TIER_AUDIT.md`: prominence audit evidence and decisions

Conflict priority: **actual code/Git > STATUS > ARCHITECTURE/PROJECT_PLAN > PROJECT_CONTEXT/README**.

## Change log — 2026-09-16

- Hidden-Gem classification was deliberately **not added**.
- Confirmed 서소문성지역사박물관 was already Silver.
- Promoted 서울 석촌동 고분군 from Standard → Silver; Silver count is now 85.
- Added independent Nightscape feature with 10 conservatively selected attractions.
- Nightscape uses the card interior rather than border, allowing simultaneous Diamond/Gold/Silver + Nightscape presentation.
- Added dark navy/indigo/purple starry background and night-specific text/action treatment without a visible badge.
- Verified Web CI/Web Release/public bundle/Pages and Android CI/latest APK for the Nightscape release.
