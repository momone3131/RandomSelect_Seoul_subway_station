import type { PlaceCandidate, RestaurantRecommendation } from './types';

export interface RankingWeights {
  rating: number;
  reviews: number;
  relevance: number;
  distance: number;
}

export interface RankingOptions {
  maxDistanceMeters: number;
  topN: number;
  bayesianPriorCount: number;
  defaultMeanRating: number;
  reviewLogReference: number;
  relevanceDecay: number;
  distanceScaleMeters: number;
  weights: RankingWeights;
}

export const DEFAULT_RANKING_OPTIONS: RankingOptions = {
  maxDistanceMeters: 2000,
  topN: 3,
  bayesianPriorCount: 40,
  defaultMeanRating: 4.2,
  reviewLogReference: 1000,
  relevanceDecay: 0.14,
  distanceScaleMeters: 900,
  weights: {
    rating: 0.55,
    reviews: 0.25,
    relevance: 0.15,
    distance: 0.05
  }
};

function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const radius = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function meanRating(candidates: readonly PlaceCandidate[], fallback: number): number {
  const rated = candidates.filter((candidate) => Number.isFinite(candidate.rating) && (candidate.rating ?? 0) > 0);
  if (!rated.length) return fallback;
  return rated.reduce((sum, candidate) => sum + (candidate.rating ?? 0), 0) / rated.length;
}

export function rankRestaurants(
  candidates: readonly PlaceCandidate[],
  station: { latitude: number; longitude: number },
  options: RankingOptions = DEFAULT_RANKING_OPTIONS
): RestaurantRecommendation[] {
  const eligible = candidates
    .map((candidate) => ({
      candidate,
      distanceMeters: haversineMeters(
        station.latitude,
        station.longitude,
        candidate.latitude,
        candidate.longitude
      )
    }))
    .filter(({ distanceMeters }) => Number.isFinite(distanceMeters) && distanceMeters <= options.maxDistanceMeters);

  if (!eligible.length) return [];

  const eligibleCandidates = eligible.map(({ candidate }) => candidate);
  const populationMean = meanRating(eligibleCandidates, options.defaultMeanRating);
  const reviewLogCap = Math.log(1 + options.reviewLogReference);
  const weightSum = Object.values(options.weights).reduce((sum, weight) => sum + weight, 0);

  return eligible
    .map(({ candidate, distanceMeters }) => {
      const rating = Number.isFinite(candidate.rating) && (candidate.rating ?? 0) > 0
        ? candidate.rating as number
        : populationMean;
      const reviews = Math.max(0, candidate.userRatingCount ?? 0);
      const bayesianRating = (
        reviews / (reviews + options.bayesianPriorCount) * rating
        + options.bayesianPriorCount / (reviews + options.bayesianPriorCount) * populationMean
      );

      const ratingSignal = clamp01((bayesianRating - 3.5) / 1.5);
      const reviewSignal = clamp01(Math.log(1 + reviews) / reviewLogCap);
      const relevanceSignal = 1 / (1 + candidate.searchRank * options.relevanceDecay);
      const distanceSignal = 1 / (1 + distanceMeters / options.distanceScaleMeters);
      const score = (
        ratingSignal * options.weights.rating
        + reviewSignal * options.weights.reviews
        + relevanceSignal * options.weights.relevance
        + distanceSignal * options.weights.distance
      ) / weightSum;

      return {
        ...candidate,
        distanceMeters,
        bayesianRating,
        score
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if ((b.userRatingCount ?? 0) !== (a.userRatingCount ?? 0)) {
        return (b.userRatingCount ?? 0) - (a.userRatingCount ?? 0);
      }
      return a.distanceMeters - b.distanceMeters;
    })
    .slice(0, options.topN);
}
