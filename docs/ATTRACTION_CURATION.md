# Random Seoul — Attraction Curation Policy

Last updated: 2026-09-16

이 문서는 `src/data/curated-attractions*.ts`의 추천 명소를 추가·제거하고 시각적 prominence tier를 조정할 때 사용하는 기준입니다.

## Goal

추천 명소의 목적은 전국적으로 유명한 관광지만 보여주는 것이 아닙니다. 랜덤으로 뽑힌 역에 갔을 때 사용자가 **“여기까지 왔으니 근처에서 이것도 둘러보자”**라고 느낄 만한 장소를 0~2곳 제공합니다.

포함 가능:
- 관광 랜드마크 / 궁궐 / 박물관 / 문화시설
- 규모 있는 공원·호수공원·한강/수변·생태공간
- 특색 있는 번화가·먹자골목·카페거리·로데오·특화거리
- 전통시장·특화시장
- 구경할 이유가 있는 캠퍼스
- 스포츠·전시·체험 공간
- 대형 복합쇼핑·라이프스타일 목적지

제외:
- 어린이놀이터
- 아파트 앞 작은 소공원
- 평범한 근린상가·마트·주민시설
- 방문 이유가 약한 짧은 산책로
- 지도 타깃을 신뢰성 있게 특정하기 어려운 범위

핵심 질문은 하나입니다.

> 이 역에 내려서 30분~몇 시간 정도 실제로 둘러보거나 구경할 이유가 있는가?

## Curation method

명소는 별점/리뷰 수 자동 점수로 선정하지 않고 first-party editorial curation을 사용합니다. Google attraction Text Search도 사용하지 않습니다.

판단 요소:
- 실제 체류·구경 가치
- 규모 / 특색 / 분위기 / 문화성 / 지역성
- 해당 역에서의 현실적인 접근성
- 상시 또는 비교적 안정적인 방문 가치
- 정확한 `mapQuery`를 만들 수 있는가

공식 관광자료는 존재성·대표성·운영 상태를 확인하는 우선 참고자료입니다. 공식 관광지 등재만으로 자동 승급하지 않습니다.

## Four visual tiers

모든 노출 명소는 내부적으로 `diamond / gold / silver / standard` 중 하나를 갖습니다. **등급명은 사용자 화면에 글자로 표시하지 않고 카드 테두리와 등장 효과로만 표현합니다.**

### Diamond — 극소수 잭팟 목적지

Gold 위의 최상위 희귀 등급입니다. Random Seoul에서 뽑혔을 때 사용자가 즉시 “특별한 결과가 떴다”고 느낄 수 있도록 **정확히 4곳만** 유지합니다.

현재 Diamond:
- 경복궁
- 국립중앙박물관
- 롯데월드타워
- 북촌한옥마을

이 목록은 재미를 위한 희귀도 설계이므로 쉽게 늘리지 않습니다. 새 후보를 넣으려면 기존 Diamond와 교체할 정도의 상징성·인지도·독립 목적지성이 있어야 합니다.

UI:
- 금색보다 한 단계 위의 **백금(platinum) + 절제된 프리즘 반사 테두리**
- 3px metallic border + 지속적인 reflective sheen
- 새 명소 조합의 최초 등장 시 **1.65초 다단계 pulse/reveal**
- reveal 중 두 번의 확실한 빛 확산으로 사용자가 놓치지 않게 함
- `prefers-reduced-motion`에서는 움직임 비활성화

### Gold — 전국구 / 목적지급

전국적으로 인지도가 높거나 서울·수도권 여행 자체의 대표 목적지가 될 수 있는 곳입니다. Diamond 4곳을 제외한 강한 전국구 목적지가 여기에 속합니다.

현재 대표 예:
- 창덕궁 / 종묘
- 광화문광장 / 청계천
- 광장시장 / 남대문시장
- DDP / 명동거리 / 홍대
- 성수 연무장길 / 서울숲
- 반포한강공원
- 석촌호수 / 올림픽공원
- 코엑스 / 서울대공원 / 에버랜드
- 두물머리 / 남한산성 / 임진각 평화누리
- 송도 센트럴파크
- 인천 차이나타운 / 개항장거리

