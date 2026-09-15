# Random Seoul — Project Context / Handoff

Last updated: 2026-09-15

이 문서는 새 채팅/개발 세션이 저장소만 보고도 Random Seoul을 이어갈 수 있도록 하는 빠른 인계 문서입니다. 실제 최신성은 **live GitHub → STATUS → ARCHITECTURE/PROJECT_PLAN → 이 문서** 순으로 확인합니다.

## 1. Product

**Random Seoul**은 별도 계획 없이 서울/수도권에서 어디로 가고 무엇을 먹을지 정해주는 랜덤 외출 앱입니다.

현재 사용자 흐름:

1. 노선 랜덤
2. 역 랜덤
3. 음식 랜덤
4. 해당 역의 first-party **추천 명소 0~2곳을 즉시 표시**
5. 사용자가 원하면 **`추천 식당 보기`** 탭
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

공통 로직 변경은 가능한 한 Web + Android에 동기화하고 각각 CI로 확인합니다.

## 4. Core architecture

- Vite + Vanilla TypeScript shared core
- Capacitor mobile shell
- draw/data/state/filter/ranking = shared TypeScript
- platform-specific Places/map/share/haptics/back = adapter/plugin
- GPS/current-location permission = 현재 없음

### Result-first UI

완료 화면 우선순위:

**노선 / 역 / 음식 → 추천 명소 → 추천 식당 보기**

- attraction section은 `.panels` 바로 뒤에 배치
- 최대 2개 compact cards, 모바일 2-column
- 0개면 section 생략
- restaurant CTA는 full-width touch target
- CTA 누르기 전 `recommendations`는 빈 상태
- search 중 현재 viewport 유지
- search 완료 후 `restaurant_section.scrollIntoView({ behavior: 'smooth' })`

## 5. Restaurant policy

- live Google Places candidates
- user-triggered lookup only
- hard distance 2 km
- max candidate 20 → TOP 3
- shared ranking:
  - Bayesian rating 55%
  - review volume log 25%
  - Google relevance 15%
  - distance 5%
- Google rating/review-derived results를 reusable DB로 영구 저장하지 않음

## 6. Attraction policy

- first-party static curated data, max 0–2
- Google attraction Text Search 없음
- 유명세보다 실제 browse/stay value + 역 접근성
- markets/streets/culture/parks/waterfronts + browse-worthy major malls/IKEA/Starfield/outlets/department stores 가능
- 약한 근린시설은 제외
- forced fill 금지

Data:
- `curated-attractions-base.ts`
- `curated-attractions-extra.ts`
- `curated-attractions.ts` merge/dedupe/max2

### Map-target rule

- attraction lat/lng는 별도 저장하지 않음
- `mapQuery`가 self-contained Google Maps target
- UI가 `${stationName}역`을 자동 추가하지 않음
- ambiguous target은 주소/지역/도로 정보로 보강
- 정확히 특정하기 어렵다면 제거

대표 수정:
- 검암: `경인아라뱃길 시천가람터` / `시천가람터 인천광역시 서구 시천동 158-11`
- 오목교 vague 상권 후보 제거

## 7. Station centers

- `station-coordinates.ts` static first
- 없는 역만 live Google fallback
- fallback 30-day cache
- station center는 restaurant search/distance용이며 attraction mapQuery와 별개

## 8. Current UI direction

- 설명형 문구 최소화
- main labels: `노선 / 역 / 음식`
- next-result card 자체가 primary draw button
- 일반 선/테두리 최소화, 색면과 spacing으로 hierarchy
- higher-contrast pastel palette
- active card만 강한 dark outline/hard depth
- press feedback + ~900ms settled result reveal
- Android result haptic 유지
- 작은 글자/터치 타깃을 억지로 축소하지 않음

## 9. Latest verified snapshot

### Public Web

On-demand restaurant flow verified:

- main CI: `34968413416` — success
- Web Release: `34968413412` — success
- deployment commit: `8c6c11d5876074b82ba3205342ec8f6a297c6e4d`
- public bundle: `assets/modular-Cb_D_SvS.js`
- GitHub Pages: `34968486363` — success

Browser self-test verifies:
- line/station/food completes
- recommendations remain empty before explicit request
- explicit restaurant request renders 3 recommendations
- 2 km contract
- reset flow

### Android

- branch head: `c56de64d43ae727552f30c337858675dd0f790d7`
- Android CI: `34968697499` — success
- latest dev APK source: same head
- APK: `random-seoul-latest.apk`
- size: `11,411,336` bytes
- SHA-256: `9766dde230dd0587eed6dddc7dba8093e5fda5d126c08003434ee2e214946e78`

Direct fixed URL:
`https://github.com/momone3131/RandomSelect_Seoul_subway_station/releases/download/android-dev-latest/random-seoul-latest.apk`

## 10. Build/deploy notes

Web Release path filter includes `src/**` and `tests/**`. It performs test → build → browser smoke → root promotion. Deployment commit fetches/rebases latest main before pushing.

Android CI performs shared tests → native Web build → Capacitor sync → Gradle debug APK → artifact → fixed latest Release.

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
7. verify Web Release/public bundle separately from ordinary CI
8. verify Android fixed Release if APK changes
9. update durable docs for meaningful changes
