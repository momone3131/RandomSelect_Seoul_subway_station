# Random Seoul — Project Context / Handoff

Last updated: 2026-09-15

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
7. 결과가 준비되면 추천 식당 섹션으로 부드럽게 자동 스크롤
8. 지도 앱/웹으로 이동

중요: **음식이 선택됐다고 식당 API를 자동 호출하지 않는다.** 랜덤 결과와 추천 명소가 1차 결과이며 식당은 opt-in 2차 정보다.

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
- Android 공통 기능/UX를 빠르게 검증하는 reference implementation
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

완료 화면 우선순위:

**노선 / 역 / 음식 → 추천 명소 → 추천 식당 보기**

- attraction section은 `.panels` 바로 뒤
- 최대 2개 compact cards; 0개면 section 생략
- restaurant CTA 전에는 `recommendations` 비어 있음
- search 완료 후 restaurant section으로 smooth scroll

## 5. Main interaction / visual contract

### Stage-aware headline

`#page-title`은 상태에 따라 바뀝니다.

- initial: `어디로 가볼까?`
- line selected: `어느 역에서 내릴까?`
- station selected: `식사도 해야지?`
- food selected: `이 코스로 가자!`

시간을 특정하는 `오늘` 표현은 headline에서 사용하지 않습니다.

### Draw cards

- next-result card 자체가 primary draw target
- completed line/station/food cards의 우측 상단 ↻로 해당 단계부터 부분 재추첨
- refresh visual: 27 px / 2.7 stroke, transparent 36 px hit area
- upstream redraw는 downstream result/attractions/recommendations를 기존 controller semantics대로 초기화

### Station result

완료 역은 실제 지하철 역명판 문법을 단순화한 형태입니다.

- selected line color rounded frame
- white interior
- left circular line-color badge
- badge number = selected line list에서의 ordinal (“몇 번째 역”), 공식 역번호 아님
- badge + station name vertically centered
- station name: desktop 28 px / mobile 23 px / small phone 21 px
- long name: 23 / 18 / 16 px fallback

### Food pending

- 음식 선택 전 항상 `뭐 먹을까?`
- 아직 food stage가 아니면 희미하게
- food stage가 되면 선명하게
- 기존 food-card 높이는 늘리지 않음

### Utility actions / copy

역 선택 이후 `복사 / 네이버지도 / 구글지도`는 한 행 3-column으로 표시합니다.

복사 payload:

- station + food → `${역}에서 ${음식} 먹자!`
- station only → `${역} 가자!`
- line/ordinal/examples/추천식당 이름은 복사하지 않음

## 6. Restaurant policy

- live Google Places candidates
- user-triggered lookup only
- hard distance 2 km
- max candidate 20 → TOP 3
- shared ranking: Bayesian rating 55%, review log 25%, Google relevance 15%, distance 5%
- Google rating/review-derived results를 reusable DB로 영구 저장하지 않음

## 7. Attraction policy

- first-party static curated data, max 0–2
- Google attraction Text Search 없음
- 유명세보다 browse/stay value + 역 접근성
- browse-worthy malls/IKEA/Starfield/outlets/department stores 가능
- 약한 근린시설 제외
- forced fill 금지

Data:
- `curated-attractions-base.ts`
- `curated-attractions-extra.ts`
- `curated-attractions.ts` merge/dedupe/max2

Map target:
- attraction lat/lng 별도 저장하지 않음
- `mapQuery`가 self-contained target
- station name 자동 suffix 금지
- ambiguous target은 주소/지역/도로로 보강

## 8. Station centers

- `station-coordinates.ts` static first
- 없는 역만 live Google fallback
- fallback 30-day cache

## 9. Latest verified snapshot

### Public Web

- source/regression head: `8ea433d6f2920eabd1e9de936086a3590a732493`
- main CI: `34978299548` — success
- Web Release: `34978299383` — success
- deployment commit: `bba8f6a7c49ada8726dc22a81116036e96af9e3d`
- public bundle: `assets/modular-D8hThyDO.js`
- GitHub Pages: `34978360339` — success

### Android

- branch/source head: `ced9c95f9f99c931e8b469d4cd4508d1ad078b83`
- Android CI: `34978567418` — success
- APK: `random-seoul-latest.apk`
- size: `11,412,808` bytes
- SHA-256: `71604b2bf31336777644e431bb6d66b1767a0b77a13f7c0128781417476b2e2a`

Direct fixed URL:
`https://github.com/momone3131/RandomSelect_Seoul_subway_station/releases/download/android-dev-latest/random-seoul-latest.apk`

## 10. Build/deploy notes

Web Release: tests → build → browser smoke → verified root promotion → deployment commit → GitHub Pages.

Android CI: shared tests → native Web build → Capacitor sync → Gradle debug APK → artifact → fixed latest Release.

`src/ui/subway-sign-overrides.css` is a permanent source stylesheet and `scripts/extract-legacy-shell.mjs` combines it with the base/mobile CSS into generated legacy shell assets.

## 11. Documentation source of truth

- `README.md`: entry/download links
- `PROJECT_CONTEXT.md`: fast handoff
- `STATUS.md`: current implementation + verification
- `PROJECT_PLAN.md`: product intent/policy
- `ARCHITECTURE.md`: data flow/modules/platform boundaries
- `ATTRACTION_CURATION.md`: attraction editorial/map target rules

Conflict priority: **actual code/Git > STATUS > ARCHITECTURE/PROJECT_PLAN > PROJECT_CONTEXT/README**.

## 12. Session restart checklist

1. inspect live GitHub main + Android branch/PR
2. read `PROJECT_CONTEXT.md`
3. read `STATUS.md`
4. relevant architecture/plan/curation docs
5. inspect actual source/CI before editing
6. synchronize shared changes to Web + Android when applicable
7. verify Web Release/public bundle/Pages separately
8. verify Android fixed Release if APK changes
9. update durable docs for meaningful changes
