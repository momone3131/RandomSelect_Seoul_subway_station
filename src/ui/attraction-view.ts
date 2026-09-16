import type { AttractionRecommendation, AttractionTier } from '../domain/types';
import { googleMapsAttractionUrl } from '../services/maps/web-map-links';
import { append, byId, make, replaceContent } from './dom';

let lastRenderedSignature = '';

function ensureSection(): HTMLElement {
  const found = document.getElementById('attraction_section');
  if (found) return found;

  const section = make('section', 'restaurant-section attraction-section');
  section.id = 'attraction_section';
  section.hidden = true;
  section.setAttribute('aria-labelledby', 'attraction_title');

  const head = make('div', 'restaurant-head');
  const copy = make('div');
  const title = make('h2', '', '추천 명소');
  title.id = 'attraction_title';
  const context = make('p', 'restaurant-context');
  context.id = 'attraction_context';
  append(copy, title, context);
  const count = make('span', 'count-bubble restaurant-count');
  count.id = 'attraction_count';
  count.hidden = true;
  append(head, copy, count);

  const cards = make('div', 'restaurant-grid attraction-grid');
  cards.id = 'attraction_cards';
  cards.hidden = true;

  append(section, head, cards);
  const panels = document.querySelector<HTMLElement>('.panels');
  if (!panels) throw new Error('Missing .panels.');
  panels.insertAdjacentElement('afterend', section);
  return section;
}

function tierOf(attraction: AttractionRecommendation): AttractionTier {
  return attraction.tier ?? 'standard';
}

function signatureFor(stationName: string, attractions: readonly AttractionRecommendation[]): string {
  return `${stationName}|${attractions
    .map((item) => `${item.id}:${tierOf(item)}:${item.nightscape ? 'night' : 'plain'}`)
    .join('|')}`;
}

export function resetAttractionView(): void {
  const section = ensureSection();
  lastRenderedSignature = '';
  section.hidden = true;
  byId<HTMLElement>('attraction_cards').hidden = true;
  byId<HTMLElement>('attraction_count').hidden = true;
  replaceContent(byId<HTMLElement>('attraction_cards'));
}

export function renderAttractions(stationName: string, attractions: readonly AttractionRecommendation[]): void {
  const section = ensureSection();

  if (!attractions.length) {
    resetAttractionView();
    return;
  }

  const signature = signatureFor(stationName, attractions);
  if (signature === lastRenderedSignature && !section.hidden) return;
  const shouldReveal = signature !== lastRenderedSignature;
  lastRenderedSignature = signature;

  section.hidden = false;
  byId<HTMLElement>('attraction_context').textContent = `${stationName}역 주변`;
  const fragment = document.createDocumentFragment();

  attractions.forEach((attraction) => {
    const tier = tierOf(attraction);
    const revealClass = shouldReveal && tier !== 'standard' ? ' attraction-tier-reveal' : '';
    const nightscapeClass = attraction.nightscape ? ' attraction-nightscape' : '';
    const card = make(
      'article',
      `restaurant-card attraction-card attraction-tier-${tier}${nightscapeClass}${revealClass}`,
    );
    card.dataset.attractionTier = tier;
    if (attraction.nightscape) card.dataset.attractionNightscape = 'true';

    const name = make('h3', 'restaurant-name', attraction.name);
    const category = make('p', 'restaurant-desc', attraction.category || '볼거리');

    const meta = make('div', 'restaurant-meta');
    if (attraction.note) meta.appendChild(make('span', 'restaurant-distance', attraction.note));

    const link = make('a', 'restaurant-map-link attraction-map-link google-place-link');
    link.href = googleMapsAttractionUrl(attraction.name, attraction.mapQuery);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    append(link, make('span', 'map-mark', 'G'), document.createTextNode('지도 보기'));
    append(card, name, category, meta, link);
    fragment.appendChild(card);
  });

  replaceContent(byId<HTMLElement>('attraction_cards'), fragment);
  byId<HTMLElement>('attraction_cards').hidden = false;
  byId<HTMLElement>('attraction_count').textContent = `${attractions.length}곳`;
  byId<HTMLElement>('attraction_count').hidden = false;
}
