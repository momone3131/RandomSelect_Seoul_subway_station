import type { AttractionRecommendation } from '../domain/types';
import { googleMapsSearchUrl } from '../services/maps/web-map-links';
import { append, byId, make, replaceContent } from './dom';

function distanceText(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)}m` : `${(Math.round(meters / 100) / 10).toFixed(1)}km`;
}

function ensureSection(): HTMLElement {
  const found = document.getElementById('attraction_section');
  if (found) return found;

  const section = make('section', 'attraction-section');
  section.id = 'attraction_section';
  section.hidden = true;
  section.setAttribute('aria-labelledby', 'attraction_title');
  section.setAttribute('aria-busy', 'false');

  const head = make('div', 'attraction-head');
  const copy = make('div');
  const eyebrow = make('div', 'attraction-eyebrow', 'AROUND THE STOP');
  const title = make('h2', '', '역 주변 볼거리');
  title.id = 'attraction_title';
  const context = make('p', 'attraction-context');
  context.id = 'attraction_context';
  append(copy, eyebrow, title, context);
  const count = make('span', 'count-bubble attraction-count');
  count.id = 'attraction_count';
  count.hidden = true;
  append(head, copy, count);

  const loading = make('div', 'attraction-loading', '주변 볼거리를 찾는 중...');
  loading.id = 'attraction_loading';
  loading.hidden = true;
  const cards = make('div', 'attraction-grid');
  cards.id = 'attraction_cards';
  cards.hidden = true;
  const attribution = make('div', 'google-attribution attraction-attribution');
  attribution.id = 'attraction_attribution';
  attribution.hidden = true;
  attribution.appendChild(make('span', '', 'Google Maps'));

  append(section, head, loading, cards, attribution);
  byId<HTMLElement>('map_actions').insertAdjacentElement('afterend', section);
  return section;
}

export function resetAttractionView(): void {
  const section = ensureSection();
  section.hidden = true;
  section.setAttribute('aria-busy', 'false');
  byId<HTMLElement>('attraction_loading').hidden = true;
  byId<HTMLElement>('attraction_cards').hidden = true;
  byId<HTMLElement>('attraction_count').hidden = true;
  byId<HTMLElement>('attraction_attribution').hidden = true;
  replaceContent(byId<HTMLElement>('attraction_cards'));
}

export function renderAttractionLoading(stationName: string): void {
  const section = ensureSection();
  section.hidden = false;
  section.setAttribute('aria-busy', 'true');
  byId<HTMLElement>('attraction_context').textContent = `${stationName}역 주변을 찾고 있어요.`;
  byId<HTMLElement>('attraction_loading').hidden = false;
  byId<HTMLElement>('attraction_cards').hidden = true;
  byId<HTMLElement>('attraction_count').hidden = true;
  byId<HTMLElement>('attraction_attribution').hidden = true;
}

export function renderAttractions(stationName: string, attractions: readonly AttractionRecommendation[]): void {
  const section = ensureSection();
  section.setAttribute('aria-busy', 'false');
  byId<HTMLElement>('attraction_loading').hidden = true;
  replaceContent(byId<HTMLElement>('attraction_cards'));

  if (!attractions.length) {
    section.hidden = true;
    byId<HTMLElement>('attraction_cards').hidden = true;
    byId<HTMLElement>('attraction_count').hidden = true;
    byId<HTMLElement>('attraction_attribution').hidden = true;
    return;
  }

  section.hidden = false;
  byId<HTMLElement>('attraction_context').textContent = `${stationName}역 근처 · 추천할 만한 곳만 표시`;
  const fragment = document.createDocumentFragment();

  attractions.forEach((attraction, index) => {
    const card = make('article', 'attraction-card');
    const rank = make('span', 'attraction-rank', String(index + 1));
    const name = make('h3', 'attraction-name', attraction.name);
    const category = make('p', 'attraction-category', attraction.category || '볼거리');
    const meta = make('div', 'attraction-meta');
    if (attraction.rating !== undefined) meta.appendChild(make('span', '', `★ ${attraction.rating.toFixed(1)}`));
    if ((attraction.userRatingCount ?? 0) > 0) meta.appendChild(make('span', '', `평가 ${(attraction.userRatingCount ?? 0).toLocaleString('ko-KR')}개`));
    meta.appendChild(make('span', '', `역에서 ${distanceText(attraction.distanceMeters)}`));

    const link = make('a', 'attraction-map-link google-place-link');
    link.href = attraction.mapUrl || googleMapsSearchUrl(`${attraction.name} ${stationName}역`);
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
  byId<HTMLElement>('attraction_attribution').hidden = false;
}
