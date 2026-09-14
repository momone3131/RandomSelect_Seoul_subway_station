# Random Seoul — Architecture

Last updated: 2026-09-14

## 1. Architecture goals

Random Seoul은 Web / Android / iOS가 같은 제품 로직을 공유하도록 설계합니다.

핵심 원칙:

- 추첨/데이터/상태/식당 랭킹은 플랫폼 독립적인 TypeScript
- Web/Android/iOS 차이는 adapter/service 경계 뒤로 숨김
- Android Java/Kotlin과 iOS Swift는 가능한 한 얇게 유지
- Web은 앱 출시 후에도 정식 타깃으로 유지
- 식당 추천은 실시간 Google Places 후보를 shared TypeScript에서 필터링/랭킹
- 대표/둘러보기 좋은 장소와 가능한 역 좌표는 자체 정적 데이터로 소유해 불필요한 Google 호출을 줄임

## 2. Repository structure

```text
Random Seoul
├─ src/
│  ├─ data/
│  │  ├─ subway-lines.ts
│  │  ├─ food-categories.ts
│  │  ├─ curated-attractions.ts        # public merge/lookup entry
│  │  ├─ curated-attractions-base.ts   # 기존 검증 시드
│  │  ├─ curated-attractions-extra.ts  # browse-worthy 확장 데이터
│  │  └─ station-coordinates.ts
│  ├─ domain/
│  │  ├─ types.ts
│  │  ├─ draw-engine.ts
│  │  ├─ station-resolver.ts
│  │  └─ restaurant-ranking.ts
│  ├─ services/
│  │  ├─ places/
│  │  ├─ maps/
│  │  └─ storage/
│  ├─ state/
│  ├─ ui/
│  ├─ platform/
│  └─ main.ts
├─ native/
├─ tests/
├─ android/
├─ ios/
├─ index.html
├─ modular.html
├─ vite.config.ts
├─ capacitor.config.ts
└─ .github/workflows/
```

## 3. Shared place model and provider boundary

`PlaceCandidate`는 Google Places 등 외부 provider에서 받은 식당 후보를 shared core로 넘기는 공통 모델입니다.

구현체:

- Web: Google Maps JavaScript Places
- Android: Capacitor bridge → Places SDK for Android
- iOS: later native Places bridge

플랫폼 SDK는 후보 데이터를 반환하는 역할만 맡고 식당 순위는 결정하지 않습니다.

## 4. Restaurant ranking ownership

`restaurant-ranking.ts`가 공통 식당 랭킹을 단독 소유합니다.

현재 규칙:

1. 역과의 직선거리 2 km 초과 후보 제거
2. 별점 Bayesian 보정
3. 평가 수 `log(1 + n)` 변환
4. Google 검색 순위 relevance signal
5. 거리 signal
6. TOP 3 반환

가중치:

- Bayesian rating 55%
- review volume 25%
- relevance 15%
- distance 5%

식당 결과는 Google에서 실시간 조회하며 TOP 3 결과/별점/리뷰수를 자체 추천 DB로 영구 저장하지 않습니다.

## 5. Curated nearby attractions

역 주변 볼거리는 Google Places 검색/리뷰 수 threshold로 선정하지 않습니다.

공통 TypeScript 정적 데이터가 **역별 0~2곳**을 직접 소유합니다.

데이터 계층:

- `curated-attractions-base.ts`: 기존 Tier A/지역 목적지 시드
- `curated-attractions-extra.ts`: 이후 확장된 쇼핑·라이프스타일·시장·상권·문화·공원/수변 등 browse-worthy 목적지
- `curated-attractions.ts`: base → extra 순으로 합치고 attraction ID를 중복 제거한 뒤 최대 2개를 반환하는 유일한 public lookup entry

이 구조는 초기 데이터와 후속 확장 데이터를 분리해 큰 정적 파일의 유지보수 충돌을 줄이기 위한 것이며, UI/application 계층은 세부 데이터 파일을 직접 참조하지 않습니다.

규칙:

