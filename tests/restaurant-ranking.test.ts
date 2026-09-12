import { describe, expect, it } from 'vitest';
import { rankRestaurants } from '../src/domain/restaurant-ranking';
import type { PlaceCandidate } from '../src/domain/types';

const station = { latitude: 37.484, longitude: 126.929 };

function candidate(overrides: Partial<PlaceCandidate>): PlaceCandidate {
  return {
    id: 'x',
    name: '식당',
    category: 'restaurant',
    latitude: 37.484,
    longitude: 126.929,
    rating: 4.5,
    userRatingCount: 100,
    searchRank: 0,
    ...overrides
  };
}

describe('restaurant ranking', () => {
  it('filters out candidates beyond 2 km', () => {
    const results = rankRestaurants([
      candidate({ id: 'near', latitude: 37.485, longitude: 126.929 }),
      candidate({ id: 'far', latitude: 37.52, longitude: 126.929 })
    ], station);

    expect(results.map((item) => item.id)).toContain('near');
    expect(results.map((item) => item.id)).not.toContain('far');
  });

  it('does not let a tiny number of perfect ratings dominate a heavily reviewed strong place', () => {
    const results = rankRestaurants([
      candidate({ id: 'tiny', rating: 5, userRatingCount: 2, searchRank: 0 }),
      candidate({ id: 'trusted', rating: 4.6, userRatingCount: 700, searchRank: 1 })
    ], station);

    expect(results[0]?.id).toBe('trusted');
  });

  it('caps output at three recommendations', () => {
    const results = rankRestaurants([
      candidate({ id: 'a', searchRank: 0 }),
      candidate({ id: 'b', searchRank: 1 }),
      candidate({ id: 'c', searchRank: 2 }),
      candidate({ id: 'd', searchRank: 3 })
    ], station);

    expect(results).toHaveLength(3);
  });
});
