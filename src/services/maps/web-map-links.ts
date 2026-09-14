export function googleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function googleMapsAttractionUrl(name: string, mapQuery?: string): string {
  const query = (mapQuery ?? name).trim();
  return googleMapsSearchUrl(query || name);
}

export function naverMapSearchUrl(query: string): string {
  return `https://map.naver.com/p/search/${encodeURIComponent(query)}`;
}
