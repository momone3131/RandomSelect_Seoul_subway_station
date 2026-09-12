import type { SubwayLine } from '../../domain/types';
import { resolveStationPlace } from '../../domain/station-resolver';
import type { StorageService } from '../storage/storage';
import type { PlaceSearchService } from './place-search';

export interface StationLocation {
  latitude: number;
  longitude: number;
  placeId: string;
}

interface StationCacheEntry extends StationLocation {
  savedAt: number;
}

type StationCache = Record<string, StationCacheEntry>;

export const STATION_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const STATION_CACHE_KEY = 'random_seoul_station_cache_v1';

function stationCacheId(line: SubwayLine, stationName: string): string {
  return `${line.id}|${stationName}`;
}

export class StationLocationService {
  constructor(
    private readonly places: PlaceSearchService,
    private readonly storage: StorageService,
    private readonly now: () => number = Date.now,
    private readonly ttlMs: number = STATION_CACHE_TTL_MS,
  ) {}

  async resolve(line: SubwayLine, stationName: string): Promise<StationLocation> {
    const cache = this.storage.read<StationCache>(STATION_CACHE_KEY, {});
    const key = stationCacheId(line, stationName);
    const cached = cache[key];

    if (cached && this.now() - cached.savedAt <= this.ttlMs) {
      return {
        latitude: cached.latitude,
        longitude: cached.longitude,
        placeId: cached.placeId,
      };
    }

    if (cached) {
      delete cache[key];
      this.storage.write(STATION_CACHE_KEY, cache);
    }

    const place = await resolveStationPlace(this.places, line, stationName);
    const resolved: StationLocation = {
      latitude: place.latitude,
      longitude: place.longitude,
      placeId: place.id,
    };

    cache[key] = { ...resolved, savedAt: this.now() };
    this.storage.write(STATION_CACHE_KEY, cache);
    return resolved;
  }
}
