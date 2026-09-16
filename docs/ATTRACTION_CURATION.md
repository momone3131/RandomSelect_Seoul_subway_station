# Random Seoul — Attraction Curation Policy

Last updated: 2026-09-16

이 문서는 `src/data/curated-attractions*.ts`에 역별 볼거리를 추가/제거하고 시각 등급을 조정할 때 사용하는 기준입니다.

## Goal

추천 명소의 목적은 전국적으로 유명한 관광지만 보여주는 것이 아닙니다.

랜덤으로 뽑힌 역에 갔을 때 사용자가 **“여기까지 왔으니 근처에서 이것도 한번 둘러보자”**라고 느낄 만한 장소를 0~2곳 제공하는 것이 목적입니다.

따라서 다음도 포함할 수 있습니다.

- 관광 랜드마크 / 궁궐 / 박물관 / 문화시설
- 규모 있는 공원, 호수공원, 수변·생태공간
- 특색 있는 번화가, 먹자골목, 카페거리, 로데오거리, 특화거리
- 전통시장·특화시장
- 구경할 이유가 있는 대학 캠퍼스
- 스포츠·전시·체험 공간
- 대형 복합쇼핑·라이프스타일 목적지

반대로 일반 어린이놀이터, 아파트 앞 소공원, 평범한 근린상가처럼 **가깝다는 것 외에 방문 이유가 약한 장소**는 수를 채우기 위해 넣지 않습니다.

## Core rule

가장 실용적인 판정 질문:

> 이 역에 내려서 30분~몇 시간 정도 **둘러보거나 구경할 목적으로** 추천해도 괜찮은 곳인가?

Yes라면 후보가 될 수 있습니다.

전국구 유명세는 필수가 아닙니다. 규모, 특색, 분위기, 지역성, 문화성, 산책성, 상권 경험 중 하나 이상이 충분하면 일반 local tier로 포함할 수 있습니다.

## Curation method

명소는 리뷰 수나 별점의 자동 점수 공식으로 선별하지 않습니다. Google attraction search도 사용하지 않습니다. first-party editorial curation을 사용합니다.

판단 요소:

- 그 역이 랜덤으로 뽑혔을 때 함께 들르라고 추천할 수 있는가
- 구매·관람·산책·구경 등 실제 체류 경험이 있는가
- 공간 자체를 둘러볼 이유가 있는가
- 규모 / 특색 / 분위기 / 문화성 / 지역성 중 하나 이상이 충분한가
- 특정 단기 행사에만 의존하지 않고 비교적 안정적인가
- 해당 역에서 현실적으로 접근 가능한가
- 지도 타깃을 정확히 특정할 수 있는가

공식 시설·관광기관·지자체 자료는 존재성/접근성/운영 여부를 확인할 때 우선 참고하지만, 공식 관광지 등재 자체를 기계적인 필수조건으로 사용하지 않습니다.

## Three visual tiers

모든 앱 노출 명소는 내부적으로 다음 3단계 중 하나를 갖습니다.

중요: **등급 이름(`gold`, `silver`, `standard`)은 사용자 화면에 글자로 표시하지 않습니다.** 카드의 테두리/효과로만 차이를 전달합니다.

### Gold — 전국구 / 목적지급

전국적으로 인지도가 높거나 서울·수도권 여행 자체의 대표 목적지가 될 수 있는 곳입니다.

대표 성격:
- 국가급 대표 문화유산·박물관
- 전국적으로 알려진 핵심 관광지
- 매우 큰 랜드마크 / 테마파크 / 대표 공원
- 지역을 넘어 독립 목적지로 기능하는 장소

대표 예:
- 경복궁
- 국립중앙박물관
- 광화문광장
- 광장시장
- DDP
- 홍대 걷고싶은거리
- 반포한강공원
- 롯데월드타워
- 올림픽공원
- 서울대공원
- 코엑스
- 에버랜드
- 두물머리
- 남한산성

UI:
- 금색 metallic border
- 지속적으로 아주 느린 반사 sheen
- 처음 새 결과로 등장할 때 강한 gold pulse/reveal

### Silver — 주요 유명 목적지

전국구 최상위까지는 아니더라도 도시/권역 차원에서 널리 알려져 있고 별도로 들를 이유가 분명한 곳입니다.

