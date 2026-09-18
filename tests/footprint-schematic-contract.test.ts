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

  it('renders visited markers in screen space so fit-all markers remain visible', () => {
    expect(footprintView).toContain("viewport.appendChild(markerLayer)");
    expect(footprintView).toContain("marker.dataset.anchorX");
    expect(footprintView).toContain("this.panX + anchorX * this.scale");
    expect(styles).toContain('.footprint-marker-layer{position:absolute');
    expect(styles).toContain('.footprint-visit-marker{position:absolute');
    expect(styles).not.toContain('--marker-inverse-scale');
  });

  it('keeps visited markers in place when selection changes', () => {
    expect(footprintView).toContain('this.updateMarkerSelection();');
    expect(footprintView).toContain('this.renderDetails();');
    expect(footprintView).not.toContain('this.renderMarkers();\n        this.renderDetails();');
  });

  it('keeps a horizontally scrollable compact visit strip and opens detail only after selection', () => {
    expect(footprintView).toContain("'footprint_visit_strip'");
    expect(footprintView).toContain('renderVisitStrip()');
    expect(footprintView).toContain('detail.hidden = true');
    expect(footprintView).toContain('detail.hidden = false');
    expect(styles).toContain('.footprint-visit-strip{display:flex');
    expect(styles).toContain('overflow-x:auto');
    expect(styles).toContain('touch-action:pan-x');
  });

  it('supports edit/delete actions inside selected footprint detail', () => {
    expect(footprintView).toContain("make('button', 'history-visit-btn', '수정')");
    expect(footprintView).toContain("make('button', 'history-visit-btn danger', '삭제')");
    expect(footprintView).toContain('this.callbacks?.onEdit(visit)');
    expect(footprintView).toContain('this.callbacks?.onDelete(visit)');
    expect(styles).toContain('.footprint-visit-actions .history-visit-btn{flex:1 1 0;width:auto;min-width:0');
  });

  it('compacts the selected detail without pushing the close button off-screen', () => {
    expect(footprintView).toContain("dialog.classList.toggle('detail-open', open)");
    expect(footprintView).toContain("make('div', 'footprint-detail-title')");
    expect(footprintView).toContain("title.appendChild(chip)");
    expect(footprintView).toContain("title.appendChild(make('h3'");
    expect(styles).toContain('.footprint-modal{width:min(980px,100%);max-height:min(95dvh,960px);display:flex;flex-direction:column;overflow:hidden}');
    expect(styles).toContain('.footprint-body{flex:1 1 auto;min-height:0;overflow-y:auto');
    expect(styles).toContain('.footprint-modal.detail-open .footprint-map-viewport');
    expect(styles).toContain('.footprint-detail-title{display:flex;align-items:center');
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