UI:
- metallic gold border
- 느린 reflective sheen
- 새 명소 조합의 최초 등장 시 strong gold pulse

### Silver — 주요 유명 목적지

전국구 최상위는 아니더라도 도시·권역 대표급이거나 특정 분야에서 전국적으로 알려져 **일부러 찾아갈 이유가 분명한 곳**입니다.

대표 예:
- 덕수궁 / 서대문형무소역사관 / 경희궁
- 대학로 / 낙산공원 / 동묘벼룩시장
- 리움미술관 / 예술의전당 / 봉은사 / 명동성당
- 용리단길 / 가로수길 / 압구정로데오 / 청담 명품거리
- 신당동 떡볶이타운 / 신림동 순대타운
- 노량진수산시장 / 마장축산물시장 / 모란민속5일장
- 여의도·뚝섬한강공원 / 하늘공원 / 선유도공원 / 보라매공원
- 서울식물원 / 서울어린이대공원 / 북서울꿈의숲
- 아차산 / 도봉산 / 수락산 / 관악산 / 청계산
- 스타필드 수원·고양·하남 / 더현대 서울
- 일산호수공원 / 광교호수공원 / 시흥갯골생태공원
- 국립과천과학관 / 고척스카이돔 / 잠실종합운동장
- 선정릉 / 동구릉 / 정릉 / 태릉과 강릉
- 인천대공원 / 자유공원 / 신포국제시장 / 소래포구전통어시장
- 안산 다문화음식거리 / 대림동 차이나타운
- 한국만화박물관 / 백남준아트센터
- 강촌유원지 / 춘천 명동 닭갈비골목 / 소양강스카이워크
- 라베니체 / 보정동 카페거리 / 소요산

UI:
- metallic silver border
- 느린 reflective sheen
- 새 명소 조합의 최초 등장 시 silver pulse

### Standard — 둘러볼 만한 local stop

해당 역에서 실제로 시간을 보낼 이유는 충분하지만 광역 유명세/독립 목적지성은 Diamond·Gold·Silver보다 낮은 곳입니다.

예:
- 아현시장·연서시장 같은 지역 시장
- 구디 깔깔거리·연신내 로데오 같은 지역 상권
- 과천중앙공원·우장산공원 같은 규모 있는 지역 공원
- 경희대·한양대 등 산책 가능한 캠퍼스
- 지역 문화·전시·쇼핑 destination
- 서울로7017 / 양재시민의숲 / 용마폭포공원 / 양화한강공원처럼 방문가치는 있으나 현재 prominence는 Silver까지 주지 않은 곳

Standard는 추천에서 제외되는 등급이 아닙니다. **일반 카드로 그대로 노출되며 metallic 강조만 없습니다.**

## Selection rules

- 역당 최대 **0~2곳**
- 2곳 강제 채우기 금지
- 기존 강한 명소를 새 local 후보가 밀어내지 않음
- 동일 ID dedupe
- 같은 성격 두 곳보다 서로 다른 경험을 주는 조합 선호
- 역에서 지나치게 멀면 제외
- 폐업·이전·장기폐쇄·접근성 변화가 확인되면 제거/교체

현재 merge priority:

**base → station adjustments → extra → local → dedupe → max2 → tier attachment**

`curated-attractions-adjustments.ts`는 용산처럼 기본 layer 순서만으로 원하는 2곳 조합이 만들어지지 않는 소수 역에만 사용합니다.

## Coverage expansion

`curated-attractions-local.ts`는 초기 시드에서 비어 있던 역을 보강하는 층입니다.

