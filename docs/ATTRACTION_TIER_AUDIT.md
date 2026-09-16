# Random Seoul — Attraction Tier Audit

Last audited: 2026-09-16

이 문서는 추천 명소의 **시각적 prominence tier** 전수 재검토 기록입니다. 실제 동작의 source of truth는 `src/data/curated-attraction-tiers.ts`입니다.

## Audit principle

등급은 장소의 절대적인 품질점수가 아닙니다. Random Seoul 결과 카드에서 사용자가 느끼는 **목적지성 / 인지도 / 대표성**을 구분하기 위한 UI 분류입니다.

- **Gold**: 전국적으로 널리 알려졌거나 여행 자체의 대표 목적지가 될 수 있는 곳
- **Silver**: 도시·권역 대표급 또는 전국적으로 알려진 niche destination
- **Standard**: 해당 역에서 실제로 둘러볼 가치가 있지만 유명세는 local 성격인 곳

Gold는 보수적으로 운영합니다. 2025~2026 문화체육관광부·한국관광공사 `한국관광 100선`을 강한 기준점으로 사용하되, 100선 포함 여부만으로 기계적으로 분류하지는 않습니다. UNESCO/국가급 상징성, 현재 관광객 인지도, 장소 자체의 독립 목적지성도 함께 봅니다.

Silver는 한국관광공사 `대한민국 구석구석`, 서울·인천 등 공식 관광정보에서 대표 목적지로 다뤄지는지와 권역 밖 방문자가 일부러 갈 이유가 있는지를 함께 봅니다.

## Primary external references

- 문화체육관광부, 2025~2026 한국관광 100선 발표
  - https://www.mcst.go.kr/site/s_notice/press/pressView.jsp?pSeq=21611
- 대한민국 구석구석 한국관광100선
  - https://korean.visitkorea.or.kr/other/otherService.do?otdid=622bcd99-84fa-11e8-8165-020027310001
- 서울 공식 관광정보 Visit Seoul
  - https://visitseoul.net/
- 대한민국 구석구석 / 열린관광 명소 데이터
  - https://korean.visitkorea.or.kr/

2025~2026 한국관광 100선의 수도권 항목 가운데 현재 Random Seoul 데이터와 직접 대응되는 대표 사례에는 `성수동 거리&서울숲`, `홍대`, `국립중앙박물관`, `서울스카이&롯데월드&석촌호수`, `광화문광장`, `송도 센트럴파크`, `개항장문화지구-인천차이나타운`, `에버랜드`, `임진각과 파주DMZ`, `두물머리`, `서울대공원` 등이 있습니다.

## 2026-09 full-audit changes

### Gold promotions

전국구/목적지급으로 상향:

- 청계천 (`cheonggyecheon-stream`)
- 성수 연무장길 (`seongsu-yeonmujang-gil`)
- 서울숲 (`seoul-forest`)
- 석촌호수 (`seokchon-lake`)
- 임진각 평화누리 (`imjingak-pyeonghwa-nuri`)
- 송도 센트럴파크 (`songdo-central-park`)
- 인천 차이나타운 (`incheon-chinatown`)
- 인천 개항장거리 (`incheon-open-port-street`)

기존 Gold 중에는 이번 감사에서 하향이 필요하다고 판단한 항목이 없었습니다. 기존 Gold는 전국구 인지도, 국가급 문화유산/랜드마크, 대표 관광지 성격이 충분하다고 보았습니다.

### Silver promotions

기존 Standard에서 주요 유명 목적지로 상향한 대표 항목:

- 서대문형무소역사관
- 동묘벼룩시장
- 동대문종합시장
- 경동시장
- 대학로
- 낙산공원
- 경희궁
- 이태원 세계음식거리
- 국립서울현충원
- 문래창작촌
- 신당동 떡볶이타운
- 강남역 강남대로
- 홍제폭포
- 봉은사
- 명동성당
- 압구정로데오거리
- 청담 명품거리
- 일산호수공원
- 안양예술공원
- 국립과천과학관
- 동구릉
- 관악산
- 인천대공원
- 신포국제시장
- 소래포구전통어시장
- 강촌유원지
- 소양강스카이워크
- 보정동 카페거리
- 백남준아트센터
- 소요산
- 라베니체 마치에비뉴
- 고척스카이돔

가로수길과 용리단길은 직전 조정에서 이미 Silver로 상향했고 이번 전체 감사에서도 유지했습니다.

### Silver → Standard demotions

좋은 방문지는 맞지만 `주요 유명 목적지`라는 Silver 기준에는 과하다고 판단해 local tier로 정리:

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

이 변경은 추천에서 제거하는 것이 아닙니다. **카드는 그대로 추천되며 금/은 metallic 강조만 사라집니다.**

## Important interpretation

- Gold/Silver/Standard는 별점이나 품질 순위가 아닙니다.
- 음식점 랭킹과 관계없습니다.
- 특정 장소가 Standard라고 해서 추천가치가 낮다는 뜻이 아니라, 유명세/목적지성을 과장하지 않기 위한 구분입니다.
- 같은 attraction ID는 어느 역에서 노출되든 같은 tier를 사용합니다.
- 유명세와 도시 트렌드는 변할 수 있으므로 주기적으로 재감사합니다.
