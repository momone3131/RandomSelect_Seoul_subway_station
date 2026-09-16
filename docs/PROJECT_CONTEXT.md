# Random Seoul — Project Context / Handoff

Last updated: 2026-09-17

새 채팅/개발 세션은 **live GitHub → STATUS → ARCHITECTURE/PROJECT_PLAN → 이 문서** 순으로 최신성을 확인합니다.

## 1. Product

Random Seoul은 서울/수도권에서 별도 계획 없이 `노선 → 역 → 음식`을 랜덤으로 정하고, 역 주변 first-party 추천 명소 0~2곳을 즉시 보여주는 외출 앱입니다.

식당은 음식 추첨 뒤 자동 조회하지 않고 사용자가 `추천 식당 보기`를 눌렀을 때만 Google Places live 후보를 조회합니다. 2 km hard radius, 최대 20개 후보를 shared ranking으로 TOP 3까지 줄입니다.

## 2. Platform roles

- Android: 현재 주 개발/배포 target, `feature/random-seoul-android`, app id `io.github.momone3131.randomseoul`
- Web: `main`에서 계속 배포되는 정식 지원 target + 공통 UX reference
- iOS: Android 안정화 이후 shared core 재사용 예정

## 3. UI baseline

- passive palette: bg `#f5f4f0`, paper `#fffdfa`, surface `#e9ebe7`
- active draw target: lime
- completed station: selected line-color subway sign
- visual progress strip hidden
- hero: `어디로 가볼까? / 어느 역에서 내릴까? / 식사도 해야지? / 이 코스로 가자!`
- food pending: `뭐 먹을까?`
- actions: `복사 / 네이버지도 / 구글지도`

## 4. Attraction architecture

Attractions are static first-party curation, max 0–2, no live attraction Text Search.

Current merge priority:

**base → station adjustments → extra → local → night-viewpoints → ID dedupe → max2 → tier/feature attachment**

The `night-viewpoints` layer is last on purpose: it can add a missing second result, but must not push out stronger established recommendations.

Files:
- `curated-attractions-base.ts`
- `curated-attractions-adjustments.ts`
- `curated-attractions-extra.ts`
- `curated-attractions-local.ts`
- `curated-attractions-night-viewpoints.ts`
- `curated-attraction-tiers.ts`
- `curated-attraction-features.ts`
- `curated-attractions.ts`

## 5. Prominence tiers

Internal only, never printed as text:
`diamond | gold | silver | standard`

Current counts:
- Diamond 4
- Gold 25
- Silver 88
- remaining surfaced IDs Standard

Diamond is fixed to 경복궁 / 국립중앙박물관 / 롯데월드타워 / 북촌한옥마을. Diamond visual is icy cyan/sky/white/violet gemstone prism; Gold/Silver remain metallic.

Latest relevant tier decisions:
- N서울타워 = Gold
- 응봉산 팔각정 / 남한산성 서문 전망대 / 수원화성 서장대 = Silver
- 석촌동 고분군 / 서소문성지역사박물관 = Silver
- other newly added small viewpoint spots = Standard

## 6. Nightscape feature

Nightscape is **orthogonal to prominence tier**, not a fifth tier. `AttractionRecommendation.nightscape` may coexist with any tier.

Strict definition: **an elevated place where viewing city lights after dark is itself a main reason to go.**

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

Explicitly **not Nightscape anymore**: DDP, 노들섬, 반포한강공원, 세빛섬, 석촌호수, 송도 센트럴파크, 광교호수공원, 라베니체. They remain normal recommendations and keep their prominence tier.

Nightscape visual uses the card **interior**: dark navy/indigo/purple night sky + stars/city glow. Tier still owns the outer border/effect, so `Diamond + Nightscape`, `Silver + Nightscape`, etc. render simultaneously. No `야경` text badge.

## 7. Map integrity

- self-contained `mapQuery`
- UI never auto-appends station name
- ambiguous destinations use city/district/address context
- wrong pin risk > omit

## 8. Latest verified Web

Strict Nightscape source/regression head: `287ac69fa506ec47c6447d33aff8062572e2e11c`

- CI `35116627042` — success
- Web Release `35116627214` — success
- deployment commit `b03abc2977ba28e5625fdbda82262883b380de3f`
- Pages `35116708861` — success
- public bundle `assets/modular-lkepNDzM.js`

Public bundle was directly checked for all 12 IDs, new viewpoint data, updated tier membership and overlapping Nightscape rendering.

## 9. Latest verified Android

Strict Nightscape source head: `5e9de44d1bd29c2c456fc3fb5b0b1b8352252874`

- Android CI `35116861580` — success
- APK `random-seoul-latest.apk`
- size `11,422,200` bytes
- SHA-256 `df8810c39974ab6ec8b998132307e1daf3003cd29060432542ff831303433440`

Direct APK:
`https://github.com/momone3131/RandomSelect_Seoul_subway_station/releases/download/android-dev-latest/random-seoul-latest.apk`

## 10. Source-of-truth docs

- `STATUS.md`: latest verified facts
- `ARCHITECTURE.md`: data flow/modules
- `PROJECT_PLAN.md`: product intent
- `ATTRACTION_CURATION.md`: curation/tier/feature rules
- `ATTRACTION_TIER_AUDIT.md`: prominence audit

Conflict priority: **actual code/Git > STATUS > ARCHITECTURE/PROJECT_PLAN > PROJECT_CONTEXT/README**.
