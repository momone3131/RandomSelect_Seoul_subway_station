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

  it('keeps a horizontally scrollable compact visit strip with a concise idle detail hint', () => {
    expect(footprintView).toContain("'footprint_visit_strip'");
    expect(footprintView).toContain('renderVisitStrip()');
    expect(footprintView).toContain("'역을 누르면 상세·수정'");
    expect(footprintView).not.toContain('detail.hidden = true');
    expect(footprintView).not.toContain('detail.hidden = false');
    expect(styles).toContain('.footprint-visit-strip{display:flex');
    expect(styles).toContain('overflow-x:auto');
    expect(styles).toContain('touch-action:pan-x');
    expect(styles).toContain('.footprint-detail-placeholder{display:grid');
  });

  it('supports edit/delete actions inside selected footprint detail', () => {
    expect(footprintView).toContain("make('button', 'history-visit-btn', '수정')");
    expect(footprintView).toContain("make('button', 'history-visit-btn danger', '삭제')");
    expect(footprintView).toContain('this.callbacks?.onEdit(visit)');
    expect(footprintView).toContain('this.callbacks?.onDelete(visit)');
    expect(styles).toContain('.footprint-visit-actions .history-visit-btn{flex:1 1 0;width:auto;min-width:0');
  });
  it('reuses attraction prominence and nightscape styling for confirmed visited attractions', () => {
    expect(footprintView).toContain("attractionTierForId");
    expect(footprintView).toContain("isNightscapeAttraction");
    expect(footprintView).toContain("for (const attraction of visit.attractions)");
    expect(footprintView).toContain("footprint-attraction-tier-${tier}");
    expect(footprintView).toContain("footprint-attraction-nightscape");
    expect(footprintView).not.toContain("for (const attraction of visit.shownAttractions)");
    expect(styles).toContain('.footprint-attraction-tier-diamond');
    expect(styles).toContain('.footprint-attraction-tier-gold');
    expect(styles).toContain('.footprint-attraction-tier-silver');
    expect(styles).toContain('.footprint-attraction-nightscape');
  });


  it('keeps the whole panel and map size stable before and after station selection', () => {
    expect(footprintView).not.toContain('detail-open');
    expect(footprintView).not.toContain('footprint_map_status');
    expect(footprintView).not.toContain('밝은 원이 방문한 역이에요');
    expect(footprintView).toContain("make('div', 'footprint-detail-title')");
    expect(footprintView).toContain("title.appendChild(chip)");
    expect(footprintView).toContain("title.appendChild(make('h3'");
    expect(styles).toContain('.footprint-modal{width:min(980px,100%);height:auto;max-height:min(calc(100dvh - 84px),820px)');
    expect(styles).toContain('.footprint-body{display:flex;flex:0 1 auto;min-height:0;flex-direction:column;overflow:hidden');
    expect(styles).toContain('.footprint-map-viewport{position:relative;height:clamp(280px,46dvh,430px)');
    expect(styles).not.toContain('.footprint-modal.detail-open .footprint-map-viewport');
    expect(styles).toContain('.footprint-detail{display:block;flex:0 0 148px;height:148px;min-height:148px;max-height:148px');
    expect(styles).toContain('.footprint-detail-title{display:flex;align-items:center');
  });

  it('does not let the detail area consume leftover mobile height', () => {
    expect(styles).toContain('#footprint_overlay{padding-top:calc(22px + env(safe-area-inset-top));padding-bottom:calc(14px + env(safe-area-inset-bottom))}');
    expect(styles).toContain('.footprint-modal{height:auto;max-height:calc(100dvh - 88px);transform:translateY(7px)');
    expect(styles).toContain('.footprint-detail{flex-basis:142px;height:142px;min-height:142px;max-height:142px');
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
