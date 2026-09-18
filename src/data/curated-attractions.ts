import type { AttractionRecommendation } from '../domain/types';
import { isNightscapeAttraction } from './curated-attraction-features';
import { attractionTierForId } from './curated-attraction-tiers';
import { getAdjustedCuratedAttractions } from './curated-attractions-adjustments';
import { getCuratedAttractions as getBaseCuratedAttractions } from './curated-attractions-base';
import { getExtraCuratedAttractions } from './curated-attractions-extra';
import { getLocalCuratedAttractions } from './curated-attractions-local';
import { getNightViewpointAttractions } from './curated-attractions-night-viewpoints';
import { getEquivalentStationReferences } from './station-equivalence';

export function getCuratedAttractions(lineId: string, stationName: string): AttractionRecommendation[] {
  const equivalentStations = getEquivalentStationReferences(lineId, stationName);
  const merged = [
    ...equivalentStations.flatMap((station) => getBaseCuratedAttractions(station.lineId, station.stationName)),
    ...equivalentStations.flatMap((station) => getAdjustedCuratedAttractions(station.lineId, station.stationName)),
    ...equivalentStations.flatMap((station) => getExtraCuratedAttractions(station.lineId, station.stationName)),
    ...equivalentStations.flatMap((station) => getLocalCuratedAttractions(station.lineId, station.stationName)),
    ...equivalentStations.flatMap((station) => getNightViewpointAttractions(station.lineId, station.stationName)),
  ];
  const seen = new Set<string>();
  return merged
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, 2)
    .map((item) => {
      const nightscape = item.nightscape ?? isNightscapeAttraction(item.id);
      return {
        ...item,
        tier: item.tier ?? attractionTierForId(item.id),
        ...(nightscape ? { nightscape: true } : {}),
      };
    });
}
