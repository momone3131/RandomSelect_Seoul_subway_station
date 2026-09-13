# Random Seoul — Architecture

Last updated: 2026-09-13

## 1. Architecture goals

Random Seoul은 Web / Android / iOS가 같은 제품 로직을 공유하도록 설계합니다.

핵심 원칙:

- 추첨/데이터/상태/랭킹은 플랫폼 독립적인 TypeScript
- Web/Android/iOS 차이는 adapter/service 경계 뒤로 숨김
- Android Java/Kotlin과 iOS Swift는 가능한 한 얇게 유지
- Web은 앱 출시 후에도 정식 타깃으로 유지
- Restaurant/attraction 후보 검색은 provider가 담당하고, 필터링/랭킹은 shared TypeScript가 담당

## 2. Repository structure

```text
Random Seoul
├─ src/
│  ├─ data/
│  ├─ domain/
│  │  ├─ types.ts
│  │  ├─ draw-engine.ts
│  │  ├─ station-resolver.ts
│  │  ├─ restaurant-ranking.ts
│  │  └─ attraction-ranking.ts
│  ├─ services/
│  │  ├─ places/
│  │  ├─ maps/
│  │  └─ storage/
│  ├─ state/
│  ├─ ui/
│  │  ├─ draw-view.ts
│  │  ├─ restaurant-view.ts
│  │  ├─ attraction-view.ts
│  │  ├─ settings-view.ts
│  │  └─ history-view.ts
│  ├─ platform/
│  └─ main.ts
├─ native/
├─ tests/
├─ android/
├─ ios/
├─ index.html              # committed GitHub Pages deployment artifact
├─ modular.html            # maintained Web source entry
├─ vite.config.ts
├─ capacitor.config.ts
└─ .github/workflows/
   ├─ ci.yml
   ├─ web-release.yml
   └─ android.yml
```

## 3. Shared place model and provider boundary

```ts
export interface PlaceCandidate {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  rating?: number;
  userRatingCount?: number;
  mapUrl?: string;
  searchRank: number;
}

export interface PlaceSearchService {
  searchText(request: PlaceSearchRequest): Promise<PlaceCandidate[]>;
}
```

구현체:

- Web: Google Maps JavaScript Places
- Android: Capacitor bridge → Places SDK for Android
- iOS: later native Places bridge

플랫폼 SDK는 후보 데이터를 반환하는 역할만 맡고 제품 순위는 결정하지 않습니다.

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

## 5. Nearby attraction ranking

역 추첨은 그대로 랜덤이며, 볼거리 추천은 **랜덤 단계가 아닌 보조 정보**입니다.

역이 확정되면 해당 역에 대해 Places Text Search를 한 번 수행하고 shared `attraction-ranking.ts`가 후보를 평가합니다.

현재 규칙:

- hard radius 2 km
- 관광명소/박물관/미술관/공원/문화/역사 등 허용 type만 대상
- 최대 2곳
- 최소 평가 수 20
- 최소 종합 score 0.45
- 약한 후보만 있으면 attraction UI 자체를 숨김
- 음식만 재추첨할 때 attraction search를 반복하지 않음
- 역이 바뀌면 이전 비동기 결과를 적용하지 않음

가중치:

- Google relevance 45%
- log(review count) 30%
- distance 15%
- rating 10%

## 6. State ownership

`AppState`는 현재 line/station/food와 함께 다음 결과를 보유합니다.

- `attractions`: 현재 역의 0~2개 볼거리 추천
- `recommendations`: 현재 음식의 식당 TOP 3
- `history`: 최근 추첨 기록

UI는 상태를 표시하고 사용자 event를 전달하며, 랭킹/추첨 규칙 자체를 소유하지 않습니다.

## 7. Storage boundary

- Web: localStorage
- Android/iOS: 현재 호환성 우선으로 WebView localStorage를 사용하며 native-backed storage는 필요 시 후속 전환

기존 Web localStorage key를 유지해 설정/기록 마이그레이션을 깨지 않습니다.

Places 식당/명소 결과 자체는 장기 캐시하지 않습니다. 역 좌표 캐시는 기존 30일 정책을 유지합니다.

## 8. Platform services

플랫폼 차이는 adapter/plugin 뒤로 둡니다.

- haptics
- share
- back handling
- map launch/deep link
- native place search
- persistent storage

## 9. API key strategy

키는 플랫폼별로 분리합니다.

- Web key: GitHub Pages HTTP referrer 제한
- Android key: package name + signing certificate SHA 제한
- iOS key: bundle identifier 제한

공통 TypeScript에 production key를 하드코딩하지 않습니다.

Web CI/release는 `VITE_GOOGLE_MAPS_API_KEY` secret이 있으면 우선 사용합니다. Secret이 없는 현재 migration 경로에서는 기존 공개 Web에 이미 배포되어 있던 **HTTP-referrer-restricted browser key**를 기존 `index.html` 또는 배포 JS bundle에서 읽어 build-time environment로 승계합니다. 키 값은 CI 로그에서 마스킹합니다. Android key와는 절대 공유하지 않습니다.

## 10. Build and deployment targets

### Web

Maintained source entry는 `modular.html`입니다.

`npm run build` → Vite `dist/modular.html` + hashed JS assets를 생성합니다.

GitHub Pages는 기존 branch-root 방식을 유지합니다. `.github/workflows/web-release.yml`이 `main`의 Web source 변경 시:

1. tests 실행
2. restricted Web Places key 주입
3. Vite build
4. deterministic browser smoke test
5. 검증된 `dist/modular.html`을 root `index.html`로 승격
6. 필요한 hashed JS assets를 root `assets/`에 갱신
7. deployment artifact commit을 `main`에 push

따라서 공개 URL은 바꾸지 않으면서 source와 배포 artifact를 분리합니다.

### Android

Vite native build → Capacitor sync → Gradle build → APK/AAB.

### iOS

Vite native build → Capacitor sync → Xcode/cloud build.

## 11. Migration status

초기 단일 `index.html`은 Phase 1/초기 Android 개발 동안 기능 기준선으로 보존했습니다.

2026-09-13부터 modular Web이 public GitHub Pages source-of-truth로 승격됩니다. Android native work 전체를 main에 합치지 않고, shared Web product 기능만 별도 Web deployment PR로 반영합니다.

## 12. Architecture decision maintenance

다음 변경은 구현과 같은 PR/change에서 문서화합니다.

- product flow
- ranking/filter thresholds
- Places provider/API
- app identifier
- storage provider
- framework/platform dependency
- Web support/deployment strategy
