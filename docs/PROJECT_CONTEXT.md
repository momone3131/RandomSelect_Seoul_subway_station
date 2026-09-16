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
- headline: `어디로 가볼까? → 어느 역에서 내릴까? → 식사도 해야지? → 이 코스로 가자!`
- in-card refresh: 27px / stroke 2.7 / 36px hit area
- food pending: `뭐 먹을까?`
- actions: `복사 / 네이버지도 / 구글지도` one row
- copy: `${역}에서 ${음식} 먹자!`

## 4. Attraction architecture

Attractions are first-party static curation, max 0–2, no live Google attraction Text Search.

Merge priority:

**base → station adjustments → extra → local → ID dedupe → max2 → tier + orthogonal feature attachment**

Files:
- `curated-attractions-base.ts`: established strong seed
- `curated-attractions-adjustments.ts`: sparse station-specific priority overrides; currently used for Yongsan
- `curated-attractions-extra.ts`: browse-worthy expansion
- `curated-attractions-local.ts`: broader local streets/markets/sizeable parks/campuses/culture/sports; 60+ extra station keys
- `curated-attraction-tiers.ts`: Diamond/Gold/Silver/Standard prominence classifier
- `curated-attraction-features.ts`: orthogonal features such as Nightscape
- `curated-attractions.ts`: public merge entry

Tiny playgrounds and generic weak neighborhood facilities remain excluded. Zero results is valid.

### Yongsan adjustment

- `l1:용산`, `gc:용산` → `아이파크몰 용산 + 용리단길`
- 용리단길 map target: `용리단길 서울 용산구 한강로2가`
- 신용산 keeps `용리단길 + 아모레퍼시픽미술관`

## 5. Attraction prominence tiers

Internal only: `diamond | gold | silver | standard`. Tier names are never printed.

Current classifier:
- **Diamond 4**
- **Gold 24**
- **Silver 85**
- all other surfaced IDs Standard

### Diamond

Ultra-rare jackpot tier fixed to exactly four:
- 경복궁
- 국립중앙박물관
- 롯데월드타워
- 북촌한옥마을

Visual is gemstone, not metal:
- 3px icy cyan / sky-blue / white / pale-violet prism border
- `4.2s` moving prism + `3.4s` facet sparkle
- `1.8s` strong first-arrival multi-stage reveal
- peak scale `1.075`, `16px` cyan ring, roughly `42–58px` glow
- signature guard prevents replay; reduced-motion disables motion

### Gold / Silver / Standard

- Gold: nationally iconic / destination-grade; metallic gold
- Silver: strong city/region destination or nationally known niche place; metallic silver
- Standard: worthwhile local stop; borderless neutral

Latest tier correction:
- 서소문성지역사박물관 was already Silver.
- 서울 석촌동 고분군 promoted Standard → Silver.

Full rationale: `docs/ATTRACTION_TIER_AUDIT.md`.

## 6. Nightscape — orthogonal attraction feature

Nightscape is **not a fifth tier**. It can overlap any prominence tier.

Source: `src/data/curated-attraction-features.ts`.

Current conservative set (10):
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

Rules:
- 밤에 가는 것 자체가 분명한 방문 이유인 곳만 tag
- seasonal-only 야간개장/축제는 static tag에서 제외
- feature is rendered as **interior background**, never as the tier border
- dark navy → indigo/purple sky, small star points, subtle warm city-light glow
- no visible `야경` badge/text
- tier border remains simultaneously visible, so Diamond + Nightscape, Gold + Nightscape, Silver + Nightscape all work

`AttractionRecommendation` has optional `nightscape?: boolean`; `getCuratedAttractions()` attaches it from the feature classifier. Render signature includes night/plain state.

## 7. Map target integrity

- attraction lat/lng 별도 저장 없음
- self-contained `mapQuery`
- station suffix auto-append 금지
- ambiguous targets get city/district/road/address context
- broad paths/waterfronts use concrete access anchor where necessary
- wrong pin risk > omit

Representative: 검암 → `경인아라뱃길 시천가람터` / `시천가람터 인천광역시 서구 시천동 158-11`.

## 8. Restaurant policy

- live Google Places candidates
- explicit `추천 식당 보기` only
- hard 2 km
- max 20 → TOP 3
- Bayesian rating 55%, review log 25%, relevance 15%, distance 5%
- Google rating/review results not persisted as own reusable DB

## 9. Latest verified snapshot

### Web — Nightscape release
- source/regression head `b35c2be8e1182343929655e869ff234c649f082a`
- CI `35112696311` — success
- Web Release `35112696302` — success
- public bundle `assets/modular-BRia8hmx.js`
- Pages `35112694619` — success
- public bundle directly checked for 10 Nightscape IDs, overlap rendering, night-sky CSS and Silver promotion

### Android — Nightscape release
- source head `398a272fa3ef04ad7970393ff105b6a6e1e6a844`
- Android CI `35113150949` — success
- APK `random-seoul-latest.apk`
- size `11,421,500` bytes
- SHA-256 `34519dcf9396e655cbee49e8ad547660df3d55040becafd1c0ff4b42ce46e338`

Direct APK:
`https://github.com/momone3131/RandomSelect_Seoul_subway_station/releases/download/android-dev-latest/random-seoul-latest.apk`

## 10. Build/deploy

Web Release: tests → build → browser smoke → verified root promotion → Pages.

Android: shared tests → native Web build → Capacitor sync → Gradle debug APK → artifact → fixed latest Release.

## 11. Source-of-truth docs

- `PROJECT_CONTEXT.md`: fast handoff
- `STATUS.md`: current facts / verification
- `PROJECT_PLAN.md`: product intent
- `ARCHITECTURE.md`: data flow/modules
- `ATTRACTION_CURATION.md`: selection/map/tier/feature rules
- `ATTRACTION_TIER_AUDIT.md`: prominence audit

Conflict priority: **actual code/Git > STATUS > ARCHITECTURE/PROJECT_PLAN > PROJECT_CONTEXT/README**.
