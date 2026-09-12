# Random Seoul — Architecture

Last updated: 2026-09-12

## 1. Architecture goals

Random Seoul은 Web / Android / iOS가 같은 제품 로직을 공유하도록 설계합니다.

핵심 원칙:

- 추첨/데이터/상태/랭킹은 플랫폼 독립적인 TypeScript
- Web/Android/iOS 차이는 adapter/service 경계 뒤로 숨김
- UI가 `if (android)` / `if (ios)` 같은 분기를 직접 갖지 않게 함
- Android Kotlin과 iOS Swift는 가능한 한 얇게 유지
- Web은 앱 출시 후에도 정식 타깃으로 유지

## 2. Target repository structure

```text
Random Seoul
│
├─ src/
│  ├─ data/
│  │  ├─ subway-lines.ts
│  │  └─ food-categories.ts
│  │
│  ├─ domain/
│  │  ├─ types.ts
│  │  ├─ draw-engine.ts
│  │  ├─ station-resolver.ts
│  │  └─ restaurant-ranking.ts
│  │
│  ├─ services/
│  │  ├─ places/
│  │  │  ├─ place-search.ts
│  │  │  ├─ google-web.ts
│  │  │  └─ google-native.ts
│  │  ├─ maps/
│  │  │  └─ map-launcher.ts
│  │  └─ storage/
│  │     ├─ storage.ts
│  │     ├─ web-storage.ts
│  │     └─ native-storage.ts
│  │
│  ├─ state/
│  │  └─ app-state.ts
│  │
│  ├─ ui/
│  │  ├─ draw-view.ts
│  │  ├─ restaurant-view.ts
│  │  ├─ settings-view.ts
│  │  ├─ history-view.ts
│  │  └─ styles.css
│  │
│  ├─ platform/
│  │  ├─ platform.ts
│  │  ├─ haptics.ts
│  │  ├─ share.ts
│  │  └─ back-handler.ts
│  │
│  └─ main.ts
│
├─ native/
│  ├─ android/
│  │  └─ PlaceSearchPlugin.kt
│  └─ ios/
│     └─ PlaceSearchPlugin.swift
│
├─ tests/
│  ├─ draw-engine.test.ts
│  ├─ station-resolver.test.ts
│  └─ restaurant-ranking.test.ts
│
├─ android/
├─ ios/
├─ index.html
├─ capacitor.config.ts
├─ vite.config.ts
├─ package.json
└─ .github/workflows/
   ├─ web.yml
   └─ android.yml
```

초기 리팩터링에서는 필요한 파일만 먼저 만들고, 위 구조를 최종 목표로 점진적으로 이동합니다.

## 3. Shared domain model

대표 공통 타입:

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

공통 로직은 Google SDK 객체를 직접 다루지 않고 이 타입만 사용합니다.

## 4. Place search boundary

```ts
export interface PlaceSearchService {
  searchText(request: PlaceSearchRequest): Promise<PlaceCandidate[]>;
}
```

구현체:

- Web: Google Maps JavaScript Places
- Android: Capacitor bridge → Places SDK for Android
- iOS: Capacitor bridge → native iOS Places implementation

플랫폼 SDK는 후보 데이터를 반환하는 역할만 맡습니다.

## 5. Restaurant ranking ownership

랭킹은 **공통 TypeScript의 `restaurant-ranking.ts`가 단독 소유**합니다.

Native SDK가 최종 추천 순위를 결정하면 안 됩니다.

현재 규칙:

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

## 6. State ownership

```ts
export interface AppState {
  selectedLineIds: string[];
  selectedFoodIds: string[];
  currentLine?: Line;
  currentStation?: Station;
  currentFood?: Food;
  restaurantRecommendations: RestaurantRecommendation[];
  history: DrawHistory[];
}
```

UI는 상태를 표시하고 사용자 event를 전달하며, 상태 규칙 자체를 소유하지 않습니다.

## 7. Storage boundary

```ts
export interface StorageService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}
```

- Web: localStorage
- Android/iOS: Capacitor Preferences 또는 동등한 native-backed storage

## 8. Platform services

아래 기능은 adapter 뒤로 숨깁니다.

- haptics
- share
- back handling
- map launch/deep link
- native place search
- persistent storage

공통 UI/domain은 플랫폼 종류를 직접 판단하지 않는 것을 원칙으로 합니다.

## 9. API key strategy

키는 플랫폼별로 분리합니다.

- Web key: GitHub Pages HTTP referrer 제한
- Android key: package name + signing certificate SHA 제한
- iOS key: bundle identifier 제한

공통 TypeScript 소스에 production key를 하드코딩하지 않습니다.

## 10. Build targets

### Web

Vite build 결과를 GitHub Pages에 배포합니다.

### Android

Vite build → Capacitor sync → Gradle build → APK/AAB

### iOS

Vite build → Capacitor sync → Xcode/cloud build

## 11. Migration rule

현재 단일 `index.html`은 기능 기준선(baseline)입니다.

리팩터링 단계에서는:

- UI/동작을 의도적으로 변경하지 않음
- 각 기능을 옮긴 뒤 baseline과 비교
- 변경이 필요하면 별도 변경으로 분리
- 구조 분해 완료 전 `main` 웹 안정판을 교체하지 않음

## 12. Architecture decision maintenance

이 문서와 구현이 불일치하면 구현을 임의로 정당화하지 말고 문서 또는 코드를 명시적으로 수정합니다.

특히 다음 변경은 반드시 문서화합니다.

- 새로운 플랫폼 의존성
- 랭킹 로직 이동
- storage provider 변경
- Places provider 변경
- framework 도입
- Web 지원 중단/축소
