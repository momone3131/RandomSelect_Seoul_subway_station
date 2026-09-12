import type { PlaceCandidate, SubwayLine } from './types';
import type { PlaceSearchService } from '../services/places/place-search';
import { LINE_SEARCH_TOKENS } from '../data/search-vocabulary';

const STATION_TYPES = new Set(['subway_station', 'train_station', 'transit_station', 'light_rail_station']);

export function cleanStationBase(name: string): string {
  return name
    .replace(/\([^)]*\)/g, '')
    .replace(/역$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function scoreStationCandidate(
  candidate: PlaceCandidate,
  stationBase: string,
  lineTokens: readonly string[],
): number {
  const packed = `${candidate.name} ${candidate.address ?? ''}`.replace(/\s+/g, '').toLowerCase();
  const base = `${stationBase}역`.replace(/\s+/g, '').toLowerCase();
  let score = Math.max(0, 40 - candidate.searchRank * 4);

  if (packed.includes(base)) score += 90;
  if ((candidate.types ?? []).some((type) => STATION_TYPES.has(type))) score += 100;

  for (const token of lineTokens) {
    const compact = token.replace(/\s+/g, '').toLowerCase();
    if (compact && packed.includes(compact)) score += 25;
  }
  return score;
}

export async function resolveStationPlace(
  service: PlaceSearchService,
  line: SubwayLine,
  stationName: string,
): Promise<PlaceCandidate> {
  const stationBase = cleanStationBase(stationName);
  const lineTokens = LINE_SEARCH_TOKENS[line.id] ?? [line.name];
  const query = `${stationBase}역 ${lineTokens[0] ?? line.name}`;
  const candidates = await service.searchText({
    textQuery: query,
    maxResults: 5,
    language: 'ko',
    region: 'kr',
  });

  const ranked = candidates
    .map((candidate) => ({ candidate, score: scoreStationCandidate(candidate, stationBase, lineTokens) }))
    .sort((a, b) => b.score - a.score);

  if (!ranked.length) throw new Error(`Station location not found: ${line.name} ${stationName}`);
  return ranked[0]!.candidate;
}
