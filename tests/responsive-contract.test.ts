import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const styles=[
  readFileSync(new URL('../src/ui/styles.css',import.meta.url),'utf8'),
  readFileSync(new URL('../src/ui/mobile-overrides.css',import.meta.url),'utf8'),
  readFileSync(new URL('../src/ui/subway-sign-overrides.css',import.meta.url),'utf8'),
  readFileSync(new URL('../src/ui/minimal-palette-overrides.css',import.meta.url),'utf8'),
].join('\n');
const primaryDrawPlacement=readFileSync(new URL('../src/ui/primary-draw-placement.ts',import.meta.url),'utf8');
const drawAnimation=readFileSync(new URL('../src/ui/draw-animation.ts',import.meta.url),'utf8');
const drawView=readFileSync(new URL('../src/ui/draw-view.ts',import.meta.url),'utf8');
const attractionView=readFileSync(new URL('../src/ui/attraction-view.ts',import.meta.url),'utf8');
const main=readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');
describe('Random Seoul responsive visual contract',()=>{
  it('stacks restaurant result cards vertically on phones',()=>expect(styles).toContain('grid-template-columns:1fr!important'));
  it('keeps touch-sized restaurant map buttons',()=>{expect(styles).toContain('min-height:44px');expect(styles).toContain('width:100%')});
  it('keeps dense result cards',()=>{expect(styles).toContain('min-height:176px');expect(styles).toContain('min-height:164px');expect(styles).toContain('min-height:96px');expect(styles).toContain('min-height:154px')});
  it('uses a restrained neutral passive palette and hides the progress strip',()=>{expect(styles).toContain('--bg:#f5f4f0');expect(styles).toContain('--paper:#fffdfa');expect(styles).toContain('--surface:#e9ebe7');expect(styles).toContain('.progress{display:none!important}');expect(styles).toContain('background:var(--surface)');expect(styles).toContain('background:var(--paper)')});
  it('uses whole next-result card as target',()=>{expect(styles).toContain('.panel.next-draw>.draw-btn.integrated');expect(primaryDrawPlacement).toContain("panel.classList.add('next-draw')")});
  it('keeps strong outline only on active card',()=>{expect(styles).toContain('border:2px solid var(--dark)!important');expect(styles).toContain('content:"⚄"')});
  it('uses a long result reveal',()=>{expect(drawAnimation).toContain("translateY(-12px) scale(1.09)");expect(drawAnimation).toContain('duration:900')});
  it('places compact attractions after draw panels',()=>{expect(attractionView).toContain("panels.insertAdjacentElement('afterend', section)");expect(attractionView).toContain("'추천 명소'");expect(styles).toContain('#attraction_section .attraction-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}')});
  it('defers restaurant lookup until requested',()=>{expect(main).toContain("button.textContent = '추천 식당 보기'");expect(main).toContain("restaurantRequest.button.addEventListener('click'");expect(main).toContain('await controller.loadRecommendations()');expect(main).toContain("document.body.dataset.selftestDeferredRestaurants = 'true'")});
  it('smooth-scrolls after restaurant results settle',()=>{expect(main.indexOf("scrollIntoView({")).toBeGreaterThan(main.indexOf('await controller.loadRecommendations()'));expect(main).toContain("behavior: selfTestMode ? 'auto' : 'smooth'")});
  it('uses dedicated restaurant CTA',()=>{expect(styles).toContain('.restaurant-request-btn{width:100%;min-height:48px')});
  it('uses larger, heavier in-card redraw glyphs',()=>{expect(drawView).toContain("placeCardRedrawButton(restart, 'line_panel'");expect(drawView).toContain("'background:transparent'");expect(drawView).toContain("'width:36px'");expect(styles).toContain('.card-redraw-btn svg{width:27px;height:27px}');expect(styles).toContain('.card-redraw-btn svg path{stroke-width:2.7}')});
  it('centers the station sign and matches the line result type scale',()=>{expect(drawView).toContain("panel.style.setProperty('--station-line', line.color)");expect(styles).toContain('align-content:center');expect(styles).toContain('font-size:28px');expect(styles).toContain('font-size:23px;line-height:1.15')});
  it('keeps a centered food prompt visible before and during the food stage',()=>{expect(drawView).toContain("name.textContent = '뭐 먹을까?'");expect(drawView).toContain("name.className = 'food-name food-question'");expect(styles).toContain('.food-panel.waiting .food-question{color:var(--muted);opacity:.48}');expect(styles).toContain('.food-panel.ready .food-question{color:var(--dark);opacity:1}')});
  it('keeps copy and map actions in one row',()=>{expect(drawView).toContain('if (copy.parentElement !== mapActions) mapActions.prepend(copy)');expect(styles).toContain('grid-template-columns:repeat(3,minmax(0,1fr))')});
  it('uses stage-aware hero prompts',()=>{expect(drawView).toContain("'어디로 가볼까?'");expect(drawView).toContain("'어느 역에서 내릴까?'");expect(drawView).toContain("'식사도 해야지?'");expect(drawView).toContain("'이 코스로 가자!'")});
  it('copies a conversational invitation without line or restaurant detail',()=>{expect(main).toContain('`${state.currentStation.name}에서 ${state.currentFood.name} 먹자!`');expect(main).toContain('`${state.currentStation.name} 가자!`');expect(main).not.toContain('목록의 ${state.currentStation.ordinal}번째 역')});
  it('uses concise labels',()=>{expect(drawView).toContain("textContent = '노선'");expect(drawView).toContain("textContent = '역'");expect(drawView).toContain("textContent = '음식'")});
});
