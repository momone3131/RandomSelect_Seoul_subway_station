# Random Seoul — Project Context / Handoff

Last updated: 2026-09-14

이 문서는 **새 채팅, 새 개발 세션, 다른 AI/개발자가 저장소만 보고도 Random Seoul 개발을 즉시 이어갈 수 있도록 하는 인계 문서**입니다.

세부 계획은 `PROJECT_PLAN.md`, 구조는 `ARCHITECTURE.md`, 실제 진행 상태는 `STATUS.md`를 기준으로 하며, 이 문서는 그 셋을 빠르게 연결하는 프로젝트 요약입니다.

## 1. What this project is

**Random Seoul**은 사용자가 별도 계획 없이 서울/수도권에서 갈 곳과 먹을 것을 정할 수 있게 하는 랜덤 외출 코스 앱입니다.

기본 흐름:

1. 수도권 지하철 노선 랜덤 추첨
2. 해당 노선의 역 랜덤 추첨
3. 해당 역의 대표/둘러보기 좋은 장소 0~2곳 표시
4. 음식 종류 랜덤 추첨
5. 역 주변 실시간 식당 추천 TOP 3 표시
6. 지도 앱/웹으로 이동

핵심 경험은 “고민하지 않고 버튼 몇 번으로 오늘 갈 곳을 정한다”입니다.

## 2. Platform roles

### Android

- **현재 주 개발/배포 대상이자 앱 본체**
- 작업 브랜치: `feature/random-seoul-android`
- Capacitor Android shell + Places SDK for Android native bridge
- Android 전용 기능은 native adapter/plugin으로 한정

### Web

- `main` 브랜치에서 계속 배포되는 지원 대상
- **개발 중 기능을 빠르게 검증하는 기준 구현(reference implementation) 역할**도 함
- 프로젝트 소유자가 iPhone 사용자이므로 Android 기기 없이도 새 기능/UX를 직접 확인할 수 있는 검증 경로로 중요함
- Android와 가능한 한 동일한 shared TypeScript core를 사용

### iOS

- Android 안정화 이후 후속 대상
- shared core를 재사용하고 iOS 고유 adapter만 추가하는 방향

## 3. Repository and branch policy

Repository: `momone3131/RandomSelect_Seoul_subway_station`

- `main`: 안정 Web / 공통 코어 / 프로젝트 기준 문서
- `feature/random-seoul-android`: Android 앱 개발 브랜치
- 미완성 Android 작업을 `main` Web에 무리하게 섞지 않음
- 공통 코어 변경은 Web과 Android 양쪽 동작을 확인하고 동기화

새 작업을 시작할 때는 **반드시 현재 branch/PR/최근 commit을 GitHub에서 다시 확인**합니다. 이 문서의 commit hash나 상태 설명을 영구적인 사실로 가정하지 않습니다.

## 4. Core technical decisions

- Vite + Vanilla TypeScript shared core
- Capacitor 기반 모바일 shell
- 플랫폼별 SDK는 adapter/service/plugin 경계 뒤에 둠
- 추첨, 정적 데이터, 상태, 식당 필터/랭킹은 shared TypeScript가 소유
- Android/iOS에서 동일 비즈니스 로직을 Java/Kotlin/Swift로 복제하지 않음
- GPS/현재 위치 권한은 현재 기본 기능에서 사용하지 않음

## 5. Place-data policy

### Restaurants

- Google Places의 **live candidate data** 사용
- 역 기준 직선거리 2 km 초과 제외
- shared TypeScript에서 재랭킹 후 TOP 3
- 현재 랭킹: Bayesian rating 55% + review volume 25% + Google relevance 15% + distance 5%
- 결과를 장기 추천 DB로 축적하지 않음

### Attractions

- Google popularity search가 아니라 first-party curated static data 사용
- 역당 0~2곳
- 합격선은 **“그 역에 갔을 때 30분~몇 시간 둘러보거나 구경할 가치가 있는가”**
- Tier A 광역 대표 목적지는 포함
- Tier B는 시장·특색 있는 거리/상권·문화공간·산책지·호수공원·수목원뿐 아니라 스타필드/IKEA/대형 복합몰·아울렛·주요 백화점 등 체류형 상업시설까지 포함 가능
- 상업시설은 구매 여부와 관계없이 공간 자체를 둘러볼 경험이 있으면 후보가 될 수 있음
- 일반 놀이터·아파트 앞 소공원·평범한 근린시설·일반 마트/소형 상가처럼 방문 이유가 약한 Tier C는 제외
- 적절한 후보가 없으면 0개를 유지하며 숫자를 채우기 위해 억지 추천하지 않음
- 점수 공식으로 자동 선별하지 않고 editorial judgment 사용
- 상세 기준은 `docs/ATTRACTION_CURATION.md`
- 데이터 구조는 `curated-attractions-base.ts` + `curated-attractions-extra.ts`를 `curated-attractions.ts`에서 merge/dedupe/max-2 처리

