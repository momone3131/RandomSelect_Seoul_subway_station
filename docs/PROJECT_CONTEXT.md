# Random Seoul — Project Context / Handoff

Last updated: 2026-09-16

이 문서는 새 채팅/개발 세션이 저장소만 보고도 Random Seoul을 이어갈 수 있도록 하는 빠른 인계 문서입니다. 실제 최신성은 **live GitHub → STATUS → ARCHITECTURE/PROJECT_PLAN → 이 문서** 순으로 확인합니다.

## 1. Product

**Random Seoul**은 별도 계획 없이 서울/수도권에서 어디로 가고 무엇을 먹을지 정해주는 랜덤 외출 앱입니다.

현재 사용자 흐름:

1. 노선 랜덤
2. 역 랜덤
3. 음식 랜덤
4. 해당 역의 first-party 추천 명소 0~2곳 즉시 표시
5. 사용자가 원하면 `추천 식당 보기`
6. 그때 Google Places live 식당 검색 → TOP 3
7. 결과가 준비되면 추천 식당 섹션으로 smooth scroll
8. 지도 앱/웹으로 이동

중요: **음식 선택만으로 식당 API를 자동 호출하지 않는다.** 랜덤 결과 + 추천 명소가 1차 결과이고 식당은 opt-in 2차 정보다.

## 2. Platform roles

### Android

- 현재 주 개발/배포 대상이자 앱 본체
- branch: `feature/random-seoul-android`
- Capacitor 8 + Places SDK for Android bridge
- app id: `io.github.momone3131.randomseoul`
- fixed dev Release tag: `android-dev-latest`
- fixed APK asset: `random-seoul-latest.apk`

### Web

- `main`에서 계속 배포되는 정식 지원 target
- Android 공통 기능/UX reference implementation
- GitHub Pages 사용

### iOS

- Android 안정화 이후 shared core 재사용 예정

## 3. Repository / branch policy

Repository: `momone3131/RandomSelect_Seoul_subway_station`

- `main`: stable Web/shared core/docs
- `feature/random-seoul-android`: Android work
- PR #3: Android native shell work

공통 로직/UX 변경은 가능한 한 Web + Android에 동기화하고 각각 CI로 확인합니다.

## 4. Core architecture

- Vite + Vanilla TypeScript shared core
- Capacitor mobile shell
- draw/data/state/filter/ranking = shared TypeScript
- platform-specific Places/map/share/haptics/back = adapter/plugin
- GPS/current-location permission = 현재 없음

### Result-first UI

**노선 / 역 / 음식 → 추천 명소 → 추천 식당 보기**

- attraction section은 `.panels` 바로 뒤
- 최대 2개 compact cards; 0개면 section 생략
- restaurant CTA 전에는 `recommendations`가 비어 있음
- restaurant search 완료 후 result section으로 smooth scroll

## 5. Main interaction / visual contract

### Minimal palette

Passive UI는 중성 3-tone system:

- bg `#f5f4f0`
- paper `#fffdfa`
- surface `#e9ebe7`
- active random target = lime + dark ink
- completed station = selected line-color frame/badge
- line badge = actual line color

시각적 `01 노선 / 02 역 / 03 음식` strip은 숨깁니다.

### Stage headline

- initial `어디로 가볼까?`
- line selected `어느 역에서 내릴까?`
- station selected `식사도 해야지?`
- food selected `이 코스로 가자!`

### Draw/result cards

- next-result card 자체가 primary draw target
- completed line/station/food 우측 상단 ↻ 부분 재추첨
- refresh: 27px / stroke 2.7 / transparent 36px hit area
- station result: line-color subway-sign treatment, ordinal + station name vertically centered
- food pending: centered `뭐 먹을까?`, pre-stage faint / active-stage strong
- actions: `복사 / 네이버지도 / 구글지도` one-row 3-column
- copy: `${역}에서 ${음식} 먹자!`; line/ordinal/examples/restaurant name 제외

## 6. Attraction policy / tiers

Attractions are **first-party static curation**, max 0–2. No live Google attraction Text Search.

### Coverage threshold

Curation is intentionally broader than only major tourist landmarks. Qualifying nearby stops include:

- distinctive commercial / food / cafe / rodeo streets
- traditional or specialty markets
- sizeable parks, lake parks, riverside and ecological spaces
- campuses worth walking around
- cultural / exhibition / sports / local landmark spaces
- major browse-worthy malls, outlets and lifestyle complexes

Still excluded: tiny playgrounds, ordinary apartment-front parks, generic neighborhood facilities, and weak filler destinations. Zero attractions remains valid for genuinely weak stations.

### Data layers

Merge order is important:

