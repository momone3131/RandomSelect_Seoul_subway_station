import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stableHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

describe('stable responsive visual contract used by the migration bridge', () => {
  it('stacks restaurant cards vertically on phone-sized screens', () => {
    expect(stableHtml).toContain('@media(max-width:720px){.restaurant-grid,.restaurant-loading{grid-template-columns:1fr!important}');
  });

  it('keeps touch-sized restaurant map buttons on mobile', () => {
    expect(stableHtml).toContain('.restaurant-map-link{width:100%;min-height:44px}');
  });

  it('contains the 390px-friendly restaurant card override', () => {
    expect(stableHtml).toContain('@media(max-width:430px)');
    expect(stableHtml).toContain('.restaurant-card{padding:12px}');
  });
});