- 품질 gate는 자동 점수가 아니라 first-party editorial curation
- “전국구 명소인가?”가 아니라 “이 역에 갔을 때 30분~몇 시간 둘러볼 가치가 있는가?”를 기준으로 함
- 전통시장·특색 있는 거리·문화시설·공원뿐 아니라 스타필드/IKEA/대형 복합몰·아울렛·주요 백화점 같은 체류형 상업시설도 허용
- 일반 놀이터·아파트 앞 소공원·평범한 근린시설/마트/소형 상가는 제외
- 적절한 후보가 없으면 `[]`; 2개를 억지로 채우지 않음
- 한 역당 최대 2곳
- 역 추첨 직후 동기적으로 표시되어 네트워크 대기 없음
- 음식 재추첨과 무관
- 명소 Google Places Text Search 없음
- 명소 카드의 지도 버튼은 일반 Google Maps 검색 링크일 뿐 Places 데이터 저장소가 아님

`tests/curated-attractions.test.ts`는 대표 A/B 결과, 상한 2개, base+extra 보강 동작, 그리고 extra의 `노선:역` 키가 실제 `SUBWAY_LINES`에 존재하는지를 검증합니다.

따라서 과거 `attraction-ranking.ts`의 최소 리뷰 수/점수 기준은 제거되었습니다. 품질 gate는 **큐레이션 DB 등록 여부** 자체가 담당합니다.

## 6. Station center strategy

식당 검색의 위치 bias/거리 계산에는 역 중심 좌표가 필요합니다.

`src/data/station-coordinates.ts`를 먼저 조회합니다.

1. 정적 좌표가 있으면 즉시 사용 → Google station-resolution 호출 없음
2. 정적 좌표가 없는 신규/미수록 역만 기존 Google 역 검색 사용
3. fallback으로 얻은 Google 좌표는 기존 정책대로 30일 캐시

정적 좌표는 서울특별시/TOPIS의 `서울시 역사마스터 정보`와 같은 공공 역 마스터 데이터를 기준으로 관리합니다. 해당 서울 열린데이터는 공공누리 제1유형(출처표시, 상업적 이용 및 변경 가능)입니다.

현재 정적 테이블은 대표 명소가 있는 역과 주요 환승/사용 역부터 적용하며, 미수록 역은 기능 단절 없이 live fallback으로 동작합니다.

## 7. State ownership

`AppState`는 현재 line/station/food와 함께 다음 결과를 보유합니다.

- `attractions`: 현재 역의 0~2개 자체 큐레이션 볼거리
- `recommendations`: 현재 음식의 Google 기반 식당 TOP 3
- `history`: 최근 추첨 기록

UI는 상태를 표시하고 사용자 event를 전달하며, 추첨/식당 랭킹 규칙 자체를 소유하지 않습니다.

## 8. Storage boundary

- Web: localStorage
- Android/iOS: 현재 호환성 우선으로 WebView localStorage를 사용하며 native-backed storage는 필요 시 후속 전환

기존 Web localStorage key를 유지해 설정/기록 마이그레이션을 깨지 않습니다.

Google 식당 결과는 장기 캐시하지 않습니다. Google fallback 역 좌표 캐시는 기존 30일 정책을 유지합니다.

## 9. Platform services

플랫폼 차이는 adapter/plugin 뒤로 둡니다.

- haptics
- share
- back handling
- map launch/deep link
- native place search
- persistent storage

## 10. API key strategy

키는 플랫폼별로 분리합니다.

- Web key: GitHub Pages HTTP referrer 제한
- Android key: package name + signing certificate SHA 제한
- iOS key: bundle identifier 제한

공통 TypeScript에 production key를 하드코딩하지 않습니다.

## 11. Build and deployment targets

### Web

Maintained source entry는 `modular.html`입니다.

`npm run build` → Vite `dist/modular.html` + hashed JS assets를 생성합니다. `web-release.yml`이 tests → build → browser smoke를 통과한 artifact를 GitHub Pages root로 승격합니다.

### Android

Vite native build → Capacitor sync → Gradle build → APK/AAB.

### iOS

Vite native build → Capacitor sync → Xcode/cloud build.

## 12. Architecture decision maintenance

다음 변경은 구현과 같은 PR/change에서 문서화합니다.

- product flow
- ranking/filter thresholds
- Places provider/API
- curated attraction/station-coordinate data policy
- app identifier
- storage provider
- framework/platform dependency
- Web support/deployment strategy
