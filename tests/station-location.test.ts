import { describe, expect, it } from 'vitest';
import { SUBWAY_LINE_BY_ID } from '../src/data/subway-lines';
import type { PlaceCandidate, PlaceSearchRequest } from '../src/domain/types';
import type { PlaceSearchService } from '../src/services/places/place-search';
import { StationLocationService } from '../src/services/places/station-location';
import type { StorageService } from '../src/services/storage/storage';

class MemoryStorage implements StorageService {
  private readonly values = new Map<string, string>();

  read<T>(key: string, fallback: T): T {
    const raw = this.values.get(key);
    return raw === undefined ? fallback : JSON.parse(raw) as T;
  }

  write<T>(key: string, value: T): void {
    this.values.set(key, JSON.stringify(value));
  }

  remove(key: string): void {
    this.values.delete(key);
  }
}

class CountingPlaces implements PlaceSearchService {
  calls = 0;
  constructor(private readonly result: PlaceCandidate) {}

  async searchText(_request: PlaceSearchRequest): Promise<PlaceCandidate[]> {
    this.calls += 1;
    return [this.result];
  }
}

describe('station location cache', () => {
  it('reuses a station coordinate within the 30-day cache window', async () => {
    const line = SUBWAY_LINE_BY_ID.get('l2')!;
    const places = new CountingPlaces({
      id: 'gangnam', name: '강남역 2호선', category: '지하철역', address: '서울 강남구',
      latitude: 37.4979, longitude: 127.0276, types: ['subway_station'], searchRank: 0,
    });
    const storage = new MemoryStorage();
    let now = 1_000_000;
    const service = new StationLocationService(places, storage, () => now);

    const first = await service.resolve(line, '강남');
    now += 10 * 24 * 60 * 60 * 1000;
    const second = await service.resolve(line, '강남');

    expect(first).toEqual(second);
    expect(places.calls).toBe(1);
  });

  it('refreshes an expired station coordinate', async () => {
    const line = SUBWAY_LINE_BY_ID.get('l2')!;
    const places = new CountingPlaces({
      id: 'gangnam', name: '강남역 2호선', category: '지하철역', address: '서울 강남구',
      latitude: 37.4979, longitude: 127.0276, types: ['subway_station'], searchRank: 0,
    });
    const storage = new MemoryStorage();
    let now = 1_000_000;
    const service = new StationLocationService(places, storage, () => now);

    await service.resolve(line, '강남');
    now += 31 * 24 * 60 * 60 * 1000;
    await service.resolve(line, '강남');

    expect(places.calls).toBe(2);
  });
});
