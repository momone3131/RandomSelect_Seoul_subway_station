import { describe, expect, it } from 'vitest';
import { resolveStationPlace } from '../src/domain/station-resolver';
import { SUBWAY_LINE_BY_ID } from '../src/data/subway-lines';
import type { PlaceCandidate, PlaceSearchRequest } from '../src/domain/types';
import type { PlaceSearchService } from '../src/services/places/place-search';

class FakePlaceSearch implements PlaceSearchService {
  lastRequest?: PlaceSearchRequest;

  constructor(private readonly results: PlaceCandidate[]) {}

  async searchText(request: PlaceSearchRequest): Promise<PlaceCandidate[]> {
    this.lastRequest = request;
    return this.results;
  }
}

describe('station resolver', () => {
  it('prefers the transit place matching both station name and line token', async () => {
    const line = SUBWAY_LINE_BY_ID.get('l2');
    expect(line).toBeDefined();

    const service = new FakePlaceSearch([
      {
        id: 'wrong', name: '강남역 맛집', category: '음식점', address: '서울 강남구',
        latitude: 37.49, longitude: 127.03, types: ['restaurant'], searchRank: 0,
      },
      {
        id: 'right', name: '강남역 2호선', category: '지하철역', address: '서울 강남구 강남대로',
        latitude: 37.4979, longitude: 127.0276, types: ['subway_station'], searchRank: 1,
      },
    ]);

    const result = await resolveStationPlace(service, line!, '강남');
    expect(result.id).toBe('right');
    expect(service.lastRequest?.textQuery).toBe('강남역 2호선');
    expect(service.lastRequest?.maxResults).toBe(5);
  });

  it('strips parenthetical aliases when building the station query', async () => {
    const line = SUBWAY_LINE_BY_ID.get('l4');
    expect(line).toBeDefined();
    const service = new FakePlaceSearch([
      {
        id: 'isu', name: '총신대입구역 4호선', category: '지하철역', address: '서울 동작구',
        latitude: 37.486, longitude: 126.982, types: ['subway_station'], searchRank: 0,
      },
    ]);

    await resolveStationPlace(service, line!, '총신대입구(이수)');
    expect(service.lastRequest?.textQuery).toBe('총신대입구역 4호선');
  });
});