허용:
- 번화가 / 먹자골목 / 로데오 / 카페거리
- 전통시장
- 규모 있는 공원·생태·수변 공간
- 방문할 이유가 있는 캠퍼스
- 지역 문화·전시·체험·스포츠 anchor
- 구경 가치가 있는 쇼핑 destination

목표는 빈 역을 무조건 채우는 것이 아니라 **지나치게 보수적으로 누락된 충분히 둘러볼 만한 장소를 보강하는 것**입니다. 정말 약한 역은 0개가 정상입니다.

## Tier maintenance

Tier assignment source of truth: `src/data/curated-attraction-tiers.ts`.

- `DIAMOND_IDS` → diamond
- `GOLD_IDS` → gold
- `SILVER_IDS` → silver
- 그 외 노출 명소 → standard

같은 attraction ID는 어느 역에서 노출되든 같은 tier를 사용합니다. Tier는 품질 별점이 아니라 **인지도/목적지성 + Random Seoul의 재미를 위한 UI prominence**입니다.

2026-09 전체 재감사 결과와 외부 기준은 `docs/ATTRACTION_TIER_AUDIT.md`에 기록합니다.

## Visual effect contract

`src/ui/attraction-view.ts`:
- `attraction-tier-diamond | attraction-tier-gold | attraction-tier-silver | attraction-tier-standard`
- tier text badge 없음
- station + attraction IDs + tier signature 사용
- 동일 signature 반복 렌더 시 등장 pulse 반복 금지
- 새로운 diamond/gold/silver 결과에만 `attraction-tier-reveal`

`src/ui/minimal-palette-overrides.css`:
- diamond: 3px platinum/prism metallic gradient border + 3.8s sheen + 1.65s multi-pulse first-arrival reveal
- gold/silver: metallic gradient border + slow reflective sheen + first-arrival color-matched pulse
- standard borderless
- `prefers-reduced-motion: reduce`에서는 tier motion 비활성화

## Map target integrity

- attraction lat/lng는 별도 저장하지 않고 `mapQuery`를 Google Maps 정적 타깃으로 사용
- `mapQuery`는 역 이름 없이도 장소를 독립적으로 식별해야 함
- UI에서 `${stationName}역` suffix를 자동 추가하지 않음
- 동명이인 가능 장소는 도시/구/동/도로/주소로 보강
- 넓은 수변·둘레길은 해당 역에서 접근하기 좋은 구체적 anchor 사용
- 정확한 타깃이 애매하면 잘못된 핀보다 미추천을 선택

대표 예: 검암역의 넓은 `경인아라뱃길` 대신 `경인아라뱃길 시천가람터`, map target `시천가람터 인천광역시 서구 시천동 158-11`.

## Data layout

- `curated-attractions-base.ts`: 기존 강한 시드
- `curated-attractions-adjustments.ts`: 소수 역의 우선 조합 override
- `curated-attractions-extra.ts`: browse-worthy 확장
- `curated-attractions-local.ts`: local street / market / sizeable park / campus / culture expansion
- `curated-attraction-tiers.ts`: ID 기반 visual prominence classifier
- `curated-attractions.ts`: merge/dedupe/max2/tier attachment public entry

Tests:
- `tests/curated-attractions.test.ts`: 대표 결과, key validity, Diamond 4개 고정, tier audit boundary, max2, map target 규칙, weak zero-result
- `tests/map-links.test.ts`: curated target direct use / station suffix 금지
- `tests/responsive-contract.test.ts`: no visible tier labels, diamond/gold/silver metallic visuals, first-arrival guard, reduced motion

## Maintenance checklist

명소 데이터/등급을 바꿀 때 함께 확인:
- `src/data/curated-attraction-tiers.ts`
- `src/data/curated-attractions*.ts`
- `src/ui/attraction-view.ts`
- `src/ui/minimal-palette-overrides.css`
- `tests/curated-attractions.test.ts`
- `tests/map-links.test.ts`
- `tests/responsive-contract.test.ts`
- `docs/ATTRACTION_TIER_AUDIT.md`
- `docs/STATUS.md`
