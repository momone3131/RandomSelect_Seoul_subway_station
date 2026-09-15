import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const styles = [
  readFileSync(new URL('../src/ui/styles.css', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/ui/mobile-overrides.css', import.meta.url), 'utf8'),
].join('\n');
const primaryDrawPlacement = readFileSync(
  new URL('../src/ui/primary-draw-placement.ts', import.meta.url),
  'utf8',
);

describe('Random Seoul responsive visual contract', () => {
  it('stacks restaurant cards vertically on phone-sized screens', () => {
    expect(styles).toContain('grid-template-columns: 1fr !important');
  });

  it('keeps touch-sized restaurant map buttons on mobile', () => {
    expect(styles).toContain('min-height: 44px');
    expect(styles).toContain('width: 100%');
  });

  it('contains the narrow-phone restaurant card override', () => {
    expect(styles).toContain('@media(max-width:430px)');
    expect(styles).toContain('.restaurant-card{padding:12px}');
  });

  it('uses the whole next-result card as the primary draw target', () => {
    expect(styles).toContain('.panel.next-draw > .draw-btn.integrated');
    expect(styles).toContain('inset: 0');
    expect(styles).toContain('height: 100%');
    expect(styles).toContain('opacity: 0');
    expect(primaryDrawPlacement).toContain("panel.classList.add('next-draw')");
    expect(primaryDrawPlacement).toContain('panel.appendChild(drawButton)');
    expect(primaryDrawPlacement).toContain('actionZone.prepend(drawButton)');
  });

  it('hides duplicate draw guidance copy from the main surface', () => {
    expect(styles).toContain('.progress-note,');
    expect(styles).toContain('.helper,');
    expect(styles).toContain('.keyboard-note,');
    expect(styles).toContain('.scope-extra,');
    expect(styles).toContain('.fair-note');
  });
});
