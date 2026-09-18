# Random Seoul — Attraction Curation Policy

Last updated: 2026-09-18

이 문서는 추천 명소 추가·제거, prominence tier, orthogonal feature를 관리하는 기준입니다.

## Goal

랜덤으로 뽑힌 역에 갔을 때 사용자가 **“여기까지 왔으니 근처에서 이것도 둘러보자”**라고 느낄 만한 장소를 0~2곳 제공합니다.

포함 가능:
- 관광 랜드마크 / 궁궐 / 박물관 / 문화시설
- 규모 있는 공원·호수·한강/수변·생태공간
- 특색 있는 번화가·먹자골목·카페거리·로데오·특화거리
- 전통시장·특화시장
- 구경할 이유가 있는 캠퍼스
- 스포츠·전시·체험 공간
- 대형 복합쇼핑·라이프스타일 목적지
- 도시 조망 자체가 방문 이유인 전망대·봉우리·성곽 고지대

제외:
- 어린이놀이터
- 아파트 앞 작은 소공원
- 평범한 근린상가·마트·주민시설
- 방문 이유가 약한 짧은 산책로
- 지도 타깃을 신뢰성 있게 특정하기 어려운 범위

핵심 질문: **이 역에 내려서 30분~몇 시간 실제로 둘러볼 이유가 있는가?**

## Curation method

- first-party editorial curation
- Google attraction Text Search 없음
- 실제 체류·구경 가치 / 규모 / 특색 / 분위기 / 문화성 / 지역성 / 접근성 / 운영 안정성 / 정확한 mapQuery를 함께 판단
- 공식 관광자료는 존재성·대표성·운영 상태와 특수 속성 검토의 우선 참고자료
- 2곳 강제 채우기 금지; 정말 약한 역은 0개가 정상

## Physical interchange consistency

명소 큐레이션은 **실제 같은 환승역이면 어느 노선에서 뽑혀도 동일한 결과**를 보여야 합니다.

- 같은 이름의 실제 환승역은 모든 노선 키를 하나의 station-equivalence group으로 묶은 뒤 기존 curation layer를 병합합니다.
- 단순 동명이역은 묶지 않습니다. 현재 명시적 예외는 `신촌`(2호선 / 경의중앙선)과 `양평`(5호선 서울 / 경의중앙선 경기)입니다.
- 역명이 다른 동일 환승역은 명시적으로 연결합니다. 현재 `총신대입구(이수)` ↔ `이수`를 동일 역으로 처리합니다.
- 이 규칙은 약한 명소를 새로 채우는 것이 아니라, 이미 한 노선에 존재하는 동일 역의 큐레이션을 다른 환승 노선에도 일관되게 공유하는 규칙입니다.

Source of truth: `src/data/station-equivalence.ts`.

## Zero-coverage research method

명소 0개 역을 재검토할 때 관광지도/관광공사 목록만 보지 않습니다.

- 지자체 문화관광/공공시설 자료
- 지도상 실제 역 접근성
- 전통시장·특화거리·대형 상권
- 규모 있는 공원·수변·생태공간
- 박물관·미술관·공연/전시시설
- 방문 가치가 있는 캠퍼스 시설
- 실제 등산로/전망 포인트의 대중교통 접근점

을 함께 확인합니다.

반대로 **역 이름만으로 장소 존재를 추정하지 않습니다.** 계획·미조성 시설, 버스 추가 이동이 필수인 원거리 목적지, 일반 주거지 소공원/주민시설은 0개로 남길 수 있습니다.

2026-09-18 다단계 전수 재조사 결과, 800개 line/station 추첨 결과의 0개 명소 케이스는 391→262, physical missing groups는 346→237로 감소했습니다. unique surfaced attractions는 330→420로 증가했습니다.

## Prominence tier — exclusive axis

모든 노출 명소는 정확히 하나의 `diamond / gold / silver / standard` tier를 갖습니다. **등급명은 UI에 글자로 표시하지 않습니다.**

Current surfaced counts: Diamond 4 / Gold 25 / Silver 100 / Standard 291 (420 unique attractions).

### Diamond

정확히 4곳: 경복궁 / 국립중앙박물관 / 롯데월드타워 / 북촌한옥마을.

쉽게 늘리지 않습니다. UI는 icy cyan / sky / white / pale-violet gemstone prism + facet sparkle + `1.8s` strong arrival reveal.

### Gold

전국구 / destination-level. N서울타워는 현재 Gold.

UI: metallic gold border + sheen + first-arrival gold pulse.

### Silver

도시·권역 대표급 또는 전국적으로 알려진 niche destination.

Relevant current decisions:
- 서소문성지역사박물관 = Silver
- 서울 석촌동 고분군 = Silver
- 응봉산 팔각정 = Silver
- 남한산성 서문 전망대 = Silver
- 수원화성 서장대 = Silver

UI: metallic silver border + sheen + first-arrival silver pulse.

