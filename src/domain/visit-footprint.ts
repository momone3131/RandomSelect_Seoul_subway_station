import {
  getEquivalentStationReferences,
  getPhysicalStationDisplayName,
  getPhysicalStationKey,
  type StationReference,
} from '../data/station-equivalence';
import type { VisitRecord } from './types';

export interface VisitFootprintStation {
  id: string;
  stationName: string;
  references: readonly StationReference[];
  visits: VisitRecord[];
  latestVisitedAt?: string;
  latestCreatedAt: number;
}

function compareVisits(left: VisitRecord, right: VisitRecord): number {
  if (left.visitedAt && right.visitedAt && left.visitedAt !== right.visitedAt) {
    return right.visitedAt.localeCompare(left.visitedAt);
  }
  if (left.visitedAt && !right.visitedAt) return -1;
  if (!left.visitedAt && right.visitedAt) return 1;
  return right.createdAt - left.createdAt;
}

export function groupVisitsByPhysicalStation(
  visits: readonly VisitRecord[],
): VisitFootprintStation[] {
  const grouped = new Map<string, VisitFootprintStation>();

  for (const visit of visits) {
    const id = getPhysicalStationKey(visit.lineId, visit.stationName);
    let group = grouped.get(id);
    if (!group) {
      group = {
        id,
        stationName: getPhysicalStationDisplayName(visit.lineId, visit.stationName),
        references: getEquivalentStationReferences(visit.lineId, visit.stationName).map((item) => ({ ...item })),
        visits: [],
        latestCreatedAt: 0,
      };
      grouped.set(id, group);
    }
    group.visits.push(visit);
    group.latestCreatedAt = Math.max(group.latestCreatedAt, visit.createdAt);
    if (visit.visitedAt && (!group.latestVisitedAt || visit.visitedAt > group.latestVisitedAt)) {
      group.latestVisitedAt = visit.visitedAt;
    }
  }

  return Array.from(grouped.values())
    .map((group) => ({ ...group, visits: group.visits.slice().sort(compareVisits) }))
    .sort((left, right) => {
      if (left.latestVisitedAt && right.latestVisitedAt && left.latestVisitedAt !== right.latestVisitedAt) {
        return right.latestVisitedAt.localeCompare(left.latestVisitedAt);
      }
      if (left.latestVisitedAt && !right.latestVisitedAt) return -1;
      if (!left.latestVisitedAt && right.latestVisitedAt) return 1;
      return right.latestCreatedAt - left.latestCreatedAt;
    });
}
