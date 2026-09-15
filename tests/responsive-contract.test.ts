import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const styles = [
  readFileSync(new URL('../src/ui/styles.css', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/ui/mobile-overrides.css', import.meta.url), 'utf8'),
].join('\n');
const primaryDrawPlacement = readFileSync(new URL('../src/ui/primary-draw-placement.ts', import.meta.url), 'utf8');
const drawAnimation = readFileSync(new URL('../src/ui/draw-animation.ts', import.meta.url), 'utf8');
const drawView = readFileSync(new URL('../src/ui/draw-view.ts', import.meta.url), 'utf8');
const attractionView = readFileSync(new URL('../src/ui/attraction-view.ts', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');

describe('Random Seoul responsive visual contract', () => {
  it('stacks restaurant result cards vertically on phone-sized screens', () => {
    expect(styles).toContain('grid-template-columns:1fr!important');
  });

  it('keeps touch-sized restaurant map buttons on mobile', () => {
    expect(styles).toContain('min-height:44px');
    expect(styles).toContain('width:100%');
  });

  it('keeps dense result cards', () => {
    expect(styles).toContain('min-height:176px');
    expect(styles).toContain('min-height:164px');
    expect(styles).toContain('min-height:96px');
    expect(styles).toContain('min-height:154px');
  });

  it('uses distinct pastel surfaces without ordinary card outlines', () => {
    expect(styles).toContain('.line-panel{background:#dfeecb}');
    expect(styles).toContain('.station-panel{background:#dbeaf1}');
    expect(styles).toContain('.food-panel{background:#f4dfc5}');
    expect(styles).toContain('border:0!important');
  });

  it('uses the whole next-result card as the primary target', () => {
    expect(styles).toContain('.panel.next-draw>.draw-btn.integrated');
    expect(primaryDrawPlacement).toContain("panel.classList.add('next-draw')");
  });

  it('keeps a strong outline only on the active draw card', () => {
    expect(styles).toContain('border:2px solid var(--dark)!important');
    expect(styles).toContain('content:"⚄"');
  });

  it('uses a long unmistakable result reveal', () => {
    expect(drawAnimation).toContain("translateY(-12px) scale(1.09)");
    expect(drawAnimation).toContain('0 0 0 10px #f2cf78');
    expect(drawAnimation).toContain('duration:900');
  });

  it('places compact attractions immediately after the draw panels', () => {
    expect(attractionView).toContain("panels.insertAdjacentElement('afterend', section)");
    expect(attractionView).toContain("'추천 명소'");
    expect(styles).toContain('#attraction_section .attraction-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}');
    expect(styles).toContain('#attraction_section .restaurant-meta{display:none}');
  });

  it('defers restaurant lookup until the user asks for it', () => {
    expect(main).toContain("button.textContent = '추천 식당 보기'");
    expect(main).toContain("restaurantRequest.button.addEventListener('click'");
    expect(main).toContain('await controller.loadRecommendations()');
    expect(main).toContain("document.body.dataset.selftestDeferredRestaurants = 'true'");
    expect(main).not.toContain("performDraw(() => controller.drawNext(), stage === 'food'");
  });

  it('scrolls to restaurant results only after requested results settle', () => {
    const loadIndex = main.indexOf('await controller.loadRecommendations()');
    const scrollIndex = main.indexOf("scrollIntoView({");
    expect(loadIndex).toBeGreaterThan(-1);
    expect(scrollIndex).toBeGreaterThan(loadIndex);
    expect(main).toContain("behavior: selfTestMode ? 'auto' : 'smooth'");
  });

  it('keeps restaurant metadata clear of the map action', () => {
    expect(styles).toContain('margin-bottom:12px');
    expect(styles).toContain('.restaurant-map-link{min-height:42px;margin-top:2px');
  });

  it('uses a dedicated touch-sized restaurant discovery CTA', () => {
    expect(styles).toContain('.restaurant-request-btn{width:100%;min-height:48px');
    expect(styles).toContain('.restaurant-request{padding:0 14px 12px}');
  });

  it('uses concise stage labels', () => {
    expect(drawView).toContain("textContent = '노선'");
    expect(drawView).toContain("textContent = '역'");
    expect(drawView).toContain("textContent = '음식'");
  });
});
