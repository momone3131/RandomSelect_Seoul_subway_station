import { SUBWAY_LINES } from '../data/subway-lines';
import { getPhysicalStationKey } from '../data/station-equivalence';
import type { VisitRecord } from './types';

export interface LineVisitStatistics {
  lineId: string;
  name: string;
  color: string;
  visitedStations: number;
  totalStations: number;
  percentage: number;
}

export interface VisitStatistics {
  totalVisits: number;
  visitedStations: number;
  totalStations: number;
  percentage: number;
  latestVisitedAt?: string;
  undatedVisits: number;
  foodCategories: number;
  foodVisits: number;
  attractions: number;
  attractionVisits: number;
  lines: LineVisitStatistics[];
}

// Use the same physical identity as the footprint map, not the 800 draw outcomes.
// A station on a branch/loop is counted once within a line as well.
const lineStations = SUBWAY_LINES.map((line) => ({
  line,
  keys: new Set(line.stations.map((station) => getPhysicalStationKey(line.id, station.name))),
}));
const allStationKeys = new Set(lineStations.flatMap(({ keys }) => [...keys]));
const knownReferences = new Set(SUBWAY_LINES.flatMap((line) =>
  line.stations.map((station) => `${line.id}:${station.name}`),
));

function percentage(visited: number, total: number): number {
  return total ? (visited / total) * 100 : 0;
}

/** Derive statistics from durable, user-confirmed visits. Never write to storage. */
export function buildVisitStatistics(visits: readonly VisitRecord[]): VisitStatistics {
  const stationKeys = new Set<string>();
  const foodIds = new Set<string>();
  const attractionIds = new Set<string>();
  let latestVisitedAt: string | undefined;
  let undatedVisits = 0;
  let foodVisits = 0;
  let attractionVisits = 0;

  for (const visit of visits) {
    // Keep legacy/removed records in totalVisits without inflating current coverage.
    if (knownReferences.has(`${visit.lineId}:${visit.stationName}`)) {
      stationKeys.add(getPhysicalStationKey(visit.lineId, visit.stationName));
    }
    if (visit.visitedAt) {
      if (!latestVisitedAt || visit.visitedAt > latestVisitedAt) latestVisitedAt = visit.visitedAt;
    } else {
      undatedVisits += 1;
    }
    // Candidates are deliberately ignored: only explicit confirmations count.
    if (visit.foodId) {
      foodIds.add(visit.foodId);
      foodVisits += 1;
    }
    const confirmedAttractions = new Set(visit.attractions.map((attraction) => attraction.id));
    attractionVisits += confirmedAttractions.size;
    for (const id of confirmedAttractions) attractionIds.add(id);
  }

  const lines = lineStations.map(({ line, keys }): LineVisitStatistics => {
    const visitedStations = [...keys].filter((key) => stationKeys.has(key)).length;
    return {
      lineId: line.id,
      name: line.name,
      color: line.color,
      visitedStations,
      totalStations: keys.size,
      percentage: percentage(visitedStations, keys.size),
    };
  });

  return {
    totalVisits: visits.length,
    visitedStations: stationKeys.size,
    totalStations: allStationKeys.size,
    percentage: percentage(stationKeys.size, allStationKeys.size),
    latestVisitedAt,
    undatedVisits,
    foodCategories: foodIds.size,
    foodVisits,
    attractions: attractionIds.size,
    attractionVisits,
    lines,
  };
}