대표 성격:
- 유명 공원·호수·한강공원·생태공원
- 주요 전통시장 / 대표 상권
- 주요 미술관·박물관·공연/문화시설
- 스타필드·더현대·대형 쇼핑/라이프스타일 destination
- 잘 알려진 산·왕릉·사찰·지역 명소

대표 예:
- 덕수궁
- 청계천
- 익선동 한옥거리
- 리움미술관
- 여의도한강공원
- 더현대 서울
- 망원시장
- 경의선숲길
- 하늘공원
- 석촌호수
- 서울식물원
- 서울숲
- 스타필드 수원/고양/하남
- 킨텍스
- 인천 개항장거리
- 송도 센트럴파크
- 예술의전당
- 선정릉
- 용마폭포공원
- 시흥갯골생태공원

UI:
- 은색 metallic border
- 지속적으로 아주 느린 반사 sheen
- 처음 새 결과로 등장할 때 silver pulse/reveal

### Standard — 둘러볼 만한 local stop

유명 관광지는 아니더라도 해당 역에서 랜덤 외출을 이어가기 좋은 장소입니다.

가능한 예:
- 아현시장 같은 지역 시장
- 연신내 로데오거리 / 구디 깔깔거리 같은 상권
- 낙성대공원 / 과천중앙공원처럼 일정 규모가 있는 공원
- 경희대·한양대 같은 산책 가능한 캠퍼스
- 국기원 / 지역 경기장 / 문화시설
- 규모와 특색이 있는 동네 산책·수변 공간

UI:
- 기존 neutral paper card
- 별도 등급 테두리 없음
- 별도 tier 등장 pulse 없음

## Exclusion threshold

다음은 기본적으로 추천하지 않습니다.

- 소규모 어린이놀이터
- 아파트 앞 작은 소공원 / 이름만 있는 근린 쉼터
- 평범한 주민 체육시설
- 특별한 특징이 없는 짧은 동네 산책로
- 일반 마트 / 소형 쇼핑센터 / 평범한 상가
- 검색상 존재하지만 실제 체류·구경 가치가 약한 곳
- 지도에서 정확히 특정하기 어려운 모호한 범위

단, 이름에 `근린공원`이 들어간다는 이유만으로 자동 제외하지는 않습니다. 실제 규모와 체류가치가 충분한지 판단합니다.

## Selection rules

- 역당 **0~2곳**만 노출합니다.
- Gold / Silver / Standard 모두 앱 노출 대상입니다.
- 2곳 강제 채우기 금지. 약한 역은 0개 허용.
- 기존 강한 추천을 새 local 후보 때문에 밀어내지 않습니다.
- merge priority는 `base → extra → local`입니다.
- 동일 ID는 dedupe합니다.
- 같은 성격 두 곳만 있는 것보다 서로 다른 경험을 주는 조합을 선호합니다.
- 역과 지나치게 멀어 “이 역 주변”이라는 의미가 약해지면 제외합니다.
- 폐업·이전·장기폐쇄·접근성 변화가 확인되면 제거/교체합니다.

## Coverage expansion rule

`curated-attractions-local.ts`는 보수적인 초기 시드에서 비어 있던 역을 보강하기 위한 층입니다.

허용 범위:
- 번화가 / 먹자골목 / 로데오 / 카페거리
- 전통시장
- 규모 있는 공원·생태공원·수변 공간
- 방문할 이유가 있는 캠퍼스
- 지역 문화·전시·체험·스포츠 anchor
- 구경 가치가 있는 쇼핑 destination

이 층의 목적은 **빈 역을 무조건 채우는 것**이 아니라, 기존 정책상 너무 보수적으로 누락된 “충분히 둘러볼 만한 곳”을 추가하는 것입니다.

## Tier maintenance

Tier assignment is centralized in `src/data/curated-attraction-tiers.ts`.

- `GOLD_IDS`: gold
- `SILVER_IDS`: silver
- 그 외 노출 명소: standard

Tier는 영구적인 절대 평가가 아니라 Random Seoul UI에서의 **visual prominence / destination strength** 분류입니다. 장소의 운영/인지도/방문가치 변화에 따라 조정할 수 있습니다.

