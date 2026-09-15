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
const drawView = readFileSync(new URL('../src/ui/draw-view.ts', import.meta.url), 'utf8');

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

  it('makes the active draw card read visually as a raised button', () => {
    expect(styles).toContain('border: 2px solid var(--dark)');
    expect(styles).toContain('background: linear-gradient(145deg, #efffc4 0%, var(--lime) 100%)');
    expect(styles).toContain('box-shadow: 0 7px 0 #a5bd63');
    expect(styles).toContain('.panel.next-draw::after');
    expect(styles).toContain('content: "⚄"');
    expect(styles).toContain('.panel.next-draw .panel-tag');
    expect(styles).toContain('right: 66px');
    expect(styles).toContain('transform: translateY(3px)');
  });

  it('hides nonessential explanatory copy from the main surface', () => {
    expect(styles).toContain('.scope-summary,');
    expect(styles).toContain('.line-meta,');
    expect(styles).toContain('.station-context,');
    expect(styles).toContain('.food-examples,');
    expect(styles).toContain('.hero-eyebrow,');
    expect(styles).toContain('.restaurant-context,');
  });

  it('uses concise stage and action labels', () => {
    expect(drawView).toContain("textContent = '노선'");
    expect(drawView).toContain("textContent = '역'");
    expect(drawView).toContain("textContent = '음식'");
    expect(drawView).toContain("? '뽑는 중…'");
    expect(drawView).not.toContain('수록 ${line.stations.length}개 역');
    expect(drawView).not.toContain('종 중에서 하나를 뽑아요');
    expect(drawView).not.toContain('구간 내 ${station.localIndex}번째');
  });
});
