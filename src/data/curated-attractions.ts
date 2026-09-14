import type { AttractionRecommendation } from '../domain/types';
import { getCuratedAttractions as getBaseCuratedAttractions } from './curated-attractions-base';
import { getExtraCuratedAttractions } from './curated-attractions-extra';

export function getCuratedAttractions(lineId: string, stationName: string): AttractionRecommendation[] {
  const merged = [
    ...getBaseCuratedAttractions(lineId, stationName),
    ...getExtraCuratedAttractions(lineId, stationName),
  ];
  const seen = new Set<string>();
  return merged
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, 2)
    .map((item) => ({ ...item }));
}
