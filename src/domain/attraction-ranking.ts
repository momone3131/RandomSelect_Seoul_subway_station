import { haversineMeters } from './restaurant-ranking';
import type { AttractionRecommendation, PlaceCandidate } from './types';

export interface AttractionRankingOptions {
  maxDistanceMeters: number;
  topN: number;
  minReviewCount: number;
  minScore: number;
}

export const DEFAULT_ATTRACTION_RANKING_OPTIONS: AttractionRankingOptions = {
  maxDistanceMeters: 2000,
  topN: 2,
  minReviewCount: 20,
  minScore: 0.45,
};

export const ATTRACTION_PLACE_TYPES = new Set([
  'tourist_attraction', 'museum', 'art_museum', 'history_museum', 'art_gallery',
  'cultural_landmark', 'historical_place', 'historical_landmark', 'monument', 'castle',
  'park', 'city_park', 'national_park', 'state_park', 'garden', 'botanical_garden',
  'plaza', 'observation_deck', 'aquarium', 'zoo', 'wildlife_park', 'visitor_center',
  'cultural_center', 'performing_arts_theater', 'sculpture', 'fountain', 'planetarium',
  'marina', 'hiking_area',
]);

const CATEGORY_HINT = /(관광|명소|박물관|미술관|공원|역사|문화|기념|전망|궁|정원|수족관|동물원|광장)/;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function isAttractionCandidate(candidate: PlaceCandidate): boolean {
  const types = candidate.types ?? [];
  if (types.some((type) => ATTRACTION_PLACE_TYPES.has(type))) return true;
  return types.length === 0 && CATEGORY_HINT.test(candidate.category);
}

export function rankAttractions(
  candidates: readonly PlaceCandidate[],
  station: { latitude: number; longitude: number },
  options: AttractionRankingOptions = DEFAULT_ATTRACTION_RANKING_OPTIONS,
): AttractionRecommendation[] {
  const reviewLogCap = Math.log(5001);

  return candidates
    .filter(isAttractionCandidate)
    .map((candidate) => {
      const distanceMeters = haversineMeters(
        station.latitude,
        station.longitude,
        candidate.latitude,
        candidate.longitude,
      );
      const reviews = Math.max(0, candidate.userRatingCount ?? 0);
      const rating = Number.isFinite(candidate.rating) ? candidate.rating as number : 4.2;
      const relevanceSignal = 1 / (1 + candidate.searchRank * 0.22);
      const reviewSignal = clamp01(Math.log(1 + reviews) / reviewLogCap);
      const distanceSignal = 1 / (1 + distanceMeters / 1200);
      const ratingSignal = clamp01((rating - 3.5) / 1.5);
      const score = relevanceSignal * 0.45
        + reviewSignal * 0.30
        + distanceSignal * 0.15
        + ratingSignal * 0.10;

      return { ...candidate, distanceMeters, score } satisfies AttractionRecommendation;
    })
    .filter((candidate) => (
      Number.isFinite(candidate.distanceMeters)
      && candidate.distanceMeters <= options.maxDistanceMeters
      && (candidate.userRatingCount ?? 0) >= options.minReviewCount
      && candidate.score >= options.minScore
    ))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if ((b.userRatingCount ?? 0) !== (a.userRatingCount ?? 0)) {
        return (b.userRatingCount ?? 0) - (a.userRatingCount ?? 0);
      }
      return a.distanceMeters - b.distanceMeters;
    })
    .slice(0, options.topN);
}
