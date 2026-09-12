import type { PlaceCandidate, PlaceSearchRequest } from '../../domain/types';

export interface PlaceSearchService {
  searchText(request: PlaceSearchRequest): Promise<PlaceCandidate[]>;
}

export class PlaceSearchUnavailableError extends Error {
  constructor(message = 'Place search service is unavailable.') {
    super(message);
    this.name = 'PlaceSearchUnavailableError';
  }
}
