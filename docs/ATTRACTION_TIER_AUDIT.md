# Random Seoul — Attraction Tier Audit

Last audited: 2026-09-17

추천 명소의 **prominence tier** 재검토 기록입니다. 실제 동작 source of truth는 `src/data/curated-attraction-tiers.ts`입니다.

## Audit principle

등급은 절대적인 품질점수가 아니라 결과 카드에서의 **목적지성 / 인지도 / 대표성 + 재미를 위한 희귀도**를 구분하는 UI 분류입니다.

- **Diamond**: Gold 중에서도 극소수 jackpot destination
- **Gold**: 전국적으로 널리 알려졌거나 여행 자체의 대표 목적지
- **Silver**: 도시·권역 대표급 또는 전국적으로 알려진 niche destination
- **Standard**: 충분히 둘러볼 가치가 있으나 유명세는 local 성격

Gold는 한국관광 100선, UNESCO/국가급 상징성, 현재 관광 인지도, 독립 목적지성을 강한 기준점으로 사용하되 기계적으로 분류하지 않습니다.

## Diamond jackpot tier

Exactly four:
- 경복궁
- 국립중앙박물관
- 롯데월드타워
- 북촌한옥마을

Diamond는 제품 재미를 위한 희귀도 설계이며 쉽게 늘리지 않습니다.

## Current Gold boundary

Current Gold includes the established 전국구 set plus **N서울타워**.

Representative:
- 창덕궁 / 종묘
- 광화문광장 / 청계천
- 광장시장 / 남대문시장
- DDP / 명동거리 / 홍대
- 성수 연무장길 / 서울숲
- 반포한강공원
- 석촌호수 / 올림픽공원
- 코엑스 / 서울대공원 / 에버랜드
- **N서울타워**
- 두물머리 / 남한산성 / 임진각 평화누리
- 송도 센트럴파크
- 인천 차이나타운 / 개항장거리

## Silver promotions / confirmations

Existing important Silver examples remain unchanged, including 가로수길, 용리단길, 대학로, 낙산공원, 서대문형무소역사관, 서소문성지역사박물관, 고척스카이돔, 잠실종합운동장, 동구릉, 인천대공원, 라베니체 등.

Recent changes:
- 서울 석촌동 고분군: Standard → Silver
- 응봉산 팔각정: new curated destination → Silver
- 남한산성 서문 전망대: new specific viewpoint → Silver
- 수원화성 서장대: new curated destination → Silver

The specific viewpoint may have a different prominence tier from the broader parent attraction. Example: 남한산성 is Gold while the newly separated `남한산성 서문 전망대` is Silver.

## Intentional Standard viewpoint examples

Nightscape feature does **not** automatically increase prominence. The following are useful elevated night-view destinations but remain Standard because their broad recognition is lower:
- 달맞이봉공원
- 매봉산 팔각정
- 용왕산 스카이워크
- 삼성해맞이공원
- 용마산 스카이워크
- 용양봉저정공원

Other intentional Standard examples remain 서울로7017, 양재시민의숲, 용마폭포공원, 양화한강공원, 일자산 허브천문공원, 인천중앙공원, 삼패한강공원, 은계호수공원, 화계사, 동백호수공원, 롯데백화점 동탄점 등.

## Current classifier size

- Diamond IDs: **4**
- Gold IDs: **25**
- Silver IDs: **88**
- remaining surfaced IDs: Standard

## Orthogonal Nightscape feature

Nightscape is not part of the prominence ranking. It may overlap any tier.

The strict current interpretation is **elevated city-light viewpoint**, not generic “pretty at night.”

Examples:
- 롯데월드타워 = Diamond + Nightscape
- N서울타워 = Gold + Nightscape
- 응봉산 팔각정 = Silver + Nightscape
- 용왕산 스카이워크 = Standard + Nightscape

DDP, 노들섬, 반포한강공원, 세빛섬, 석촌호수, 송도 센트럴파크, 광교호수공원, 라베니체 are no longer Nightscape, but their prominence tier and normal recommendation status are unchanged.

Feature source of truth: `src/data/curated-attraction-features.ts`.

## Important interpretation

- prominence tier is not an absolute quality score
- Diamond is intentionally a rarity mechanic
- Standard does not mean poor recommendation quality
- Nightscape does not imply Silver/Gold promotion
- same attraction ID keeps the same tier across stations
- trends and operating conditions can justify future re-audit
