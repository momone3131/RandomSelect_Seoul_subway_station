import { describe, expect, it } from 'vitest';
import { SUBWAY_LINE_BY_ID } from '../src/data/subway-lines';
import { StationLocationService } from '../src/services/places/station-location';
import type { PlaceSearchService } from '../src/services/places/place-search';
import type { StorageService } from '../src/services/storage/storage';

class MemoryStorage implements StorageService {
  private readonly data = new Map<string, unknown>();

  read<T>(key: string, fallback: T): T {
    return (this.data.get(key) as T | undefined) ?? fallback;
  }

  write<T>(key: string, value: T): void {
    this.data.set(key, value);
  }

  remove(key: string): void {
    this.data.delete(key);
  }
}

describe('StationLocationService static-first resolution', () => {
  it('uses the static coordinate DB without calling Google for covered stations', async () => {
    let searchCalls = 0;
    const places: PlaceSearchService = {
      async searchText() {
        searchCalls += 1;
        return [];
      },
    };
    const line = SUBWAY_LINE_BY_ID.get('l4');
    expect(line).toBeDefined();

    const service = new StationLocationService(places, new MemoryStorage());
    const location = await service.resolve(line!, '이촌');

    expect(location).toEqual({ latitude: 37.522295, longitude: 126.974733 });
    expect(searchCalls).toBe(0);
  });
});
