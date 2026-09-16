# Random Seoul — Development Status

Last updated: 2026-09-17

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
- food pending: centered `뭐 먹을까?`
- actions: `복사 / 네이버지도 / 구글지도` one row
- copy: `${역}에서 ${음식} 먹자!`

## Attraction coverage

Status: **STATIC FIRST-PARTY / MAX 0–2 / FOUR PROMINENCE TIERS + ORTHOGONAL NIGHTSCAPE FEATURE**

Merge priority:

**base → station adjustments → extra → local → dedicated night-viewpoint layer → ID dedupe → max2 → tier/feature attachment**

The night-viewpoint layer is deliberately last so it fills spare attraction slots without displacing established stronger recommendations.

Key files:
- `curated-attractions-base.ts`
- `curated-attractions-adjustments.ts`
- `curated-attractions-extra.ts`
- `curated-attractions-local.ts`
- `curated-attractions-night-viewpoints.ts`
- `curated-attraction-tiers.ts`
- `curated-attraction-features.ts`
- `curated-attractions.ts`

Tiny playgrounds, ordinary apartment parks and generic weak neighborhood facilities remain excluded. A weak station may legitimately return zero attractions.

## Attraction prominence tiers

Tier name is **never shown as text**.

Current classifier:
- **Diamond: 4**
- **Gold: 25**
- **Silver: 88**
- all other surfaced IDs: Standard

### Diamond

Exactly four: 경복궁 / 국립중앙박물관 / 롯데월드타워 / 북촌한옥마을.

Diamond remains the ultra-rare jackpot layer. Visual is gemstone rather than metal: icy cyan / sky-blue / white / pale-violet prism, facet sparkles and a large `1.8s` first-arrival reveal.

### Latest tier corrections

- 서소문성지역사박물관 remains Silver.
- 서울 석촌동 고분군 remains promoted to Silver.
- N서울타워 is Gold.
- 응봉산 팔각정, 남한산성 서문 전망대, 수원화성 서장대 are Silver.
- 달맞이봉공원, 매봉산 팔각정, 용왕산 스카이워크, 삼성해맞이공원, 용마산 스카이워크, 용양봉저정공원 are Standard prominence even though they can carry Nightscape.

## Nightscape feature — strict elevated-view definition

Nightscape is **not a fifth tier and not a ranking**. It is an orthogonal feature that can overlap Diamond/Gold/Silver/Standard.

The definition is intentionally narrow:

> A place where going up to look over city lights after dark is itself a primary reason to visit.

Therefore “simply attractive or illuminated at night” is not enough. DDP, 노들섬, 반포한강공원, 세빛섬, 석촌호수, 송도 센트럴파크, 광교호수공원 and 라베니체 were removed from Nightscape classification while remaining ordinary curated attractions with their original prominence tiers.

Current Nightscape set — **12 attractions**:
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

Newly curated viewpoint destinations are mapped to nearby draw stations via `curated-attractions-night-viewpoints.ts`, including 충무로, 응봉, 옥수, 버티고개, 신목동, 청담, 사가정, 노들, 산성/남한산성입구 and 화서.

Visual contract:
- prominence tier continues to own the **outer border/effect**
- Nightscape owns the **card interior/background**
- dark navy → indigo/purple night-sky gradient + tiny star/city-light treatment
- no visible `야경` badge
- e.g. 롯데월드타워 = Diamond + Nightscape, 응봉산 팔각정 = Silver + Nightscape, 용왕산 스카이워크 = Standard + Nightscape

## Map integrity

- no live Google attraction Text Search
- `mapQuery` is self-contained
- UI never auto-appends station name
- ambiguous target gets district/road/address context
- max2 / no forced fill

## Restaurant recommendation policy

- Google Places live candidates
- explicit `추천 식당 보기` only
- hard radius 2 km
- max 20 candidates → TOP 3
- Bayesian rating 55%, review volume log 25%, Google relevance 15%, distance 5%
- Google-derived restaurant results are not persisted as a reusable DB

## Latest verified Web — strict Nightscape release

Source/regression head: `287ac69fa506ec47c6447d33aff8062572e2e11c`

- main CI `35116627042` — **success**
- Web Release `35116627214` — **success**
- deployment commit `b03abc2977ba28e5625fdbda82262883b380de3f`
- deployment Pages `35116708861` — **success**
- public bundle `assets/modular-lkepNDzM.js`

The deployed bundle was directly fetched and checked for the strict 12-ID Nightscape set, the new viewpoint mappings, updated Gold/Silver tier membership and the existing overlapping `attraction-nightscape` rendering.

## Latest verified Android — strict Nightscape release

Branch: `feature/random-seoul-android`
PR: `#3 android: build Random Seoul native shell`
App id: `io.github.momone3131.randomseoul`

- branch/source head: `5e9de44d1bd29c2c456fc3fb5b0b1b8352252874`
- Android CI `35116861580` — **success**
- shared tests → native Web build → Capacitor sync → Gradle APK → artifact → fixed latest Release all passed
- fixed Release asset: `random-seoul-latest.apk`
- size: `11,422,200` bytes
- SHA-256: `df8810c39974ab6ec8b998132307e1daf3003cd29060432542ff831303433440`

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

## Change log — 2026-09-17

- Refined Nightscape from broad “looks good at night” to **elevated city-light viewpoint** semantics.
- Removed DDP, 노들섬, 반포한강공원, 세빛섬, 석촌호수, 송도 센트럴파크, 광교호수공원 and 라베니체 from Nightscape only; their normal attraction recommendations/tier remain.
- Added a dedicated last-priority night-viewpoint data layer.
- Added N서울타워, 응봉산 팔각정, 달맞이봉공원, 매봉산 팔각정, 용왕산 스카이워크, 삼성해맞이공원, 용마산 스카이워크, 용양봉저정공원, 남한산성 서문 전망대 and 수원화성 서장대 where appropriate; 롯데월드타워 and 낙산공원 remain strict Nightscape destinations.
- Verified Web CI/release/deployed bundle/Pages and Android CI/latest APK.