### Station centers

- `src/data/station-coordinates.ts`의 정적 좌표 우선
- 없는 역만 Google fallback
- fallback 좌표는 기존 30일 캐시 정책 유지

## 6. Current development snapshot

2026-09-14 기준:

- Modular Web refactor: 완료 및 `main` 배포
- Curated attraction dataset: 기존 Tier A/지역 Tier B에서 **browse-worthy 목적지까지 추가 확장**
- 새 확장 예: IKEA 광명·고양, 스타필드 수원·고양, 더현대 서울, 현대프리미엄아울렛 송도, 트리플스트리트, 광교호수공원, 왕송호수, 여러 전통시장/카페거리/로데오거리/문화공간
- Web 확장 코드 commit `7e45dfb3210c1b16a758523bdc5e4d8f2aac967c`가 tests/build/headless smoke를 통과했고 deployment commit `94700886f6d9b7c1ff23dde0cdff71beef024979`로 공개 bundle 배포 완료
- 0~2개/no-forced-fill 정책 유지; 평범한 Tier C 근린시설은 계속 제외
- 동일한 browse-worthy attraction source/tests를 Android 작업 브랜치에도 commit `c699421006f97dd7356f3951d6708ded875636bd`로 동기화
- Android의 이 최신 head는 connector/Git ref 방식으로 갱신되어 새 Actions run이 아직 생성되지 않았으므로 release/merge 전 fresh Android CI 재검증 필요
- Static-first station center: 적용 완료
- Android shell: 개발 진행 중
- Android Places native bridge: 구현됨
- Galaxy S20에서 line → station → food → live restaurant TOP 3 핵심 흐름 검증됨
- Android 작업 branch/PR은 계속 진행 중이므로 세부 최신 상태는 `STATUS.md`와 GitHub를 확인

## 7. Documentation source of truth

문서 역할을 섞지 않습니다.

- `README.md`: 프로젝트 입구 / 핵심 링크
- `docs/PROJECT_CONTEXT.md`: 새 세션용 빠른 인계 문서
- `docs/PROJECT_PLAN.md`: 제품 목적, 요구사항, 로드맵, 변경 불가 원칙
- `docs/ARCHITECTURE.md`: 코드/데이터/플랫폼 구조와 설계 결정
- `docs/STATUS.md`: 실제 현재 진행 상태, 검증 결과, 최근 변경 이력
- `docs/ATTRACTION_CURATION.md`: 볼거리 포함/제외 기준

충돌 시 **실제 코드/Git 상태 > STATUS > ARCHITECTURE/PROJECT_PLAN > PROJECT_CONTEXT/README** 순으로 최신성을 판단합니다.

## 8. Mandatory documentation update rule

앞으로 의미 있는 개발 변경을 할 때 코드만 바꾸지 않습니다.

같은 변경/PR에서 아래를 함께 확인합니다.

- 기능 구현/버그 수정/데이터 정책 변경/플랫폼 상태 변화 → `STATUS.md` 업데이트
- 제품 목적, 핵심 UX, 플랫폼 전략, 거리/랭킹/API 정책 변화 → `PROJECT_PLAN.md` 업데이트
- 모듈 경계, 데이터 흐름, provider, storage, native bridge, build/deploy 구조 변화 → `ARCHITECTURE.md` 업데이트
- 볼거리 진입 기준이나 큐레이션 운영 방식 변화 → `ATTRACTION_CURATION.md` 업데이트
- 프로젝트 역할이나 새 세션에서 반드시 알아야 할 전제 변화 → `PROJECT_CONTEXT.md` 업데이트
- 진입점이나 주요 문서 링크가 바뀌면 `README.md` 업데이트

단순 typo나 내부 리팩터링처럼 프로젝트 이해에 영향을 주지 않는 변경은 문서 수정이 필수는 아닙니다.

## 9. Session restart checklist

새 채팅/개발 세션에서는 다음 순서로 복구합니다.

1. 이 `PROJECT_CONTEXT.md` 읽기
2. `STATUS.md`에서 현재 phase와 마지막 변경 확인
3. 필요한 경우 `PROJECT_PLAN.md` / `ARCHITECTURE.md` / `ATTRACTION_CURATION.md` 확인
4. GitHub의 실제 branch, PR, recent commits, CI 상태 확인
5. 작업 대상이 Web인지 Android인지 먼저 구분
6. 변경 후 관련 테스트와 문서를 함께 갱신

이 절차를 따르면 과거 대화 원문 전체가 없어도 저장소만으로 개발 맥락을 복구할 수 있어야 합니다.
