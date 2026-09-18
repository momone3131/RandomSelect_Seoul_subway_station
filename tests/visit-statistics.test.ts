import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { SUBWAY_LINES } from '../src/data/subway-lines';
import { getPhysicalStationKey } from '../src/data/station-equivalence';
import { buildVisitStatistics } from '../src/domain/visit-statistics';
import type { VisitRecord } from '../src/domain/types';

function visit(overrides: Partial<VisitRecord> = {}): VisitRecord {
  const line = SUBWAY_LINES.find((item) => item.id === 'l4')!;
  const station = line.stations.find((item) => item.name === '총신대입구(이수)')!;
  return {
    id: 'one', lineId: line.id, stationName: station.name, stationOrdinal: station.ordinal,
    shownAttractions: [], attractions: [], createdAt: 1, ...overrides,
  };
}

describe('durable visit statistics', () => {
  it('starts at zero and derives a physical-station denominator from the full catalog', () => {
    const stats = buildVisitStatistics([]);
    const keys = new Set(SUBWAY_LINES.flatMap((line) =>
      line.stations.map((station) => getPhysicalStationKey(line.id, station.name)),
    ));
    expect(stats.totalStations).toBe(keys.size);
    expect(stats.totalStations).toBeLessThan(SUBWAY_LINES.reduce((sum, line) => sum + line.stations.length, 0));
    expect(stats).toMatchObject({ totalVisits: 0, visitedStations: 0, percentage: 0, foodCategories: 0, attractions: 0 });
    expect(stats.latestVisitedAt).toBeUndefined();
    expect(stats.lines).toHaveLength(SUBWAY_LINES.length);
    expect(stats.lines.every((line) => line.visitedStations === 0 && line.percentage === 0)).toBe(true);
  });

  it('collapses revisits and differently named interchange aliases but preserves record count', () => {
    const stats = buildVisitStatistics([
      visit(), visit({ id: 'two' }), visit({ id: 'three', lineId: 'l7', stationName: '이수' }),
    ]);
    expect(stats.totalVisits).toBe(3);
    expect(stats.visitedStations).toBe(1);
    expect(stats.lines.find((line) => line.lineId === 'l4')?.visitedStations).toBe(1);
    expect(stats.lines.find((line) => line.lineId === 'l7')?.visitedStations).toBe(1);
  });

  it('credits a visited physical interchange to each member line without claiming a ride', () => {
    const stats = buildVisitStatistics([visit()]);
    expect(stats.lines.find((line) => line.lineId === 'l7')?.visitedStations).toBe(1);
  });

  it('credits a Sindorim visit to both Line 1 and Line 2 progress', () => {
    const station = SUBWAY_LINES.find((line) => line.id === 'l1')!.stations.find((item) => item.name === '신도림')!;
    const stats = buildVisitStatistics([visit({
      lineId: 'l1', stationName: '신도림', stationOrdinal: station.ordinal,
    })]);
    expect(stats.visitedStations).toBe(1);
    expect(stats.lines.find((line) => line.lineId === 'l1')?.visitedStations).toBe(1);
    expect(stats.lines.find((line) => line.lineId === 'l2')?.visitedStations).toBe(1);
  });

  it.each(['신촌', '양평'])('keeps non-interchange stations named %s separate', (name) => {
    const records = SUBWAY_LINES.filter((line) => line.stations.some((station) => station.name === name))
      .map((line) => visit({ id: line.id, lineId: line.id, stationName: name }));
    expect(records).toHaveLength(2);
    expect(buildVisitStatistics(records).visitedStations).toBe(2);
  });

  it('counts only confirmed food and attractions, deduping identities and not visit occasions', () => {
    const option = { id: 'attraction-a', name: '명소 A' };
    const stats = buildVisitStatistics([
      visit({ drawnFoodId: 'food-only-candidate', shownAttractions: [option] }),
      visit({ id: 'two', foodId: 'food-confirmed', attractions: [option, option] }),
      visit({ id: 'three', foodId: 'food-confirmed', attractions: [option, { id: 'attraction-b', name: '명소 B' }] }),
    ]);
    expect(stats).toMatchObject({ foodCategories: 1, foodVisits: 2, attractions: 2, attractionVisits: 3 });
  });

  it('groups confirmed attractions by current prominence tier and keeps revisit counts', () => {
    const stats = buildVisitStatistics([
      visit({ attractions: [{ id: 'gyeongbokgung-palace', name: '경복궁' }, { id: 'changdeokgung-palace', name: '창덕궁' }] }),
      visit({ id: 'two', attractions: [{ id: 'gyeongbokgung-palace', name: '경복궁' }, { id: 'deoksugung-palace', name: '덕수궁' }] }),
      visit({ id: 'three', attractions: [{ id: 'local-standard-test', name: '로컬 명소' }] }),
    ]);
    expect(stats.attractionTiers).toEqual([
      { tier: 'diamond', attractions: 1, visits: 2 },
      { tier: 'gold', attractions: 1, visits: 1 },
      { tier: 'silver', attractions: 1, visits: 1 },
      { tier: 'standard', attractions: 1, visits: 1 },
    ]);
  });

  it('uses actual entered visit dates, not creation time, and includes undated visits', () => {
    const stats = buildVisitStatistics([
      visit({ visitedAt: '2026-09-18', createdAt: 1 }),
      visit({ id: 'two', visitedAt: '2026-08-01', createdAt: 100 }),
      visit({ id: 'three', createdAt: 9999999999999 }),
    ]);
    expect(stats.latestVisitedAt).toBe('2026-09-18');
    expect(stats.undatedVisits).toBe(1);
    expect(stats.totalVisits).toBe(3);
    expect(buildVisitStatistics([visit()]).latestVisitedAt).toBeUndefined();
  });

  it('recomputes after edits and deletions without changing the source records', () => {
    const records = [visit({ foodId: 'food-a' }), visit({ id: 'two', foodId: 'food-b' })];
    const before = JSON.stringify(records);
    expect(buildVisitStatistics(records).foodCategories).toBe(2);
    expect(buildVisitStatistics([records[0]]).foodCategories).toBe(1);
    expect(buildVisitStatistics([{ ...records[0], foodId: undefined }]).foodCategories).toBe(0);
    expect(JSON.stringify(records)).toBe(before);
  });

  it('does not inflate coverage with removed or unknown station references', () => {
    const stats = buildVisitStatistics([visit({ lineId: 'removed-line' })]);
    expect(stats.totalVisits).toBe(1);
    expect(stats.visitedStations).toBe(0);
    expect(stats.percentage).toBe(0);
  });

  it('reaches exactly 100% for the full catalog including repeated branch/loop entries', () => {
    const visits = SUBWAY_LINES.flatMap((line) => line.stations.map((station) => visit({
      id: `${line.id}:${station.ordinal}`, lineId: line.id, stationName: station.name, stationOrdinal: station.ordinal,
    })));
    const stats = buildVisitStatistics(visits);
    expect(stats.visitedStations).toBe(stats.totalStations);
    expect(stats.percentage).toBe(100);
    expect(stats.lines.every((line) => line.visitedStations === line.totalStations && line.percentage === 100)).toBe(true);
  });

  it('adds an independent main entry and keeps draw/history persistence unchanged', () => {
    const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
    const view = readFileSync(new URL('../src/ui/visit-view.ts', import.meta.url), 'utf8');
    const calculator = readFileSync(new URL('../src/domain/visit-statistics.ts', import.meta.url), 'utf8');
    expect(view).toContain('visit_statistics_btn');
    expect(view).toContain("make('div', 'visit-tools')");
    expect(view).toContain("stationDetail.insertAdjacentElement('afterend', tools)");
    expect(main).toContain('onOpenStatistics: openVisitStatistics');
    expect(main).toContain('visitStatistics.refresh(state.visits)');
    expect(calculator).not.toMatch(/localStorage|saveVisits|Math\.random|selectedLineIds/);
  });
});
