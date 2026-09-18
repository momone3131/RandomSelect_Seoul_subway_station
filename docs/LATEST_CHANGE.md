# Latest Change — Multi-pass zero-coverage attraction re-audit

Date: 2026-09-18

## Product decision

Re-audit every station with zero curated attractions using actual nearby visit value, not only formal tourism lists.

Research combines municipal/cultural-tourism sources, map/transit proximity, traditional markets, sizeable parks/waterfronts, museums/cultural venues, specialized streets, worthwhile campus facilities and real trail/viewpoint access.

## Final result

Baseline after physical-interchange consistency fix:
- 800 line/station outcomes: 391 zero / 307 one / 102 two
- 346 physical station groups with no attraction
- 330 unique surfaced attractions

After the multi-pass re-audit:
- **262 zero / 432 one / 106 two**
- **67.3% attraction coverage**
- **237 physical station groups remain uncurated**
- **419 unique surfaced attractions**
- prominence: Diamond 4 / Gold 25 / Silver 100 / Standard 290

Representative additions include 민주화운동기념관, 서울시립 사진미술관, 서울로봇인공지능과학관, 물향기수목원, 홍유릉, 대성리 국민관광지, 원인재, 양천향교, 겸재정선미술관, 서울성북미디어문화마루, 마포농수산물시장, 김포 장릉, 성남아트센터 and multiple local markets/cultural streets.

## Guardrails

- station names are not evidence by themselves
- no forced 1–2 place fill
- exact/self-contained map targets are required
- planned/unbuilt destinations stay excluded
- substantial onward bus transfer or clearly too-distant destinations stay excluded
- weak apartment parks/generic resident facilities stay excluded
- same destination reuses an existing attraction ID
- physical interchange equivalence is applied before curation merge

Examples intentionally rejected/kept empty after research include 검단호수공원, 세종대왕릉역, 신둔도예촌, and 오남호수공원 from 오남역. The temporary 신답→답십리 고미술상가 mapping was removed because official access evidence points to 답십리역 rather than 신답역.

## Implementation

- `src/data/curated-attractions-local.ts`
- `src/data/curated-attraction-tiers.ts`
- `tests/curated-attractions.test.ts`
- documentation synchronized with final coverage counts
