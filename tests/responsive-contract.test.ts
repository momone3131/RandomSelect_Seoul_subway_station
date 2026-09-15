import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const styles = [
  readFileSync(new URL('../src/ui/styles.css', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/ui/mobile-overrides.css', import.meta.url), 'utf8'),
].join('\n');
const primaryDrawPlacement = readFileSync(new URL('../src/ui/primary-draw-placement.ts', import.meta.url), 'utf8');
const drawAnimation = readFileSync(new URL('../src/ui/draw-animation.ts', import.meta.url), 'utf8');
const drawView = readFileSync(new URL('../src/ui/draw-view.ts', import.meta.url), 'utf8');

describe('Random Seoul responsive visual contract', () => {
  it('stacks restaurant cards vertically on phone-sized screens', () => {
    expect(styles).toContain('grid-template-columns: 1fr !important');
  });

  it('keeps touch-sized restaurant map buttons on mobile', () => {
    expect(styles).toContain('min-height: 44px');
    expect(styles).toContain('width: 100%');
  });

  it('uses denser result cards after explanatory copy removal', () => {
    expect(styles).toContain('min-height: 176px');
    expect(styles).toContain('min-height: 164px');
    expect(styles).toContain('min-height: 96px');
    expect(styles).toContain('min-height: 154px');
  });

  it('raises small UI typography while preserving compact layout', () => {
    expect(styles).toContain('font-size: 13px');
    expect(styles).toContain('.panel-tag');
    expect(styles).toContain('font-size: 12px');
    expect(styles).toContain('.restaurant-name');
    expect(styles).toContain('font-size: 16px');
  });

  it('removes redundant container and card borders', () => {
    expect(styles).toContain('.draw-shell { border: 0;');
    expect(styles).toContain('border: 0 !important;');
    expect(styles).toContain('.restaurant-section { margin-top: 16px; padding: 16px; border: 0;');
    expect(styles).toContain('.restaurant-card,.restaurant-skeleton { min-height: 150px; padding: 13px; border: 0;');
    expect(styles).toContain('.station-item { min-height: 36px; padding: 7px 8px; border: 0;');
    expect(styles).toContain('.history-item { padding: 11px 12px; border: 0;');
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

  it('reserves the strong outline for the active draw card', () => {
    expect(styles).toContain('border: 2px solid var(--dark) !important');
    expect(styles).toContain('background: var(--lime)');
    expect(styles).toContain('box-shadow: 0 4px 0 #98aa5f');
    expect(styles).toContain('.panel.next-draw::after');
    expect(styles).toContain('content: "⚄"');
  });

  it('adds tactile hold feedback to the integrated draw card', () => {
    expect(primaryDrawPlacement).toContain("addEventListener('pointerdown'");
    expect(primaryDrawPlacement).toContain("addEventListener('pointerup'");
    expect(primaryDrawPlacement).toContain("translateY(3px) scale(.985)");
    expect(primaryDrawPlacement).toContain('duration: 75');
  });

  it('uses a large unmistakable settled-result reveal', () => {
    expect(drawAnimation).toContain('window.requestAnimationFrame');
    expect(drawAnimation).toContain("translateY(-10px) scale(1.075)");
    expect(drawAnimation).toContain("0 0 0 8px #d7f775");
    expect(drawAnimation).toContain("translateY(3px) scale(.985)");
    expect(drawAnimation).toContain('duration: 520');
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
