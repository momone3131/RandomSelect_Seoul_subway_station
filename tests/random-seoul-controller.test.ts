import { describe, expect, it } from 'vitest';
import { RandomSeoulController } from '../src/application/random-seoul-controller';
import type { PlaceCandidate, PlaceSearchRequest } from '../src/domain/types';
import { AppStore, createInitialState } from '../src/state/app-state';
import type { PlaceSearchService } from '../src/services/places/place-search';
import { StationLocationService } from '../src/services/places/station-location';
import type { StorageService } from '../src/services/storage/storage';

class MemoryStorage implements StorageService {
  private readonly values = new Map<string, string>();
  read<T>(key: string, fallback: T): T {
    const raw = this.values.get(key);
    return raw === undefined ? fallback : JSON.parse(raw) as T;
  }
  write<T>(key: string, value: T): void { this.values.set(key, JSON.stringify(value)); }
  remove(key: string): void { this.values.delete(key); }
}

class ScenarioPlaces implements PlaceSearchService {
  requests: PlaceSearchRequest[] = [];

  async searchText(request: PlaceSearchRequest): Promise<PlaceCandidate[]> {
    this.requests.push(request);
    if (request.textQuery.includes('2호선')) {
      return [{
        id: 'cityhall-station', name: '시청역 2호선', category: '지하철역', address: '서울 중구',
        latitude: 37.5657, longitude: 126.9769, types: ['subway_station'], searchRank: 0,
      }];
    }
    return [
      {
        id: 'a', name: '딤섬 A', category: '딤섬', latitude: 37.5660, longitude: 126.9770,
        types: ['restaurant'], rating: 4.6, userRatingCount: 400, searchRank: 0, mapUrl: 'https://example.com/a',
      },
      {
        id: 'b', name: '딤섬 B', category: '딤섬', latitude: 37.5670, longitude: 126.9780,
        types: ['restaurant'], rating: 4.8, userRatingCount: 5, searchRank: 1, mapUrl: 'https://example.com/b',
      },
    ];
  }
}

describe('RandomSeoulController', () => {
  it('runs line → station → food selection, then loads recommendations separately', async () => {
    const places = new ScenarioPlaces();
    const storage = new MemoryStorage();
    const store = new AppStore(createInitialState(['l2'], ['c_dimsum']));
    const locations = new StationLocationService(places, storage, () => 1_000_000);
    const controller = new RandomSeoulController(store, places, locations, () => 0, () => 1_000_000);

    expect((await controller.drawNext()).stage).toBe('line');
    expect(store.getSnapshot().currentLine?.id).toBe('l2');

    expect((await controller.drawNext()).stage).toBe('station');
    expect(store.getSnapshot().currentStation?.name).toBe('시청');

    const foodResult = await controller.drawNext();
    expect(foodResult.stage).toBe('food');
    expect(store.getSnapshot().currentFood?.id).toBe('c_dimsum');
    expect(store.getSnapshot().recommendations).toHaveLength(0);
    expect(store.getSnapshot().history[0]?.foodId).toBe('c_dimsum');

    await controller.loadRecommendations();
    expect(store.getSnapshot().recommendations.length).toBeGreaterThan(0);

    expect((await controller.drawNext()).stage).toBe('line');
    expect(store.getSnapshot().currentLine?.id).toBe('l2');
    expect(store.getSnapshot().currentStation).toBeUndefined();
    expect(store.getSnapshot().currentFood).toBeUndefined();
  });

  it('uses a 2 km restaurant search centered on the static station coordinates', async () => {
    const places = new ScenarioPlaces();
    const storage = new MemoryStorage();
    const store = new AppStore(createInitialState(['l2'], ['c_dimsum']));
    const locations = new StationLocationService(places, storage, () => 1_000_000);
    const controller = new RandomSeoulController(store, places, locations, () => 0);

    await controller.drawNext();
    await controller.drawNext();
    await controller.drawNext();
    await controller.loadRecommendations();

    const restaurantRequest = places.requests.find((request) => request.textQuery.includes('딤섬'));
    expect(restaurantRequest?.radiusMeters).toBe(2000);
    expect(restaurantRequest?.maxResults).toBe(20);
    expect(restaurantRequest?.center).toEqual({ latitude: 37.563588, longitude: 126.975411 });
    expect(places.requests.some((request) => request.textQuery.includes('2호선'))).toBe(false);
  });
});
