import { describe, expect, it } from 'vitest';
import {
  FOOTPRINT_MAP_ANCHORS,
  FOOTPRINT_MAP_VIEWBOX,
  getFootprintMapAnchor,
} from '../src/data/footprint-map-anchors';
import { getEquivalentStationReferences } from '../src/data/station-equivalence';
import { SUBWAY_LINES } from '../src/data/subway-lines';

const stationOutcomes = SUBWAY_LINES.flatMap((line) =>
  line.stations.map((station) => ({ lineId: line.id, stationName: station.name })),
);
const uniqueStationOutcomes = Array.from(new Map(
  stationOutcomes.map((station) => [`${station.lineId}:${station.stationName}`, station]),
).values());

describe('full-network footprint reference mapping', () => {
  it('maps every app line/station outcome to a reference anchor', () => {
    expect(uniqueStationOutcomes).toHaveLength(800);
    expect(Object.keys(FOOTPRINT_MAP_ANCHORS)).toHaveLength(800);

    for (const station of uniqueStationOutcomes) {
      expect(
        getFootprintMapAnchor(station.lineId, station.stationName),
        `missing footprint anchor: ${station.lineId}:${station.stationName}`,
      ).toBeDefined();
    }
  });

  it('keeps every anchor inside the reference SVG viewBox', () => {
    for (const [key, anchor] of Object.entries(FOOTPRINT_MAP_ANCHORS)) {
      expect(anchor.x, `${key} x`).toBeGreaterThanOrEqual(0);
      expect(anchor.x, `${key} x`).toBeLessThanOrEqual(FOOTPRINT_MAP_VIEWBOX.width);
      expect(anchor.y, `${key} y`).toBeGreaterThanOrEqual(0);
      expect(anchor.y, `${key} y`).toBeLessThanOrEqual(FOOTPRINT_MAP_VIEWBOX.height);
    }
  });

  it('gives all line variants of a physical interchange the same anchor', () => {
    for (const station of uniqueStationOutcomes) {
      const equivalents = getEquivalentStationReferences(station.lineId, station.stationName);
      if (equivalents.length < 2) continue;

      const anchors = equivalents.map((reference) => {
        const anchor = getFootprintMapAnchor(reference.lineId, reference.stationName);
        expect(anchor, `missing interchange anchor: ${reference.lineId}:${reference.stationName}`).toBeDefined();
        return anchor!;
      });
      const [first] = anchors;
      for (const anchor of anchors.slice(1)) {
        expect(anchor.x).toBeCloseTo(first.x, 4);
        expect(anchor.y).toBeCloseTo(first.y, 4);
      }
    }
  });

  it('keeps same-name non-interchanges on different reference anchors', () => {
    const sinchon2 = getFootprintMapAnchor('l2', '신촌')!;
    const sinchonGc = getFootprintMapAnchor('gc', '신촌')!;
    expect(Math.hypot(sinchon2.x - sinchonGc.x, sinchon2.y - sinchonGc.y)).toBeGreaterThan(20);

    const yangpyeong5 = getFootprintMapAnchor('l5', '양평')!;
    const yangpyeongGc = getFootprintMapAnchor('gc', '양평')!;
    expect(Math.hypot(
      yangpyeong5.x - yangpyeongGc.x,
      yangpyeong5.y - yangpyeongGc.y,
    )).toBeGreaterThan(1000);
  });

  it('uses exactly one documented synthetic exception for the depot temporary platform', () => {
    const synthetic = Object.entries(FOOTPRINT_MAP_ANCHORS)
      .filter(([, anchor]) => anchor.source === 'synthetic-terminal-extension');
    expect(synthetic).toHaveLength(1);
    expect(synthetic[0]?.[0]).toBe('gj:차량기지 임시승강장');

    const topseok = getFootprintMapAnchor('gj', '탑석')!;
    const depot = synthetic[0]![1];
    expect(Math.hypot(depot.x - topseok.x, depot.y - topseok.y)).toBeGreaterThan(20);
    expect(Math.hypot(depot.x - topseok.x, depot.y - topseok.y)).toBeLessThan(100);
  });

  it('keeps consecutive reference anchors geometrically plausible across every segment', () => {
    for (const line of SUBWAY_LINES) {
      for (const segment of line.segments) {
        for (let index = 1; index < segment.stations.length; index += 1) {
          const fromName = segment.stations[index - 1]!;
          const toName = segment.stations[index]!;
          const from = getFootprintMapAnchor(line.id, fromName)!;
          const to = getFootprintMapAnchor(line.id, toName)!;
          const gap = Math.hypot(to.x - from.x, to.y - from.y);

          expect(gap, `${line.id}: ${fromName} → ${toName} too close`).toBeGreaterThan(5);
          expect(gap, `${line.id}: ${fromName} → ${toName} too far`).toBeLessThan(1000);
        }
      }
    }
  });
});
