import { describe, expect, it } from 'vitest';
import { rankAttractions } from '../src/domain/attraction-ranking';
import type { PlaceCandidate } from '../src/domain/types';

const station = { latitude: 37.5210, longitude: 126.9685 };

function place(overrides: Partial<PlaceCandidate> & Pick<PlaceCandidate, 'id' | 'name'>): PlaceCandidate {
  return {
    category: '관광 명소',
    latitude: 37.5230,
    longitude: 126.9688,
    types: ['tourist_attraction'],
    rating: 4.6,
    userRatingCount: 300,
    searchRank: 0,
    ...overrides,
  };
}

describe('rankAttractions', () => {
  it('keeps strong nearby attractions and returns at most two', () => {
    const candidates = [
      place({ id: 'museum', name: '국립중앙박물관', types: ['museum'], userRatingCount: 25000, searchRank: 0 }),
      place({ id: 'park', name: '용산가족공원', types: ['park'], userRatingCount: 2800, searchRank: 1 }),
      place({ id: 'gallery', name: '전시관', types: ['art_gallery'], userRatingCount: 900, searchRank: 2 }),
    ];

    const ranked = rankAttractions(candidates, station);
    expect(ranked).toHaveLength(2);
    expect(ranked[0]?.id).toBe('museum');
  });

  it('hides weak, irrelevant, and over-2km candidates instead of forcing a recommendation', () => {
    const candidates = [
      place({ id: 'weak', name: '작은 볼거리', userRatingCount: 3 }),
      place({ id: 'food', name: '식당', types: ['restaurant'], userRatingCount: 5000 }),
      place({ id: 'far', name: '먼 박물관', types: ['museum'], latitude: 37.5500, longitude: 126.9685, userRatingCount: 5000 }),
    ];

    expect(rankAttractions(candidates, station)).toEqual([]);
  });
});
