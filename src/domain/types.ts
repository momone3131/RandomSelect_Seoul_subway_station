export interface SubwayStation {
  name: string;
  ordinal: number;
  segmentIndex: number;
  localIndex: number;
  segmentLabel: string;
}

export interface SubwaySegment {
  label: string;
  stations: string[];
}

export interface SubwayLine {
  id: string;
  name: string;
  badge: string;
  color: string;
  segments: SubwaySegment[];
  stations: SubwayStation[];
  note?: string;
}

export interface FoodCategory {
  id: string;
  group: string;
  name: string;
  examples: string;
  emoji: string;
  searchQuery?: string;
}

export interface PlaceCandidate {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  rating?: number;
  userRatingCount?: number;
  mapUrl?: string;
  searchRank: number;
}

export interface PlaceSearchRequest {
  textQuery: string;
  center?: {
    latitude: number;
    longitude: number;
  };
  radiusMeters?: number;
  maxResults?: number;
  language?: string;
  region?: string;
}

export interface RestaurantRecommendation extends PlaceCandidate {
  distanceMeters: number;
  bayesianRating: number;
  score: number;
}

export interface DrawHistoryItem {
  id: string;
  lineId: string;
  stationName: string;
  stationOrdinal: number;
  foodId?: string;
}
