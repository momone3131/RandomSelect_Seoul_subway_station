import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const footprintView = readFileSync(new URL('../src/ui/footprint-map-view.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/ui/mobile-overrides.css', import.meta.url), 'utf8');

describe('visit footprint full-network map contract', () => {
  it('uses one bundled full-network subway reference with mapped anchors', () => {
    expect(footprintView).toContain('footprint-seoul-subway-reference.svg');
    expect(footprintView).toContain('getFootprintMapAnchor');
    expect(footprintView).toContain('FOOTPRINT_MAP_VIEWBOX');
    expect(footprintView).not.toContain('SUBWAY_LINES');
    expect(footprintView).not.toContain('tile.openstreetmap.org');
    expect(footprintView).not.toContain('StationLocationService');
  });

  it('keeps visited markers in place when selection changes', () => {
    expect(footprintView).toContain('this.updateMarkerSelection();');
    expect(footprintView).toContain('this.renderDetails();');
    expect(footprintView).not.toContain('this.renderMarkers();\n        this.renderDetails();');
  });

  it('supports pan, pinch/wheel zoom and an explicit fit-all control', () => {
    expect(footprintView).toContain("addEventListener('pointermove'");
    expect(footprintView).toContain("addEventListener('wheel'");
    expect(footprintView).toContain("'footprint_fit_all'");
    expect(styles).toContain('.footprint-reference-stage');
    expect(styles).toContain('.footprint-visit-marker.selected');
    expect(styles).toContain('touch-action:none');
  });
});