1. `curated-attractions-base.ts` — established strong seed
2. `curated-attractions-extra.ts` — previous browse-worthy expansion
3. `curated-attractions-local.ts` — broader local streets/markets/parks/campuses/etc.
4. ID dedupe
5. max 2
6. tier attachment via `curated-attraction-tiers.ts`

The local layer currently covers **60+ additional station keys**. Existing stronger base/extra candidates therefore keep priority; local candidates primarily fill holes or second slots.

### Visual tiers

Internal type: `gold | silver | standard`. **Never print tier labels in the card.**

- `gold`: nationally iconic / destination-level
  - metallic gold border
  - slow reflective sheen
  - strong gold first-arrival pulse
- `silver`: major city/regional well-known destination
  - metallic silver border
  - slow reflective sheen
  - silver first-arrival pulse
- `standard`: worthwhile local browse/stay stop
  - current neutral borderless card

`src/ui/attraction-view.ts` tracks a station+attraction signature so gold/silver arrival effects fire only on the genuinely new result, not every state rerender. `prefers-reduced-motion` disables the motion.

Representative gold IDs include 경복궁, 국립중앙박물관, 광화문광장, DDP, 광장시장, 홍대, 반포한강공원, 롯데월드타워, 올림픽공원, 서울대공원, 코엑스, 에버랜드, 두물머리 and 남한산성.

### Map target integrity

- attraction lat/lng 별도 저장하지 않음
- `mapQuery` is the self-contained Google Maps target
- UI must NOT auto-append station name
- ambiguous market/street/park target gets city/district/road/address context
- broad paths/waterfronts use an appropriate access point when necessary
- if exact target is not defensible, omit rather than point to the wrong place

Representative hardened target:
- 검암: `경인아라뱃길 시천가람터` → `시천가람터 인천광역시 서구 시천동 158-11`

## 7. Restaurant policy

- live Google Places candidates
- explicit `추천 식당 보기` only
- hard distance 2 km
- max 20 candidates → TOP 3
- ranking: Bayesian rating 55%, review log 25%, Google relevance 15%, distance 5%
- Google rating/review-derived results are not persisted as a reusable own DB

## 8. Station centers

- `station-coordinates.ts` static first
- missing stations only → Google fallback
- fallback 30-day cache

## 9. Latest verified snapshot

### Public Web

- source/regression head: `b8f3bfd6907c245af0bc4f00796516246dbf7fac`
- main CI: `35098576045` — success
- Web Release: `35098576063` — success
- deployment commit: `2b90832af1cd0bd346d66e7a15aebfa3a92c6ea8`
- public bundle: `assets/modular-p8iru51_.js`
- GitHub Pages: `35098698981` — success

Public bundle directly contains the new tier classifier/local data and `attraction-gold-arrive` metallic visual contract.

### Android

- branch/source head: `07bcdffe402e2f7123902df9d20762dde8581cf0`
- Android CI: `35098362074` — success
- APK: `random-seoul-latest.apk`
- size: `11,419,332` bytes
- SHA-256: `9e623d71bead67e98f1e7ea67b9ae7f9dc709d69fef7bf998670f3914c569a1e`

Direct fixed URL:
`https://github.com/momone3131/RandomSelect_Seoul_subway_station/releases/download/android-dev-latest/random-seoul-latest.apk`

## 10. Build/deploy notes

Web Release: tests → build → browser smoke → verified root promotion → deployment commit → GitHub Pages.

Android CI: shared tests → native Web build → Capacitor sync → Gradle debug APK → artifact → fixed latest Release.

Permanent late-stage styles are combined by `scripts/extract-legacy-shell.mjs` in this order:

1. `styles.css`
2. `mobile-overrides.css`
3. `subway-sign-overrides.css`
4. `minimal-palette-overrides.css`

The final palette file also owns the attraction tier border/sheens because those must override the base borderless attraction treatment.

## 11. Documentation source of truth

- `README.md`: entry/download links
- `PROJECT_CONTEXT.md`: fast handoff
- `STATUS.md`: current implementation + verification
- `PROJECT_PLAN.md`: product intent/policy
- `ARCHITECTURE.md`: technical/data flow
- `ATTRACTION_CURATION.md`: attraction editorial/map target/tier rules

Conflict priority: **actual code/Git > STATUS > ARCHITECTURE/PROJECT_PLAN > PROJECT_CONTEXT/README**.

## 12. Session restart checklist

1. inspect live GitHub main + Android branch/PR
2. read `PROJECT_CONTEXT.md`
3. read `STATUS.md`
4. read relevant architecture/plan/curation docs
5. inspect actual source/CI before editing
6. synchronize shared changes to Web + Android when applicable
7. verify Web Release/public bundle/Pages separately
8. verify Android fixed Release if APK changes
9. update durable docs for meaningful changes
