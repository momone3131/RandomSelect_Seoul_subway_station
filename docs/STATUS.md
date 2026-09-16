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

Status: **STATIC FIRST-PARTY / MAX 0–2 / BROAD LOCAL COVERAGE / THREE VISUAL PROMINENCE TIERS**

Allowed candidates now include:
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

## Attraction prominence tier audit — 2026-09-16

A full tier audit was completed against the current attraction inventory, using current official tourism material as external evidence and editorial consistency across the dataset.

Tier meaning:
- **gold:** nationwide / destination-grade recognition
- **silver:** strong city/region destination or nationally known niche place
- **standard:** worthwhile local stop

The tier name is never shown as text.

Current classifier:
- Gold IDs: **28**
- Silver IDs: **84**
- all other surfaced attraction IDs: Standard

Representative Gold after audit:
- 경복궁 / 창덕궁 / 북촌 / 종묘
- 국립중앙박물관 / 전쟁기념관
- 광화문광장 / 청계천
- 광장시장 / 남대문시장
- DDP / 명동 / 홍대
- 성수 연무장길 / 서울숲
- 반포한강공원
- 롯데월드타워 / 석촌호수 / 올림픽공원
- 코엑스 / 서울대공원 / 에버랜드
- 두물머리 / 남한산성 / 임진각 평화누리
- 송도 센트럴파크 / 인천 차이나타운 / 개항장거리

Notable Silver promotions/confirmations:
- 서대문형무소역사관 / 대학로 / 낙산공원 / 북서울꿈의숲
- 동묘벼룩시장 / 동대문종합시장 / 경동시장 / 마장축산물시장
- 용리단길 / 가로수길 / 압구정로데오 / 청담 명품거리
- 신당동 떡볶이타운 / 신림동 순대타운
- 아차산 / 도봉산 / 수락산 / 관악산 / 청계산
- 고척스카이돔 / 잠실종합운동장 / 국기원
- 모란민속5일장 / 안산 다문화음식거리 / 대림동 차이나타운
- 한국만화박물관 / 백남준아트센터
- 정릉 / 동구릉 / 태릉과 강릉 / 선정릉
- 인천대공원 / 자유공원 / 신포국제시장 / 소래포구
- 강촌유원지 / 청평유원지 / 춘천 명동 닭갈비골목 / 소양강스카이워크
- 보정동 카페거리 / 라베니체 / 소요산

Intentional Silver → Standard demotions:
- 서울로7017
- 양재시민의숲
- 용마폭포공원
- 양화한강공원
- 일자산 허브천문공원
- 인천중앙공원
- 삼패한강공원
- 은계호수공원
- 화계사
- 동백호수공원
- 롯데백화점 동탄점

Demotion does **not** remove a recommendation; it only removes metallic Silver emphasis.

Full rationale: `docs/ATTRACTION_TIER_AUDIT.md`.

## Attraction visual contract

- gold: metallic gold reflective border + continuing sheen + strong first-arrival gold pulse
- silver: metallic silver reflective border + continuing sheen + silver first-arrival pulse
- standard: neutral borderless card
- reveal runs only for a new station/attraction signature
- ordinary rerender does not replay reveal
- reduced-motion disables tier animation

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

## Latest verified Web

Full-audit source release:
- tier source head: `ef6eb1dcfd8b6d7823c5607a7cb2532c53db8a8d`
- main CI run `35102781290` — **success**
- Web Release run `35102781339` — **success**
- deployment commit: `006eafb1070a36a1a0041c1d91125d2ba7697c2f`
- public bundle: `assets/modular-Coke_hQH.js`
- GitHub Pages run `35102843979` — **success**

The public bundle was directly checked and contains the audited Gold/Silver ID sets including current second-pass additions such as 북서울꿈의숲, 마장축산물시장, 신림동 순대타운, 고척스카이돔, 잠실종합운동장, 모란민속5일장 and 춘천 명동 닭갈비골목.

## Latest verified Android

Branch: `feature/random-seoul-android`
PR: `#3 android: build Random Seoul native shell`
App id: `io.github.momone3131.randomseoul`

- audited tier source head: `100f5e485221fd4dbc3915746cfa72fceed98526`
- Android CI run `35102822357` — **success**
- fixed Release asset: `random-seoul-latest.apk`
- size: `11,419,580` bytes
- SHA-256: `f62636ec46df889921a107752012feccf27da8568deb6fe61080728763f3581f`

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
- `ATTRACTION_TIER_AUDIT.md`: 2026-09 prominence audit evidence and decisions

Conflict priority: **actual code/Git > STATUS > ARCHITECTURE/PROJECT_PLAN > PROJECT_CONTEXT/README**.
