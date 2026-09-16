# Random Seoul — Project Context / Handoff

Last updated: 2026-09-17

새 채팅/개발 세션은 **live GitHub → STATUS → ARCHITECTURE/PROJECT_PLAN → 이 문서** 순으로 최신성을 확인합니다.

## 1. Product

Random Seoul은 서울/수도권에서 `노선 → 역 → 음식/주류 종목`을 랜덤으로 정하고, 역 주변 first-party 추천 명소 0~2곳을 즉시 보여주는 외출 앱입니다.

추천 장소 검색은 추첨과 분리되어 있습니다. 일반 음식은 `추천 식당 보기`, 주류 전용 종목은 `추천 술집 보기`를 사용자가 눌렀을 때만 Google Places live 후보를 조회합니다. Hard radius 2 km, max20 후보를 shared ranking으로 TOP3까지 줄입니다.

## 2. Platform roles

- Android: 현재 주 개발/배포 target, branch `feature/random-seoul-android`, app id `io.github.momone3131.randomseoul`
- Web: `main`에서 계속 배포되는 정식 지원 target + 공통 UX reference
- iOS: Android 안정화 이후 shared core 재사용 예정

## 3. Food / alcohol model

Food draw total: **42 categories**.

- 기존 meal-oriented categories: 36
- alcohol-primary categories: 6
  - 이자카야
  - 와인바
  - 칵테일바
  - 수제맥주·펍
  - 전통주·막걸리주점
  - 위스키바

Source:
- `src/data/food-categories.ts`
- `src/data/food-category-features.ts`

Alcohol-primary means drinking itself is a primary destination purpose. Chicken, pork/beef grill, lamb skewers etc. are not alcohol categories merely because they sell alcohol.

Food settings has a dynamic `주류 제외 / 주류 포함` preset:
- if any alcohol ID is selected → shows `주류 제외`, removes all 6
- if none are selected → shows `주류 포함`, adds all 6 while preserving existing selections
- `전체 선택 / 전체 해제` remain

Persistence migration:
- previous exact full-36 selection migrates to full-42
- custom/narrow saved food selections are preserved without automatic alcohol injection

Alcohol search uses the same explicit lookup/ranking flow but uses an alcohol-oriented candidate type gate. UI copy switches to `추천 술집 ...` and copy result uses `${역}에서 ${주류종목} 가자!` instead of `먹자!`.

## 4. Attraction architecture

Attractions are static first-party curation, max0–2, no live attraction Text Search.

Merge priority:

**base → station adjustments → extra → local → night-viewpoints → ID dedupe → max2 → tier/feature attachment**

The `night-viewpoints` layer is last so it can fill a spare slot without pushing out an established stronger recommendation.

Current prominence:
- Diamond 4
- Gold 25
- Silver 88
- remaining surfaced IDs Standard

Diamond fixed: 경복궁 / 국립중앙박물관 / 롯데월드타워 / 북촌한옥마을.

## 5. Nightscape feature

Nightscape is independent from prominence, not a fifth tier.

Definition: **elevated destination where looking over city lights after dark is itself a main reason to visit.**

Current 12:
N서울타워 / 낙산공원 / 응봉산 팔각정 / 달맞이봉공원 / 매봉산 팔각정 / 용왕산 스카이워크 / 삼성해맞이공원 / 용마산 스카이워크 / 용양봉저정공원 / 롯데월드타워 / 남한산성 서문 전망대 / 수원화성 서장대.

DDP, 노들섬, 반포한강공원, 세빛섬, 석촌호수, 송도 센트럴파크, 광교호수공원, 라베니체 are not Nightscape, while their ordinary attraction recommendation/tier remains.

Nightscape changes the card interior to dark navy/indigo/purple night sky; prominence tier still owns the outer border/effect.

## 6. Latest verified snapshot

### Web
- functional source head `82960fbfcd9131709d7302ee3b3e5a991f8662d3`
- CI `35156095117` — success
- Web Release `35156095108` — success
- deployment commit `306b5e787b6bc7fd42c3905f65bfa5e7efea8040`
- Pages `35156142207` — success
- public bundle `assets/modular-DjJ7bZur.js`

### Android
- source head `219a392b203cebd67960c53f4a263f491da7bd2e`
- Android CI `35156192849` — success
- APK `random-seoul-latest.apk`
- size `11,423,212` bytes
- SHA-256 `8ff7f1f16ccbd97218e7331dfd9360cf1bbb4dded05640def5158d06cc990891`

Direct APK:
`https://github.com/momone3131/RandomSelect_Seoul_subway_station/releases/download/android-dev-latest/random-seoul-latest.apk`

## 7. Source-of-truth docs

- `STATUS.md`: latest verified facts
- `ARCHITECTURE.md`: data flow/modules
- `PROJECT_PLAN.md`: product intent
- `ATTRACTION_CURATION.md`: attraction rules
- `ATTRACTION_TIER_AUDIT.md`: prominence audit

Conflict priority: **actual code/Git > STATUS > ARCHITECTURE/PROJECT_PLAN > PROJECT_CONTEXT/README**.
