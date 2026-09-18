import { describe, expect, it } from 'vitest';
import { groupVisitsByPhysicalStation } from '../src/domain/visit-footprint';
import type { VisitRecord } from '../src/domain/types';

function visit(
  id: string,
  lineId: string,
  stationName: string,
  visitedAt: string,
  createdAt: number,
): VisitRecord {
  return {
    id,
    lineId,
    stationName,
    stationOrdinal: 1,
    shownAttractions: [],
    attractions: [],
    visitedAt,
    createdAt,
  };
}

describe('visit footprint grouping', () => {
  it('collapses line variants of the same physical interchange into one station pin', () => {
    const groups = groupVisitsByPhysicalStation([
      visit('a', 'l2', '왕십리', '2026-09-10', 10),
      visit('b', 'l5', '왕십리', '2026-09-12', 20),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.stationName).toBe('왕십리');
    expect(groups[0]?.visits.map((item) => item.id)).toEqual(['b', 'a']);
  });

  it('keeps same-name stations that are not physical interchanges as separate pins', () => {
    const groups = groupVisitsByPhysicalStation([
      visit('a', 'l2', '신촌', '2026-09-10', 10),
      visit('b', 'gc', '신촌', '2026-09-12', 20),
    ]);

    expect(groups).toHaveLength(2);
  });

  it('collapses the differently named Isu interchange and uses the concise station label', () => {
    const groups = groupVisitsByPhysicalStation([
      visit('a', 'l4', '총신대입구(이수)', '2026-09-10', 10),
      visit('b', 'l7', '이수', '2026-09-12', 20),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.stationName).toBe('이수');
    expect(groups[0]?.visits).toHaveLength(2);
  });
});
