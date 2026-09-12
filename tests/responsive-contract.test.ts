import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const styles = readFileSync(new URL('../src/ui/styles.css', import.meta.url), 'utf8');

describe('Random Seoul responsive visual contract', () => {
  it('stacks restaurant cards vertically on phone-sized screens', () => {
    expect(styles).toContain('@media(max-width:720px){.restaurant-grid,.restaurant-loading{grid-template-columns:1fr!important}');
  });

  it('keeps touch-sized restaurant map buttons on mobile', () => {
    expect(styles).toContain('.restaurant-map-link{width:100%;min-height:44px}');
  });

  it('contains the 390px-friendly restaurant card override', () => {
    expect(styles).toContain('@media(max-width:430px)');
    expect(styles).toContain('.restaurant-card{padding:12px}');
  });
});