같은 명소 ID는 어느 역에서 노출되더라도 같은 tier를 사용합니다.

## Visual effect contract

`src/ui/attraction-view.ts`:
- card class: `attraction-tier-gold | attraction-tier-silver | attraction-tier-standard`
- user-visible tier text badge는 생성하지 않음
- station + attraction IDs + tier로 signature 생성
- 같은 signature의 반복 렌더는 DOM을 다시 만들지 않음
- 새 signature의 gold/silver에만 `attraction-tier-reveal` 부여

`src/ui/minimal-palette-overrides.css`:
- gold/silver gradient border
- slow reflective sheen
- first-arrival color-matched pulse
- standard stays borderless
- `prefers-reduced-motion: reduce`에서는 tier motion 끔

## Map target integrity

명소 카드의 지도 링크는 **명소 자체를 정확히 가리키는 것**이 품질 기준의 일부입니다.

- attraction 데이터에는 별도 lat/lng를 저장하지 않으며 `mapQuery`를 Google Maps 정적 타깃으로 사용합니다.
- `mapQuery`는 역 이름을 덧붙이지 않아도 장소를 독립적으로 식별할 수 있어야 합니다.
- UI는 `${stationName}역` 같은 suffix를 자동 추가하지 않습니다.
- 고유 시설명은 공식/통용 시설명을 사용합니다.
- 동명이인 가능성이 있는 시장·거리·공원은 도시/구/동/도로명/주소를 보강합니다.
- 강·둘레길·수변공간처럼 넓은 곳은 해당 역에서 접근하기 좋은 구체적 진입점/공원 지점을 사용합니다.
- 정확한 target이 애매하면 잘못된 핀보다 미추천을 선택합니다.

예: 검암역의 넓은 `경인아라뱃길` 대신 `경인아라뱃길 시천가람터`를 노출하고 `시천가람터 인천광역시 서구 시천동 158-11`을 지도 타깃으로 사용합니다.

## Data layout

- `curated-attractions-base.ts`: 기존 강한 시드
- `curated-attractions-extra.ts`: browse-worthy 확장 시드
- `curated-attractions-local.ts`: local street / market / sizeable park / campus / culture expansion
- `curated-attraction-tiers.ts`: ID 기반 visual tier classifier
- `curated-attractions.ts`: base → extra → local merge / ID dedupe / max2 / tier attachment public entry

Tests:
- `tests/curated-attractions.test.ts`
  - 대표 결과
  - local station key validity
  - tier assignment
  - max2
  - station-only map target 금지
  - weak station zero-result 허용
- `tests/map-links.test.ts`
  - curated `mapQuery` direct use / station suffix 금지
- `tests/responsive-contract.test.ts`
  - no visible tier labels
  - metallic gold/silver visuals
  - first-arrival signature guard
  - reduced-motion contract

## What this replaces

초기 Google Places 기반 자동 명소 검색은 평범한 놀이터/근린시설까지 추천하는 문제가 있었습니다.

그 뒤 first-party curation으로 전환했지만 초기 시드는 반대로 유명 랜드마크 위주로 너무 보수적이었습니다.

현재 정책은 중간점을 목표로 합니다.

- 자동 검색의 저품질 근린 결과는 제외
- 전국구 랜드마크만 고집하지 않음
- local 상권 / 시장 / 규모 있는 공원도 실제 둘러볼 가치가 있으면 포함
- 강한 목적지는 visual tier로 더 특별하게 보이게 함
- 0개가 맞는 역에는 억지로 넣지 않음

## Maintenance checklist

명소 데이터를 확장하거나 tier를 조정할 때 함께 확인:

- `src/data/curated-attractions.ts`
- `src/data/curated-attractions-base.ts`
- `src/data/curated-attractions-extra.ts`
- `src/data/curated-attractions-local.ts`
- `src/data/curated-attraction-tiers.ts`
- `src/services/maps/web-map-links.ts`
- `src/ui/attraction-view.ts`
- `src/ui/minimal-palette-overrides.css`
- `tests/curated-attractions.test.ts`
- `tests/map-links.test.ts`
- `tests/responsive-contract.test.ts`
- `docs/STATUS.md`
- 필요 시 `PROJECT_CONTEXT / PROJECT_PLAN / ARCHITECTURE`
