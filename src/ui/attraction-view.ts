import type { AttractionRecommendation } from '../domain/types';
import { googleMapsAttractionUrl } from '../services/maps/web-map-links';
import { append, byId, make, replaceContent } from './dom';

function ensureSection(): HTMLElement {
  const found = document.getElementById('attraction_section');
  if (found) return found;

  const section = make('section', 'restaurant-section attraction-section');
  section.id = 'attraction_section';
  section.hidden = true;
  section.setAttribute('aria-labelledby', 'attraction_title');

  const head = make('div', 'restaurant-head');
  const copy = make('div');
  const eyebrow = make('div', 'restaurant-eyebrow', 'AROUND THE STOP');
  const title = make('h2', '', '역 주변 볼거리');
  title.id = 'attraction_title';
  const context = make('p', 'restaurant-context');
  context.id = 'attraction_context';
  append(copy, eyebrow, title, context);
  const count = make('span', 'count-bubble restaurant-count');
  count.id = 'attraction_count';
  count.hidden = true;
  append(head, copy, count);

  const cards = make('div', 'restaurant-grid');
  cards.id = 'attraction_cards';
  cards.hidden = true;

  append(section, head, cards);
  byId<HTMLElement>('map_actions').insertAdjacentElement('afterend', section);
  return section;
}

export function resetAttractionView(): void {
  const section = ensureSection();
  section.hidden = true;
  byId<HTMLElement>('attraction_cards').hidden = true;
  byId<HTMLElement>('attraction_count').hidden = true;
  replaceContent(byId<HTMLElement>('attraction_cards'));
}

export function renderAttractions(stationName: string, attractions: readonly AttractionRecommendation[]): void {
  const section = ensureSection();
  replaceContent(byId<HTMLElement>('attraction_cards'));

  if (!attractions.length) {
    resetAttractionView();
    return;
  }

  section.hidden = false;
  byId<HTMLElement>('attraction_context').textContent = `${stationName}역 주변 · 둘러보기 좋은 곳만 엄선`;
  const fragment = document.createDocumentFragment();

  attractions.forEach((attraction, index) => {
    const card = make('article', 'restaurant-card attraction-card');
    const rank = make('span', 'restaurant-rank', String(index + 1));
    const name = make('h3', 'restaurant-name', attraction.name);
    const category = make('p', 'restaurant-desc', attraction.category || '볼거리');

    const meta = make('div', 'restaurant-meta');
    if (attraction.note) meta.appendChild(make('span', 'restaurant-distance', attraction.note));

    const link = make('a', 'restaurant-map-link attraction-map-link google-place-link');
    link.href = googleMapsAttractionUrl(attraction.name, attraction.mapQuery);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    append(link, make('span', 'map-mark', 'G'), document.createTextNode('구글지도에서 보기'));
    append(card, rank, name, category, meta, link);
    fragment.appendChild(card);
  });

  replaceContent(byId<HTMLElement>('attraction_cards'), fragment);
  byId<HTMLElement>('attraction_cards').hidden = false;
  byId<HTMLElement>('attraction_count').textContent = `${attractions.length}곳`;
  byId<HTMLElement>('attraction_count').hidden = false;
}
