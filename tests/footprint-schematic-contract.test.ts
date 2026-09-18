import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const footprintView = readFileSync(new URL('../src/ui/footprint-map-view.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/ui/mobile-overrides.css', import.meta.url), 'utf8');

describe('visit footprint schematic contract', () => {
  it('uses subway topology instead of a geographic tile map', () => {
    expect(footprintView).toContain('SUBWAY_LINES');
    expect(footprintView).toContain('footprint-line-track');
    expect(footprintView).not.toContain('tile.openstreetmap.org');
    expect(footprintView).not.toContain('StationLocationService');
  });

  it('keeps visited station nodes in place when selection changes', () => {
    expect(footprintView).toContain('this.updateNodeSelection();');
    expect(footprintView).toContain('this.renderDetails();');
    expect(footprintView).not.toContain('this.renderMap();');
  });

  it('visually distinguishes unvisited and visited station nodes', () => {
    expect(styles).toContain('.footprint-station-node.visited');
    expect(styles).toContain('.footprint-station-node.visited.selected');
    expect(styles).toContain('.footprint-line-track::before');
  });
});
