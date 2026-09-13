# Random Seoul — Architecture

Last updated: 2026-09-13

## 1. Architecture goals

Random Seoul은 Web / Android / iOS가 같은 제품 로직을 공유하도록 설계합니다.

핵심 원칙:

- 추첨/데이터/상태/랭킹은 플랫폼 독립적인 TypeScript
- Web/Android/iOS 차이는 adapter/service 경계 뒤로 숨김
- Android Java/Kotlin과 iOS Swift는 가능한 한 얇게 유지
- Native Places SDK는 후보 데이터만 반환하고 최종 추천 판단은 공통 TypeScript가 수행
- Web은 앱 출시 후에도 정식 타깃으로 유지

## 2. Current repository structure

```text
Random Seoul
│
├─ src/
│  ├─ data/
│  │  ├─ subway-lines.ts
│  │  └─ food-categories.ts
│  ├─ domain/
│  │  ├─ types.ts
│  │  ├─ draw-engine.ts
│  │  ├─ station-resolver.ts
│  │  ├─ restaurant-ranking.ts
│  │  └─ attraction-ranking.ts
│  ├─ application/
│  │  └─ random-seoul-controller.ts
│  ├─ services/
│  │  ├─ places/
│  │  │  ├─ place-search.ts
│  │  │  ├─ google-web.ts
│  │  │  ├─ native-place-search.ts
│  │  │  └─ station-location.ts
│  │  ├─ maps/
│  │  └─ storage/
│  ├─ state/
│  │  └─ app-state.ts
│  ├─ ui/
│  │  ├─ draw-view.ts
│  │  ├─ attraction-view.ts
│  │  ├─ restaurant-view.ts
│  │  ├─ settings-view.ts
│  │  └─ history-view.ts
│  ├─ platform/
│  └─ main.ts
│
├─ android/
├─ tests/
├─ index.html
├─ capacitor.config.ts
└─ .github/workflows/
```

## 3. Shared place model

공통 로직은 Google SDK 객체를 직접 다루지 않고 `PlaceCandidate`로 정규화된 데이터만 사용합니다.

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
```

식당과 볼거리 모두 같은 후보 모델을 사용하고, 각 추천 목적에 맞는 별도 랭커가 후처리합니다.

## 4. Place search boundary

```ts
export interface PlaceSearchService {
  searchText(request: PlaceSearchRequest): Promise<PlaceCandidate[]>;
}
```

구현체:

- Web: Google Maps JavaScript Places
- Android: Capacitor bridge → Places SDK for Android
- iOS: 후속 native Places bridge

플랫폼 SDK는 후보 데이터를 반환하는 역할만 맡고 식당/볼거리 최종 순위를 결정하지 않습니다.

## 5. Recommendation ownership

### Restaurant ranking

`src/domain/restaurant-ranking.ts`가 단독 소유합니다.

1. 역과의 직선거리 2 km 초과 후보 제거
2. 별점 Bayesian 보정
3. 평가 수 `log(1 + n)` 변환
4. Google 검색 순위 기반 relevance signal
5. 거리 signal
6. 가중 합산
7. TOP 3 반환

가중치:

- Bayesian rating: 0.55
- review volume: 0.25
- relevance: 0.15
- distance: 0.05

### Attraction ranking

`src/domain/attraction-ranking.ts`가 단독 소유합니다.

역이 확정되면 한 번 검색하고, 관광/문화/역사/공원 계열 후보만 허용합니다. 추천할 만한 곳이 없으면 빈 배열을 반환해 UI 자체를 숨깁니다.

현재 규칙:

1. 역 기준 2 km 초과 제거
2. 허용된 attraction / museum / gallery / park / cultural / historical 계열만 사용
3. 평가 수 20개 미만 제거
4. relevance 45% + log(review count) 30% + distance 15% + rating 10%
5. 최소 종합점수 0.45 적용
6. 최대 2곳 반환

식당/볼거리 가중치와 quality gate는 실제 결과를 보고 조정할 수 있지만 변경 시 테스트와 문서를 같이 갱신합니다.

## 6. Product flow and asynchronous attraction search

메인 추첨 단계는 그대로 `line → station → food → new course`입니다.

볼거리 추천은 별도 랜덤 단계가 아닙니다.

```text
station finalized
   ├─ immediately render station result
   └─ background attraction Text Search (once)
        → shared attraction filter/ranking
        → 0 results: keep section hidden
        → 1–2 results: render attraction cards

food finalized
   └─ restaurant Text Search
        → shared restaurant filter/ranking
        → TOP 3
```

음식만 재추첨할 때는 볼거리 검색을 다시 호출하지 않습니다. 역이 바뀌면 이전 볼거리 상태를 비우고 새 역에 대해 다시 검색합니다. 검색 완료 시 현재 역이 여전히 같은지 검증해 오래된 비동기 결과가 새 역 화면에 들어오지 않게 합니다.

## 7. State ownership

대표 상태:

```ts
export interface AppState {
  preferences: AppPreferences;
  currentLine?: SubwayLine;
  currentStation?: SubwayStation;
  currentFood?: FoodCategory;
  attractions?: AttractionRecommendation[];
  recommendations: RestaurantRecommendation[];
  history: DrawHistoryItem[];
}
```

볼거리 결과는 현재 코스의 일시적 상태이며 별도 장기 캐시를 하지 않습니다. 기존 30일 캐시는 역 좌표에만 적용합니다.

## 8. Storage boundary

- Web: localStorage
- Android/iOS: 필요 시 Capacitor Preferences 또는 동등한 native-backed storage
- 기존 Web 설정/기록 키는 호환성을 위해 유지
- Google Places 식당/볼거리 결과를 요청 절감 목적으로 장기 캐시하지 않음

## 9. Platform services

플랫폼 차이는 adapter 뒤로 숨깁니다.

- haptics
- share
- back handling
- map launch/deep link
- native place search
- persistent storage

Android의 Google/Naver 지도 열기는 native intent를 사용하고, 공통 UI는 동일한 지도 링크 모델을 유지합니다.

## 10. API key strategy

키는 플랫폼별로 분리합니다.

- Web key: GitHub Pages HTTP referrer 제한
- Android key: package name + signing certificate SHA 제한
- iOS key: bundle identifier 제한

공통 TypeScript 소스에 production key를 하드코딩하지 않습니다.

## 11. Build targets

### Web

Vite build 결과를 GitHub Pages에 배포합니다.

### Android

Vite build → Capacitor sync → Gradle build → APK/AAB

### iOS

Vite build → Capacitor sync → Xcode/cloud build

## 12. Migration / maintenance rule

현재 루트 `index.html`은 배포 중인 Web 안정판입니다. Android 기능 개발 중에는 이를 임의로 교체하지 않습니다.

특히 다음 변경은 반드시 문서화합니다.

- 제품 흐름 또는 새 추천 종류
- 새로운 플랫폼 의존성
- 랭킹 로직/quality gate 이동 또는 변경
- storage provider 변경
- Places provider 변경
- framework 도입
- Web 지원 중단/축소
