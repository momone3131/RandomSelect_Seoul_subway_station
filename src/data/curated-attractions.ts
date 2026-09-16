import type { AttractionRecommendation } from '../domain/types';
import { attractionTierForId } from './curated-attraction-tiers';
import { getAdjustedCuratedAttractions } from './curated-attractions-adjustments';
import { getCuratedAttractions as getBaseCuratedAttractions } from './curated-attractions-base';
import { getExtraCuratedAttractions } from './curated-attractions-extra';
import { getLocalCuratedAttractions } from './curated-attractions-local';

export function getCuratedAttractions(lineId: string, stationName: string): AttractionRecommendation[] {
  const merged = [
    ...getBaseCuratedAttractions(lineId, stationName),
    ...getAdjustedCuratedAttractions(lineId, stationName),
    ...getExtraCuratedAttractions(lineId, stationName),
    ...getLocalCuratedAttractions(lineId, stationName),
  ];
  const seen = new Set<string>();
  return merged
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, 2)
    .map((item) => ({
      ...item,
      tier: item.tier ?? attractionTierForId(item.id),
    }));
}
