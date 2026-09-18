# Latest Change — Zero-coverage attraction re-audit

Date: 2026-09-18

## Product decision

Re-audit stations with zero curated attractions using actual nearby visit value, not only formal tourism lists.

Research includes municipal tourism/culture sources, map/transit proximity, traditional markets, sizable parks/waterfronts, museums/cultural venues, specialized streets, campuses and trailheads. Tiny neighborhood facilities, planned/unbuilt destinations and locations requiring substantial onward transit remain excluded.

## Result

- 45 new unique curated destinations
- 8 existing strong destination IDs reused for additional nearby stations
- 800 line/station outcomes: 391 zero / 307 one / 102 two → **319 zero / 377 one / 104 two**
- attraction coverage: **47.4% → 60.1%**
- physical missing station groups: **346 → 288**
- surfaced unique attractions: **375**
- prominence: Diamond 4 / Gold 25 / Silver 96 / Standard 250

Representative additions include 민주화운동기념관, 물향기수목원, 홍유릉, 대성리 국민관광지, 원인재, 김포 장릉, 성남아트센터, 의정부음악도서관 and multiple local markets/cultural streets.

## Guardrails

- station names are not evidence by themselves
- no forced two-place fill
- exact map targets remain required
- real physical interchange equivalence remains applied before curation merge
- same destination must reuse the existing attraction ID instead of creating duplicates

## Implementation

- `src/data/curated-attractions-local.ts`
- `src/data/curated-attraction-tiers.ts`
- `tests/curated-attractions.test.ts`
- documentation synchronized with the new coverage counts
