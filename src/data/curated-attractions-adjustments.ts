import type { AttractionRecommendation } from '../domain/types';

// Small editorial overrides that intentionally take precedence over the broader
// extra/local layers when a station deserves a specific two-place composition.
const BY_STATION = new Map<string, readonly AttractionRecommendation[]>([
  [
    'l1:용산',
    [
      { id: 'ipark-mall-yongsan', name: '아이파크몰 용산', category: '복합문화·쇼핑', mapQuery: '아이파크몰 용산' },
      { id: 'yongridan-gil', name: '용리단길', category: '거리·상권', mapQuery: '용리단길 서울 용산구 한강로2가' },
    ],
  ],
  [
    'gc:용산',
    [
      { id: 'ipark-mall-yongsan', name: '아이파크몰 용산', category: '복합문화·쇼핑', mapQuery: '아이파크몰 용산' },
      { id: 'yongridan-gil', name: '용리단길', category: '거리·상권', mapQuery: '용리단길 서울 용산구 한강로2가' },
    ],
  ],
]);

export function getAdjustedCuratedAttractions(lineId: string, stationName: string): AttractionRecommendation[] {
  return (BY_STATION.get(`${lineId}:${stationName}`) ?? []).map((item) => ({ ...item }));
}
