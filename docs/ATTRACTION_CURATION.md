# Random Seoul — Attraction Curation Policy

Last updated: 2026-09-16

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

## Prominence tier — one exclusive axis

모든 노출 명소는 정확히 하나의 `diamond / gold / silver / standard` tier를 갖습니다. **등급명은 UI에 글자로 표시하지 않습니다.**

### Diamond

Gold 위의 극소수 jackpot tier. 정확히 4곳:
- 경복궁
- 국립중앙박물관
- 롯데월드타워
- 북촌한옥마을

쉽게 늘리지 않습니다. 새 후보를 넣으려면 기존 Diamond 중 하나를 교체할 정도의 이유가 있어야 합니다.

UI:
- icy cyan / sky / white / pale-violet gemstone prism border
- facet sparkle
- `4.2s` prism / `3.4s` sparkle
- `1.8s` strong multi-stage arrival reveal
- reduced-motion disables motion

### Gold

전국구 / destination-level. Diamond 4곳을 제외한 강한 전국구 목적지.

UI: metallic gold border + sheen + first-arrival gold pulse.

### Silver

도시·권역 대표급 또는 전국적으로 알려진 niche destination.

Latest correction:
- 서소문성지역사박물관: 이미 Silver였으며 유지
- 서울 석촌동 고분군: Standard → Silver

Current Silver count: **85**.

UI: metallic silver border + sheen + first-arrival silver pulse.

### Standard

실제로 둘러볼 가치가 있지만 광역 유명세/독립 목적지성은 상위 tier보다 낮은 local stop. 추천에서 제외되는 등급이 아닙니다.

UI: neutral borderless card.

Tier source of truth: `src/data/curated-attraction-tiers.ts`.

## Orthogonal features — may overlap any tier

특수 속성은 prominence tier와 **독립적인 축**으로 관리합니다. 하나의 명소가 `Diamond + Nightscape`, `Gold + Nightscape`, `Silver + Nightscape`처럼 동시에 가질 수 있습니다.

Source of truth: `src/data/curated-attraction-features.ts`.

### Nightscape

Nightscape는 5번째 등급이 아닙니다. **밤에 방문하는 것 자체가 분명한 이유가 되는 장소**에만 보수적으로 붙입니다.

Current set — 10:
- DDP
- 낙산공원
- 노들섬
- 반포한강공원
- 세빛섬
- 석촌호수
- 롯데월드타워
- 송도 센트럴파크
- 광교호수공원
- 라베니체 마치에비뉴

제외 원칙:
- 야간개장 기간에만 성립하는 장소
- 특정 축제/시즌에만 밤 매력이 생기는 장소
- 넓은 장소 중 일부 포인트만 야경 명소인데 attraction ID가 그 포인트를 특정하지 않는 경우
- 단순히 “밤에도 예쁨” 수준이고 야간 방문 목적지성이 약한 경우

### Nightscape visual contract

Nightscape는 **테두리를 사용하지 않습니다.** prominence tier가 border/effect를 계속 소유합니다.

Nightscape는 카드 interior/background만 바꿉니다:
- dark navy → indigo/purple night-sky gradient
- 작은 white/blue/lilac star points
- 아래쪽의 subtle warm city-light glow
- near-white title / muted blue description
- translucent map action
- visible `야경` badge/text 없음

Tier-specific border inset:
- Diamond + Nightscape: 3px gemstone border 밖에 유지
- Gold/Silver + Nightscape: 2px metallic border 밖에 유지
- Standard + Nightscape: borderless night card

`attraction-view.ts`는 `night/plain`을 signature에 포함하고 `attraction-nightscape` class를 tier class와 독립적으로 붙입니다.

## Selection rules

- 역당 최대 0~2곳
- existing stronger candidate priority 보호
- same ID dedupe
- 같은 성격 2곳보다 다른 경험 조합 선호
- 지나치게 먼 후보 제외
- 폐업·이전·장기폐쇄·접근성 변화 확인 시 제거/교체

Merge priority:

**base → station adjustments → extra → local → dedupe → max2 → tier + features**

## Map target integrity

- attraction lat/lng 별도 저장 없음
- self-contained `mapQuery`
- UI가 `${stationName}역` suffix를 자동 추가하지 않음
- 동명이인 가능 장소는 도시/구/동/도로/주소로 보강
- 넓은 수변·둘레길은 접근 가능한 구체 anchor 사용
- 정확한 타깃이 애매하면 잘못된 핀보다 미추천 선택

Representative: 검암 → `경인아라뱃길 시천가람터`, target `시천가람터 인천광역시 서구 시천동 158-11`.

## Data layout

- `curated-attractions-base.ts`: established seed
- `curated-attractions-adjustments.ts`: sparse priority overrides
- `curated-attractions-extra.ts`: browse-worthy expansion
- `curated-attractions-local.ts`: local expansion
- `curated-attraction-tiers.ts`: prominence classifier
- `curated-attraction-features.ts`: orthogonal features
- `curated-attractions.ts`: merge/dedupe/max2/enrichment public entry

Tests:
- `tests/curated-attractions.test.ts`: representative results, station-key validity, tier boundary, Nightscape set/overlap, max2, map targets
- `tests/map-links.test.ts`: direct curated target / no station suffix
- `tests/responsive-contract.test.ts`: hidden tier labels, tier visuals, gemstone Diamond, Nightscape interior overlap, signature/reduced-motion contracts

## Maintenance checklist

Meaningful attraction changes should review:
- `src/data/curated-attraction-tiers.ts`
- `src/data/curated-attraction-features.ts`
- `src/data/curated-attractions*.ts`
- `src/ui/attraction-view.ts`
- `src/ui/minimal-palette-overrides.css`
- attraction/map/responsive tests
- `docs/ATTRACTION_TIER_AUDIT.md`
- `docs/STATUS.md`
