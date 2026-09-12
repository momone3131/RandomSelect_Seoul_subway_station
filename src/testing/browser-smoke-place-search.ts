import type { PlaceCandidate, PlaceSearchRequest } from '../domain/types';
import type { PlaceSearchService } from '../services/places/place-search';

/**
 * Deterministic in-memory provider used only by modular.html?selftest=1.
 * It must never make network calls or consume Google quota.
 */
export class BrowserSmokePlaceSearchService implements PlaceSearchService {
  readonly requests: PlaceSearchRequest[] = [];

  async searchText(request: PlaceSearchRequest): Promise<PlaceCandidate[]> {
    this.requests.push(request);
    if ((request.maxResults ?? 20) <= 5) {
      return [{
        id: 'selftest-station',
        name: '연천역 1호선',
        category: '지하철역',
        address: '경기도 연천군',
        latitude: 38.1000,
        longitude: 127.0750,
        types: ['subway_station'],
        searchRank: 0,
      }];
    }

    return [
      {
        id: 'selftest-a', name: '랜덤서울 백반 A', category: '한식',
        latitude: 38.1004, longitude: 127.0752, types: ['restaurant'],
        rating: 4.6, userRatingCount: 480, searchRank: 0, mapUrl: 'https://example.invalid/a',
      },
      {
        id: 'selftest-b', name: '랜덤서울 백반 B', category: '한식',
        latitude: 38.1010, longitude: 127.0755, types: ['restaurant'],
        rating: 4.8, userRatingCount: 42, searchRank: 1, mapUrl: 'https://example.invalid/b',
      },
      {
        id: 'selftest-c', name: '랜덤서울 백반 C', category: '한식',
        latitude: 38.1020, longitude: 127.0760, types: ['restaurant'],
        rating: 4.4, userRatingCount: 1200, searchRank: 2, mapUrl: 'https://example.invalid/c',
      },
      {
        id: 'selftest-far', name: '2km 밖 식당', category: '한식',
        latitude: 38.1300, longitude: 127.0750, types: ['restaurant'],
        rating: 5.0, userRatingCount: 9999, searchRank: 3, mapUrl: 'https://example.invalid/far',
      },
    ];
  }
}