### Standard

실제로 둘러볼 가치가 있지만 광역 유명세/독립 목적지성은 상위 tier보다 낮은 local stop. Nightscape일 수 있어도 prominence 자체는 Standard일 수 있습니다.

Examples: 달맞이봉공원 / 매봉산 팔각정 / 용왕산 스카이워크 / 삼성해맞이공원 / 용마산 스카이워크 / 용양봉저정공원.

Tier source of truth: `src/data/curated-attraction-tiers.ts`.

## Orthogonal features — may overlap any tier

특수 속성은 prominence tier와 **독립적인 축**으로 관리합니다. 하나의 명소가 `Diamond + Nightscape`, `Silver + Nightscape`, `Standard + Nightscape`처럼 동시에 가질 수 있습니다.

Source of truth: `src/data/curated-attraction-features.ts`.

### Nightscape — strict elevated city-view rule

Nightscape는 5번째 등급이 아닙니다. 아래 기준을 만족해야 합니다.

> **높은 곳에서 도시 불빛/스카이라인을 내려다보는 것 자체가 밤 방문의 핵심 목적이어야 한다.**

단순히 건물이 조명으로 예쁘거나 수변이 밤에도 분위기 좋은 정도는 부족합니다.

Current set — 12:
- N서울타워
- 낙산공원
- 응봉산 팔각정
- 달맞이봉공원
- 매봉산 팔각정
- 용왕산 스카이워크
- 삼성해맞이공원
- 용마산 스카이워크
- 용양봉저정공원
- 롯데월드타워
- 남한산성 서문 전망대
- 수원화성 서장대

Explicitly not Nightscape under this rule:
- DDP
- 노들섬
- 반포한강공원
- 세빛섬
- 석촌호수
- 송도 센트럴파크
- 광교호수공원
- 라베니체

이들은 추천 자체에서 빠지는 것이 아니며 기존 prominence tier도 유지합니다. Nightscape 배경만 적용하지 않습니다.

### Dedicated night-viewpoint layer

`curated-attractions-night-viewpoints.ts`는 기존 데이터에서 누락된 실제 전망 목적지를 보강합니다.

Mappings:
- 충무로 → N서울타워
- 응봉 → 응봉산 팔각정
- 옥수 → 달맞이봉공원
- 버티고개 → 매봉산 팔각정
- 신목동 → 용왕산 스카이워크
- 청담 → 삼성해맞이공원
- 사가정 → 용마산 스카이워크
- 노들 → 용양봉저정공원
- 산성 / 남한산성입구 → 남한산성 서문 전망대
- 화서 → 수원화성 서장대

This layer is deliberately last in merge priority so it supplements free slots without displacing stronger established attractions.

### Nightscape visual contract

Nightscape는 **테두리를 사용하지 않습니다.** prominence tier가 border/effect를 계속 소유합니다.

Nightscape는 카드 interior/background만 바꿉니다:
- dark navy → indigo/purple night-sky gradient
- small star points + subtle city-light glow
- near-white title / muted blue description
- translucent map action
- visible `야경` badge/text 없음

Thus:
- 롯데월드타워 = Diamond border + Nightscape interior
- 응봉산 팔각정 = Silver border + Nightscape interior
- 용왕산 스카이워크 = borderless Standard + Nightscape interior

## Selection / merge rules

- 역당 최대 0~2곳
- stronger existing candidate priority 보호
- same ID dedupe
- 지나치게 먼 후보 제외
- 폐업·이전·장기폐쇄·접근성 변화 확인 시 제거/교체

Merge priority:

**physical interchange equivalence → base → station adjustments → extra → local → night-viewpoints → dedupe → max2 → tier + features**

## Map target integrity

- self-contained `mapQuery`
- UI가 `${stationName}역` suffix를 자동 추가하지 않음
- 동명이인 가능 장소는 도시/구/동/도로/주소로 보강
- 전망지/산성은 가능한 한 실제 전망 포인트를 이름과 query로 특정
- 정확한 타깃이 애매하면 잘못된 핀보다 미추천 선택

## Data layout

- `curated-attractions-base.ts`: established seed
- `curated-attractions-adjustments.ts`: sparse priority overrides
- `curated-attractions-extra.ts`: browse-worthy expansion
- `curated-attractions-local.ts`: local expansion
- `curated-attractions-night-viewpoints.ts`: dedicated elevated viewpoint supplement
- `curated-attraction-tiers.ts`: prominence classifier
- `curated-attraction-features.ts`: orthogonal features
- `station-equivalence.ts`: physical interchange line-key equivalence / same-name non-interchange exceptions
- `curated-attractions.ts`: interchange expansion + merge/dedupe/max2/enrichment public entry

Tests cover station-key validity, physical-interchange consistency, same-name non-interchange separation, tier boundaries, strict Nightscape inclusion/exclusion, overlap behavior, max2 and map targets.
