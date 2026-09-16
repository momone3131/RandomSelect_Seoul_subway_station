# Random Seoul — Attraction Tier Audit

Last audited: 2026-09-16

추천 명소의 **prominence tier** 재검토 기록입니다. 실제 동작 source of truth는 `src/data/curated-attraction-tiers.ts`입니다.

## Audit principle

등급은 절대적인 품질점수가 아니라 Random Seoul 결과 카드에서의 **목적지성 / 인지도 / 대표성 + 재미를 위한 희귀도**를 구분하는 UI 분류입니다.

- **Diamond**: Gold 중에서도 극소수만 뽑은 jackpot destination
- **Gold**: 전국적으로 널리 알려졌거나 여행 자체의 대표 목적지가 될 수 있는 곳
- **Silver**: 도시·권역 대표급 또는 전국적으로 알려진 niche destination
- **Standard**: 해당 역에서 실제로 둘러볼 가치가 충분하지만 유명세는 local 성격인 곳

Gold는 2025~2026 문화체육관광부·한국관광공사 `한국관광 100선`, UNESCO/국가급 상징성, 현재 관광 인지도, 독립 목적지성을 강한 기준점으로 사용합니다. 포함 여부만으로 기계적으로 분류하지 않습니다.

Diamond는 객관적 별점 상위표가 아니라 **“잭팟이 떴다”는 제품 경험**을 위한 의도적 희귀 등급입니다.

## Primary external references

- 문화체육관광부 2025~2026 한국관광 100선
  - https://www.mcst.go.kr/site/s_notice/press/pressView.jsp?pSeq=21611
- 대한민국 구석구석 한국관광100선 / 여행지 DB
  - https://korean.visitkorea.or.kr/
- 서울 공식 관광정보 Visit Seoul
  - https://visitseoul.net/
- 국가유산청 궁능유적본부 조선왕릉
  - https://royal.khs.go.kr/

## Diamond jackpot tier

Exactly four:
- 경복궁 (`gyeongbokgung-palace`)
- 국립중앙박물관 (`national-museum-of-korea`)
- 롯데월드타워 (`lotte-world-tower`)
- 북촌한옥마을 (`bukchon-hanok-village`)

에버랜드·창덕궁 등 강한 후보는 Gold로 유지합니다. Diamond를 추가하려면 기존 4곳 중 하나를 교체할 정도의 이유가 있어야 합니다.

Current Diamond visual contract:
- gemstone, not platinum metal
- icy cyan / sky / white / pale-violet prism
- `4.2s` prism + `3.4s` facet sparkle
- `1.8s` strong multi-stage first-arrival reveal
- reduced-motion disables animation
- tier label not printed

## Gold boundary

Representative Gold:
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

## Silver promotions / confirmations

Representative Silver:
- 서대문형무소역사관 / 동묘벼룩시장 / 동대문종합시장 / 경동시장
- 대학로 / 낙산공원 / 북서울꿈의숲 / 경희궁
- 용리단길 / 가로수길 / 압구정로데오 / 청담 명품거리
- 이태원 세계음식거리 / 국립서울현충원 / 문래창작촌
- 신당동 떡볶이타운 / 신림동 순대타운 / 마장축산물시장
- 예술의전당 / 봉은사 / 명동성당
- 아차산 / 도봉산 / 수락산 / 관악산 / 청계산
- 고척스카이돔 / 잠실종합운동장 / 국기원
- 서소문성지역사박물관
- 선정릉 / 정릉 / 태릉과 강릉 / 동구릉
- 스타필드 수원·고양·하남
- 광교호수공원 / 일산호수공원
- 모란민속5일장 / 국립과천과학관
- 인천대공원 / 자유공원 / 신포국제시장 / 소래포구
- 안산 다문화음식거리 / 대림동 차이나타운 / 한국만화박물관
- 강촌유원지 / 청평유원지 / 춘천 명동 닭갈비골목 / 소양강스카이워크
- 보정동 카페거리 / 백남준아트센터 / 소요산 / 라베니체

### Latest correction

- **서소문성지역사박물관**: 확인 결과 이미 Silver에 포함되어 있어 변경 없이 유지.
- **서울 석촌동 고분군 (`seokchon-dong-tombs`)**: Standard → **Silver**. 한성백제의 대표 고고학 유적이라는 독자성과 목적지성을 반영.

Silver count therefore changed from **84 → 85**.

## Intentional Standard examples

방문가치는 충분하지만 현재 유명세/독립 목적지성이 Silver 기준까지는 아니라고 판단한 대표 항목:
- 서울로7017
- 양재시민의숲
- 용마폭포공원
- 양화한강공원
- 일자산 허브천문공원
- 인천중앙공원
- 삼패한강공원
- 은계호수공원
- 화계사
- 동백호수공원
- 롯데백화점 동탄점

Standard는 추천 제거가 아닙니다. 일반 카드로 계속 노출됩니다.

## Current classifier size

- Diamond IDs: **4**
- Gold IDs: **24**
- Silver IDs: **85**
- 그 외 노출 명소: Standard

## Orthogonal features are separate

`Nightscape` 같은 특수 속성은 이 prominence audit과 별도입니다. Nightscape는 등급이 아니므로 Diamond/Gold/Silver/Standard와 겹칠 수 있습니다.

Examples:
- 롯데월드타워 = Diamond + Nightscape
- 반포한강공원 = Gold + Nightscape
- 낙산공원 = Silver + Nightscape

Feature source of truth: `src/data/curated-attraction-features.ts`.

## Important interpretation

- Diamond/Gold/Silver/Standard는 별점이나 절대적 품질 순위가 아닙니다.
- 음식점 랭킹과 관계없습니다.
- Diamond는 특히 제품 재미를 위한 희귀도 설계입니다.
- Standard는 “추천가치가 낮음”이 아니라 유명세를 과장하지 않는 일반 추천 카드입니다.
- 동일 attraction ID는 어느 역에서 노출되든 같은 prominence tier를 사용합니다.
- Nightscape 같은 feature는 독립적으로 중첩될 수 있습니다.
- 도시 트렌드와 장소 운영상태는 변하므로 재감사할 수 있습니다.
