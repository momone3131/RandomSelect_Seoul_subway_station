import { Capacitor } from '@capacitor/core';
import type { PlaceCandidate, PlaceSearchRequest, ProviderAttribution } from '../../domain/types';
import { NativePlaceSearchService } from './native-place-search';
import { PlaceSearchUnavailableError, type PlaceSearchService } from './place-search';

interface GoogleLatLngLike {
  lat: number | (() => number);
  lng: number | (() => number);
}

interface GoogleAttributionLike {
  provider?: string;
  providerURI?: string;
}

interface GooglePlaceLike {
  id?: string;
  displayName?: string;
  formattedAddress?: string;
  location?: GoogleLatLngLike;
  rating?: number;
  userRatingCount?: number;
  googleMapsURI?: string;
  primaryTypeDisplayName?: string;
  types?: string[];
  attributions?: GoogleAttributionLike[];
}

interface GooglePlacesLibrary {
  Place: {
    searchByText(request: Record<string, unknown>): Promise<{ places?: GooglePlaceLike[] }>;
  };
}

interface GoogleMapsNamespace {
  importLibrary(name: string): Promise<unknown>;
}

interface GoogleWindow extends Window {
  google?: { maps?: GoogleMapsNamespace };
  gm_authFailure?: () => void;
}

let loaderPromise: Promise<GooglePlacesLibrary> | null = null;
let loaderApiKey: string | null = null;

function coordinate(value: number | (() => number) | undefined): number | undefined {
  if (typeof value === 'function') return Number(value());
  if (typeof value === 'number') return value;
  return undefined;
}

function normalizeAttributions(items: GoogleAttributionLike[] | undefined): ProviderAttribution[] {
  return (items ?? [])
    .filter((item): item is GoogleAttributionLike & { provider: string } => Boolean(item.provider))
    .map((item) => ({ provider: item.provider, uri: item.providerURI }));
}

async function importPlacesLibrary(host: GoogleWindow): Promise<GooglePlacesLibrary> {
  if (!host.google?.maps?.importLibrary) {
    throw new PlaceSearchUnavailableError('Google Maps JavaScript API is unavailable.');
  }
  const library = await host.google.maps.importLibrary('places') as Partial<GooglePlacesLibrary>;
  if (!library.Place?.searchByText) {
    throw new PlaceSearchUnavailableError('Google Places library is unavailable.');
  }
  return library as GooglePlacesLibrary;
}

function loadGooglePlaces(apiKey: string): Promise<GooglePlacesLibrary> {
  if (loaderPromise) {
    if (loaderApiKey !== apiKey) throw new Error('Google Maps loader was already initialized with another API key.');
    return loaderPromise;
  }

  loaderApiKey = apiKey;
  loaderPromise = new Promise<GooglePlacesLibrary>((resolve, reject) => {
    const host = window as GoogleWindow;
    if (host.google?.maps?.importLibrary) {
      void importPlacesLibrary(host).then(resolve, reject);
      return;
    }

    const callbackName = '__randomSeoulGoogleMapsReady';
    const callbackHost = window as unknown as Record<string, unknown>;
    const previousAuthFailure = host.gm_authFailure;
    let settled = false;

    const cleanup = () => {
      delete callbackHost[callbackName];
      host.gm_authFailure = previousAuthFailure;
    };
    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error instanceof Error ? error : new Error(String(error)));
    };

    callbackHost[callbackName] = () => {
      if (settled) return;
      void importPlacesLibrary(host).then((library) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(library);
      }, fail);
    };

    host.gm_authFailure = () => {
      previousAuthFailure?.();
      fail(new PlaceSearchUnavailableError('Google Maps authentication failed.'));
    };

    const script = document.createElement('script');
    const params = new URLSearchParams({
      key: apiKey,
      loading: 'async',
      v: 'weekly',
      libraries: 'places',
      language: 'ko',
      region: 'KR',
      callback: callbackName,
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onerror = () => fail(new PlaceSearchUnavailableError('Google Maps JavaScript API failed to load.'));
    document.head.appendChild(script);
  });

  return loaderPromise;
}

/**
 * Web implementation of PlaceSearchService.
 *
 * During the Android-first migration the common composition root still constructs this
 * class. On a Capacitor native runtime it delegates immediately to the thin native
 * Places bridge, so no Web API key or Maps JavaScript SDK is used by the app. The
 * composition root will be renamed to a generic factory in a later cleanup slice.
 */
export class GoogleWebPlaceSearchService implements PlaceSearchService {
  private readonly nativeService = Capacitor.isNativePlatform()
    ? new NativePlaceSearchService()
    : undefined;

  constructor(private readonly apiKey: string) {
    if (!this.nativeService && !apiKey) throw new Error('Google Maps API key is required.');
  }

  async searchText(request: PlaceSearchRequest): Promise<PlaceCandidate[]> {
    if (this.nativeService) return this.nativeService.searchText(request);

    const library = await loadGooglePlaces(this.apiKey);
    const googleRequest: Record<string, unknown> = {
      textQuery: request.textQuery,
      fields: [
        'id', 'displayName', 'formattedAddress', 'location', 'rating', 'userRatingCount',
        'googleMapsURI', 'primaryTypeDisplayName', 'types', 'attributions',
      ],
      maxResultCount: request.maxResults ?? 20,
      language: request.language ?? 'ko',
      region: request.region ?? 'kr',
      rankPreference: 'RELEVANCE',
    };

    if (request.center && request.radiusMeters) {
      googleRequest.locationBias = {
        center: { lat: request.center.latitude, lng: request.center.longitude },
        radius: request.radiusMeters,
      };
    }

    const result = await library.Place.searchByText(googleRequest);
    const places = Array.isArray(result.places) ? result.places : [];

    return places.flatMap((place, searchRank) => {
      const latitude = coordinate(place.location?.lat);
      const longitude = coordinate(place.location?.lng);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];

      return [{
        id: place.id ?? `${place.displayName ?? 'place'}:${latitude}:${longitude}`,
        name: place.displayName ?? '',
        category: place.primaryTypeDisplayName ?? '',
        latitude: latitude as number,
        longitude: longitude as number,
        address: place.formattedAddress,
        types: place.types ?? [],
        rating: place.rating,
        userRatingCount: place.userRatingCount,
        mapUrl: place.googleMapsURI,
        attributions: normalizeAttributions(place.attributions),
        searchRank,
      } satisfies PlaceCandidate];
    });
  }
}
