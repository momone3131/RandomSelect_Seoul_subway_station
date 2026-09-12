import { registerPlugin } from '@capacitor/core';
import type { PlaceCandidate, PlaceSearchRequest, ProviderAttribution } from '../../domain/types';
import type { PlaceSearchService } from './place-search';

interface NativePlaceSearchRequest {
  textQuery: string;
  center?: { latitude: number; longitude: number };
  radiusMeters?: number;
  maxResults?: number;
  language?: string;
  region?: string;
}

interface NativePlaceCandidate {
  id: string;
  name: string;
  category?: string;
  latitude: number;
  longitude: number;
  address?: string;
  types?: string[];
  rating?: number;
  userRatingCount?: number;
  mapUrl?: string;
  attributions?: ProviderAttribution[];
  searchRank: number;
}

interface RandomSeoulPlacesPlugin {
  searchText(options: NativePlaceSearchRequest): Promise<{ places: NativePlaceCandidate[] }>;
}

const NativePlaces = registerPlugin<RandomSeoulPlacesPlugin>('RandomSeoulPlaces');

export class NativePlaceSearchService implements PlaceSearchService {
  async searchText(request: PlaceSearchRequest): Promise<PlaceCandidate[]> {
    const { places } = await NativePlaces.searchText({
      textQuery: request.textQuery,
      center: request.center,
      radiusMeters: request.radiusMeters,
      maxResults: request.maxResults,
      language: request.language,
      region: request.region,
    });

    return places.map((place) => ({
      id: place.id,
      name: place.name,
      category: place.category ?? '',
      latitude: place.latitude,
      longitude: place.longitude,
      address: place.address,
      types: place.types ?? [],
      rating: place.rating,
      userRatingCount: place.userRatingCount,
      mapUrl: place.mapUrl,
      attributions: place.attributions ?? [],
      searchRank: place.searchRank,
    }));
  }
}
