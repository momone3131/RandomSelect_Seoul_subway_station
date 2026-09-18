# Random Seoul — Project Plan

Last updated: 2026-09-18

이 문서는 Random Seoul의 제품 방향과 변경 불가 원칙을 기록합니다. 최신 구현/검증 상태는 `STATUS.md`, 구조는 `ARCHITECTURE.md`를 우선 확인합니다.

## 1. Product goal

사용자가 별도 계획 없이 몇 번의 랜덤 선택만으로 서울/수도권 외출 코스를 정하게 합니다.

Current flow:
1. 지하철 노선 랜덤
2. 해당 노선 역 랜덤
3. 음식/주류 종목 랜덤
4. 선택 역의 first-party 추천 명소 0~2곳 즉시 표시
5. 사용자가 원할 때만 주변 추천 장소 조회
6. Google Places live candidates → shared ranking → TOP3
7. result settle 후 smooth scroll / 지도 이동

Live place lookup은 추첨의 필수 대기 단계가 아닙니다.

## 2. Non-negotiable requirements

- 앱 이름 **Random Seoul**
- Android가 현재 주 개발/배포 대상
- Web은 정식 지원 + 공통 UX reference target
- Android 안정화 후 iOS 지원
- draw/data/filter/ranking 공통 로직은 shared TypeScript
- native code는 Places, 지도, 공유, 햅틱, back handling 등 플랫폼 의존 기능 위주
- GPS/current-location permission은 현재 요구하지 않음
- 설명 문구 최소화, 모바일 touch target/가독성 유지
- repo docs만으로 다음 세션에서 맥락 복구 가능해야 함

## 3. Food / drink draw model

Food scope는 **42종**을 동일 확률의 draw categories로 취급합니다.

- meal-oriented 36종
- alcohol-primary 6종: 이자카야 / 와인바 / 칵테일바 / 수제맥주·펍 / 전통주·막걸리주점 / 위스키바

Alcohol-primary의 기준은 “술도 파는가”가 아니라 **술을 마시는 것이 방문의 주요 목적이 되는 업종인가**입니다. 따라서 치킨, 고기구이, 양꼬치 등은 일반 food category로 유지합니다.

Food settings:
- 전체 선택 / 전체 해제 유지
- dynamic `주류 포함 / 주류 제외` preset 제공
- 주류 포함/제외는 6개 alcohol IDs만 일괄 toggle하고 다른 선택은 보존

Saved preference policy:
- legacy full-36 = 과거 전체선택으로 보고 full-42로 migrate
- custom subset = 사용자 의도 보존, alcohol 자동 주입 금지

## 4. Live recommendation policy

### Meal categories
- CTA: `추천 식당 보기`
- category query 기반 Google Places

### Alcohol-primary categories
- CTA: `추천 술집 보기`
- alcohol-oriented query/type gate
- result/copy wording도 술집 문맥 사용

Both share:
- explicit user request only
- hard station radius 2 km
- max20 candidates
- TOP3 shared ranking
- Bayesian rating 55%
- review log 25%
- Google relevance 15%
- distance 5%
- provider result/rating/review를 own reusable long-term DB로 축적하지 않음

## 5. Attractions

- first-party curated static data
- no live Google attraction Text Search
- station max0–2
- no forced fill
- 랜덤 결과 바로 아래 compact surface로 우선 노출
- 작은 놀이터·평범한 근린시설 제외
- 동일한 실제 환승역은 어느 노선에서 뽑혀도 동일한 curated attraction 결과 유지; 동명이역은 분리

Prominence tier:
- Diamond / Gold / Silver / Standard
- tier name not shown
- Diamond fixed 4: 경복궁 / 국립중앙박물관 / 롯데월드타워 / 북촌한옥마을

Orthogonal Nightscape feature:
- tier와 독립적으로 overlap 가능
- definition: 높은 곳에서 도시 불빛/스카이라인을 내려다보는 것이 밤 방문의 주목적인 전망 목적지
- night-sky card interior only; tier outer border/effect preserved

## 6. Mobile result-flow policy

**노선 / 역 / 음식·주류 → 추천 명소 → 명시적 추천 장소 CTA**

- attractions max2; 0이면 section 숨김
- CTA click 후 loading
- empty results로 선-scroll 금지
- settle 후 recommendation section smooth scroll
- 사용자가 추천 장소를 원하지 않으면 Places call 자체 생략

## 7. Visual / interaction direction

- result/action 중심, 설명 copy 최소화
- passive neutral palette 유지
- active draw lime + completed station actual line color 유지
- Diamond gemstone, Gold/Silver metallic
- Nightscape background is independent composition layer
- visual progress strip 숨김
- stage-aware headline + active card로 진행상태 전달
- random settle reveal + Android haptic 유지

## 8. Delivery strategy

- Shared modular Web: 운영 중
- Android shell: 주 개발 대상
- Native Places adapter: platform bridge + shared ranking
- Android UX/release: 계속 진행
- iOS: Android 안정화 이후 shared core 재사용

## 9. Long-term visit loop

Current status: **Phase 1 + Phase 2 implemented / verified on Web + Android**.

기본 개발 순서:

1. **방문 기록 분리 저장** — 완료
2. **발자취 지도** — 완료; physical station 단위 pin / 방문 세부기록
3. **안 가본 역 우선·제외 랜덤** — 다음 단계; 기본 완전 랜덤은 유지
4. **간단한 방문 통계** — 이후; 고유 방문 역/노선별 진행도 등

상세 source of truth: `docs/VISIT_HISTORY_PLAN.md`.

Phase 1 규칙:
- 최근 추첨 기록 삭제는 실제 방문 기록을 삭제하지 않음
- 음식/명소는 뽑혔다는 이유만으로 자동 방문 처리하지 않음
- 음식 후보는 당시 추첨 종목 하나만; Google 추천 식당은 저장 후보가 아님
- 명소 후보는 당시 화면에 노출된 명소만; 복수 선택 가능
- 역 방문만 단독 저장 가능
- 방문일은 선택사항

## 10. Documentation change control

다음 변경은 docs에 동기화합니다:
- product flow/platform roles
- category taxonomy/alcohol feature
- Places timing/provider/filter policy
- ranking/distance
- attraction curation/tier/Nightscape
- app identifier/brand
- deployment structure
- core UI/interaction policy

Priority: **actual code/Git > STATUS > ARCHITECTURE/PROJECT_PLAN > PROJECT_CONTEXT/README**.
