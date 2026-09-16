# Random Seoul — Project Context / Handoff

Last updated: 2026-09-16

새 채팅/개발 세션은 **live GitHub → STATUS → ARCHITECTURE/PROJECT_PLAN → 이 문서** 순으로 최신성을 확인합니다.

## 1. Product

Random Seoul은 별도 계획 없이 서울/수도권에서 어디로 가고 무엇을 먹을지 정해주는 랜덤 외출 앱입니다.

현재 사용자 흐름:
1. 노선 랜덤
2. 역 랜덤
3. 음식 랜덤
4. first-party 추천 명소 0~2곳 즉시 표시
5. `추천 식당 보기`
6. 그때 Google Places live 식당 검색 → TOP 3
7. 결과가 준비되면 추천 식당 섹션으로 smooth scroll
8. 지도 앱/웹으로 이동

음식 선택만으로 식당 API를 자동 호출하지 않습니다.

## 2. Platform roles

### Android
- 현재 주 개발/배포 대상
- branch `feature/random-seoul-android`
- Capacitor 8 + Places SDK for Android bridge
- app id `io.github.momone3131.randomseoul`
- fixed dev Release `android-dev-latest`
- fixed APK `random-seoul-latest.apk`

### Web
- `main`에서 계속 배포되는 정식 지원 target
- Android 공통 기능/UX reference implementation
- GitHub Pages

### iOS
- Android 안정화 이후 shared core 재사용 예정

## 3. Main UI contract

- passive palette: bg `#f5f4f0`, paper `#fffdfa`, surface `#e9ebe7`
- active draw target: lime
- completed station: selected line-color subway-sign style
- visual `01 노선 / 02 역 / 03 음식` strip hidden
- headline:
  - `어디로 가볼까?`
  - `어느 역에서 내릴까?`
  - `식사도 해야지?`
  - `이 코스로 가자!`
- in-card refresh: 27px / stroke 2.7 / 36px hit area
- food pending: `뭐 먹을까?`
- actions: `복사 / 네이버지도 / 구글지도` one row
- copy: `${역}에서 ${음식} 먹자!`

## 4. Attraction architecture

Attractions are first-party static curation, max 0–2, no live Google attraction Text Search.

Current merge priority:

**base → station adjustments → extra → local → ID dedupe → max2 → tier attachment**

Files:
- `curated-attractions-base.ts`: established strong seed
- `curated-attractions-adjustments.ts`: sparse station-specific priority overrides; currently used for Yongsan
- `curated-attractions-extra.ts`: browse-worthy expansion
- `curated-attractions-local.ts`: broader local streets/markets/sizeable parks/campuses/culture/sports; 60+ extra station keys
- `curated-attraction-tiers.ts`: visual prominence classifier
- `curated-attractions.ts`: public merge entry

Coverage intentionally includes distinctive commercial/food/cafe streets, markets, sizeable parks/waterfronts, campuses, culture/sports/exhibition anchors and large browse-worthy retail destinations. Tiny playgrounds and generic weak neighborhood facilities remain excluded. Zero results is still valid.

### Yongsan adjustment

- `l1:용산`, `gc:용산` → `아이파크몰 용산 + 용리단길`
- 용리단길 map target: `용리단길 서울 용산구 한강로2가`
- 신용산 keeps `용리단길 + 아모레퍼시픽미술관`

## 5. Attraction visual tiers

Internal only: `gold | silver | standard`. Tier names are never printed.

- Gold: nationally iconic / destination-grade
- Silver: strong city/region destination or nationally known niche place
- Standard: worthwhile local stop

Current audited classifier (2026-09-16):
- Gold IDs: **28**
- Silver IDs: **84**
- all other surfaced IDs: Standard

Gold representative set now includes 경복궁, 청계천, 국립중앙박물관, DDP, 홍대, 성수 연무장길, 서울숲, 반포한강공원, 석촌호수, 롯데월드타워, 올림픽공원, 코엑스, 서울대공원, 에버랜드, 두물머리, 남한산성, 임진각 평화누리, 송도 센트럴파크, 인천 차이나타운/개항장거리.

Silver representative set includes 가로수길, 용리단길, 대학로, 북서울꿈의숲, 서대문형무소역사관, 동묘, 신당동 떡볶이타운, 신림동 순대타운, 마장축산물시장, 고척스카이돔, 잠실종합운동장, 모란민속5일장, 정릉·동구릉, 인천대공원, 안산 다문화음식거리, 한국만화박물관, 강촌유원지, 춘천 명동 닭갈비골목, 보정동 카페거리, 라베니체 등.

Intentional Standard demotions include 서울로7017, 양재시민의숲, 용마폭포공원, 양화한강공원, 일자산 허브천문공원, 인천중앙공원, 삼패한강공원, 은계호수공원, 화계사, 동백호수공원, 롯데백화점 동탄점. Demotion does not remove the recommendation; only metallic emphasis disappears.

Visuals:
- gold metallic border + sheen + first-arrival gold pulse
- silver metallic border + sheen + first-arrival silver pulse
- standard neutral borderless
- signature guard prevents replay on ordinary rerender
- reduced-motion disables motion

Full rationale: `docs/ATTRACTION_TIER_AUDIT.md`.

## 6. Map target integrity

- attraction lat/lng 별도 저장 없음
- self-contained `mapQuery`
- station suffix auto-append 금지
- ambiguous targets get city/district/road/address context
- broad paths/waterfronts use concrete access anchor where necessary
- wrong pin risk > omit

Representative: 검암 → `경인아라뱃길 시천가람터` / `시천가람터 인천광역시 서구 시천동 158-11`.

## 7. Restaurant policy

- live Google Places candidates
- explicit `추천 식당 보기` only
- hard 2 km
- max 20 → TOP 3
- Bayesian rating 55%, review log 25%, relevance 15%, distance 5%
- Google rating/review results not persisted as own reusable DB

## 8. Station centers

- `station-coordinates.ts` static first
- missing only → Google fallback
- fallback 30-day cache

## 9. Latest verified snapshot

### Web
- audited tier source head: `ef6eb1dcfd8b6d7823c5607a7cb2532c53db8a8d`
- CI `35102781290` — success
- Web Release `35102781339` — success
- deployment commit `006eafb1070a36a1a0041c1d91125d2ba7697c2f`
- public bundle `assets/modular-Coke_hQH.js`
- Pages `35102843979` — success

### Android
- audited tier source head: `100f5e485221fd4dbc3915746cfa72fceed98526`
- Android CI `35102822357` — success
- APK `random-seoul-latest.apk`
- size `11,419,580` bytes
- SHA-256 `f62636ec46df889921a107752012feccf27da8568deb6fe61080728763f3581f`

Direct APK:
`https://github.com/momone3131/RandomSelect_Seoul_subway_station/releases/download/android-dev-latest/random-seoul-latest.apk`

## 10. Build/deploy

Web Release: tests → build → browser smoke → verified root promotion → deployment commit → Pages.

Android: shared tests → native Web build → Capacitor sync → Gradle debug APK → artifact → fixed latest Release.

## 11. Source-of-truth docs

- `PROJECT_CONTEXT.md`: fast handoff
- `STATUS.md`: current facts / verification
- `PROJECT_PLAN.md`: product intent
- `ARCHITECTURE.md`: data flow/modules
- `ATTRACTION_CURATION.md`: selection/map/tier rules
- `ATTRACTION_TIER_AUDIT.md`: latest full prominence audit

Conflict priority: **actual code/Git > STATUS > ARCHITECTURE/PROJECT_PLAN > PROJECT_CONTEXT/README**.
