import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const styles = [
  readFileSync(new URL('../src/ui/styles.css', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/ui/mobile-overrides.css', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/ui/subway-sign-overrides.css', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/ui/minimal-palette-overrides.css', import.meta.url), 'utf8'),
].join('\n');
const primaryDrawPlacement = readFileSync(new URL('../src/ui/primary-draw-placement.ts', import.meta.url), 'utf8');
const drawAnimation = readFileSync(new URL('../src/ui/draw-animation.ts', import.meta.url), 'utf8');
const drawView = readFileSync(new URL('../src/ui/draw-view.ts', import.meta.url), 'utf8');
const attractionView = readFileSync(new URL('../src/ui/attraction-view.ts', import.meta.url), 'utf8');
const settingsView = readFileSync(new URL('../src/ui/settings-view.ts', import.meta.url), 'utf8');
const visitView = readFileSync(new URL('../src/ui/visit-view.ts', import.meta.url), 'utf8');
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

  it('uses a restrained neutral passive palette and hides the redundant progress strip', () => {
    expect(styles).toContain('--bg:#f5f4f0');
    expect(styles).toContain('--paper:#fffdfa');
    expect(styles).toContain('--surface:#e9ebe7');
    expect(styles).toContain('.progress{display:none!important}');
    expect(styles).toContain('.draw-shell,');
    expect(styles).toContain('.station-detail,');
    expect(styles).toContain('.history-item,');
    expect(styles).toContain('background:var(--surface)');
    expect(styles).toContain('background:var(--paper)');
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

  it('renders attraction tiers without visible tier labels', () => {
    expect(attractionView).toContain('attraction-tier-${tier}');
    expect(attractionView).toContain("tier !== 'standard' ? ' attraction-tier-reveal' : ''");
    expect(attractionView).toContain('card.dataset.attractionTier = tier');
    expect(attractionView).not.toContain("make('span', 'attraction-tier");
  });

  it('renders diamond as a distinct gemstone while gold and silver stay metallic', () => {
    expect(styles).toContain('.attraction-card.attraction-tier-diamond');
    expect(styles).toContain('.attraction-card.attraction-tier-gold');
    expect(styles).toContain('.attraction-card.attraction-tier-silver');
    expect(styles).toContain('attraction-diamond-prism');
    expect(styles).toContain('attraction-diamond-sparkle');
    expect(styles).toContain('attraction-diamond-sparkle-arrive');
    expect(styles).toContain('attraction-diamond-arrive 1.8s');
    expect(styles).toContain('#43cfd8');
    expect(styles).toContain('#c6b2ff');
    expect(styles).toContain('0 0 0 16px rgba(84,224,232,.46)');
    expect(styles).toContain('0 0 42px rgba(75,214,230,.38)');
    expect(styles).toContain('attraction-gold-sheen');
    expect(styles).toContain('attraction-silver-sheen');
    expect(styles).toContain('border:3px solid transparent!important');
    expect(styles).toContain('@media(prefers-reduced-motion:reduce)');
    expect(attractionView).toContain('lastRenderedSignature');
    expect(attractionView).toContain('if (signature === lastRenderedSignature && !section.hidden) return;');
  });

  it('layers nightscape atmosphere independently from the prominence border', () => {
    expect(attractionView).toContain("const nightscapeClass = attraction.nightscape ? ' attraction-nightscape' : ''");
    expect(attractionView).toContain("card.dataset.attractionNightscape = 'true'");
    expect(attractionView).toContain("item.nightscape ? 'night' : 'plain'");
    expect(styles).toContain('.attraction-card.attraction-nightscape::before');
    expect(styles).toContain('linear-gradient(148deg,#081227 0%,#132343 53%,#241a40 100%)');
    expect(styles).toContain('.attraction-tier-gold.attraction-nightscape::before');
    expect(styles).toContain('.attraction-tier-silver.attraction-nightscape::before');
    expect(styles).toContain('.attraction-tier-diamond.attraction-nightscape::before{inset:3px}');
    expect(styles).toContain('.attraction-card.attraction-nightscape>*{position:relative;z-index:2}');
    expect(attractionView).not.toContain("make('span', 'attraction-nightscape");
  });

  it('adds a one-button alcohol include/exclude preset only to food settings', () => {
    expect(settingsView).toContain("button.id = 'preset_alcohol'");
    expect(settingsView).toContain("hasAlcohol ? '주류 제외' : '주류 포함'");
    expect(settingsView).toContain('ALCOHOL_FOOD_IDS');
    expect(settingsView).toContain('isAlcoholFoodId');
    expect(settingsView).toContain('this.alcoholPreset.hidden = !isFood');
    expect(settingsView).toContain('toggleAlcohol(): void');
  });

  it('shows the live selected food count instead of the old static 36-category copy', () => {
    expect(drawView).toContain("byId<HTMLElement>('food_scope_count').textContent = `${state.preferences.selectedFoodIds.length}종 음식`");
    expect(settingsView).toContain('식사·주류 종목을 ${FOOD_CATEGORIES.length}종으로 나눴어요');
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

  it('moves redraw actions into completed result cards with larger icon glyphs', () => {
    expect(drawView).toContain("placeCardRedrawButton(restart, 'line_panel'");
    expect(drawView).toContain("placeCardRedrawButton(stationRedraw, 'station_panel'");
    expect(drawView).toContain("placeCardRedrawButton(foodRedraw, 'food_panel'");
    expect(drawView).toContain("'background:transparent'");
    expect(drawView).toContain("'width:36px'");
    expect(styles).toContain('.card-redraw-btn svg{width:27px;height:27px}');
    expect(styles).toContain('.card-redraw-btn svg path{stroke-width:2.7}');
  });

  it('renders a completed station as a vertically centered line-colored subway sign', () => {
    expect(drawView).toContain("panel.style.setProperty('--station-line', line.color)");
    expect(drawView).toContain("panel.style.setProperty('--station-line-ink', readableInk(line.color))");
    expect(styles).toContain('.station-panel.complete:not(.next-draw)');
    expect(styles).toContain('border:5px solid var(--station-line,#7898a6)!important');
    expect(styles).toContain('align-content:center');
    expect(styles).toContain('font-size:28px');
    expect(styles).toContain('font-size:23px;line-height:1.15');
  });

  it('keeps a centered food prompt visible before and during the food stage without enlarging the card', () => {
    expect(drawView).toContain("name.textContent = '뭐 먹을까?'");
    expect(drawView).toContain("name.className = 'food-name food-question'");
    expect(styles).toContain('.food-panel.waiting .food-question{color:var(--muted);opacity:.48}');
    expect(styles).toContain('.food-panel.ready .food-question{color:var(--dark);opacity:1}');
    expect(styles).toContain('.food-panel.waiting .food-emoji');
  });

  it('keeps copy and both station map actions in one compact row', () => {
    expect(drawView).toContain('if (copy.parentElement !== mapActions) mapActions.prepend(copy)');
    expect(drawView).toContain("byId<HTMLElement>('secondary_actions').hidden = true");
    expect(styles).toContain('grid-template-columns:repeat(3,minmax(0,1fr))');
  });

  it('keeps completed-course commitment and new-course actions side by side', () => {
    expect(styles).toContain('.done-actions{');
    expect(styles).toContain('grid-template-columns:minmax(0,1fr) minmax(0,1fr)');
    expect(styles).toContain('.current-course-visit-btn.saved:disabled');
  });

  it('changes the hero prompt with the draw stage', () => {
    expect(drawView).toContain("'어디로 가볼까?'");
    expect(drawView).toContain("'어느 역에서 내릴까?'");
    expect(drawView).toContain("'식사도 해야지?'");
    expect(drawView).toContain("'이 코스로 가자!'");
  });

  it('copies a conversational station and food invitation without line or restaurant detail', () => {
    expect(main).toContain('`${state.currentStation.name}에서 ${state.currentFood.name} 먹자!`');
    expect(main).toContain('`${state.currentStation.name} 가자!`');
    expect(main).not.toContain('목록의 ${state.currentStation.ordinal}번째 역');
    expect(main).not.toContain('예시: ${state.currentFood.examples}');
  });

  it('keeps durable visit records separate from recent draw history', () => {
    expect(visitView).toContain("'발자취 '");
    expect(visitView).toContain("'발자취 노선도 보기'");
    expect(visitView).toContain('방문 역 · 필수');
    expect(visitView).toContain("'실제로 먹었나요?'");
    expect(visitView).toContain("'실제로 들른 명소'");
    expect(visitView).toContain("input.name = 'visit_attraction'");
    expect(main).toContain('saveVisits(storage, state.visits)');
    expect(main).toContain('최근 추첨 기록만 지웠어요. 방문 기록은 유지돼요.');
    expect(styles).toContain('.history-visit-btn');
    expect(styles).toContain('.visit-modal');
  });

  it('uses concise stage labels', () => {
    expect(drawView).toContain("textContent = '노선'");
    expect(drawView).toContain("textContent = '역'");
    expect(drawView).toContain("textContent = '음식'");
  });
});
