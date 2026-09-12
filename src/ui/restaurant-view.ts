import type { ProviderAttribution, RestaurantRecommendation } from '../domain/types';
import { googleMapsSearchUrl, naverMapSearchUrl } from '../services/maps/web-map-links';
import { append, byId, make, replaceContent } from './dom';

export interface RestaurantViewContext {
  stationName: string;
  foodName: string;
  query: string;
}

function distanceText(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(Math.round(meters / 100) / 10).toFixed(1)}km`;
}

function renderAttributions(restaurants: readonly RestaurantRecommendation[]): void {
  const container = byId<HTMLElement>('google_provider_attributions');
  const block = byId<HTMLElement>('google_attribution');
  const seen = new Set<string>();
  const unique: ProviderAttribution[] = [];

  for (const restaurant of restaurants) {
    for (const attribution of restaurant.attributions ?? []) {
      const key = `${attribution.provider}|${attribution.uri ?? ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(attribution);
    }
  }

  const fragment = document.createDocumentFragment();
  for (const attribution of unique) {
    if (attribution.uri) {
      const link = make('a', '', attribution.provider);
      link.href = attribution.uri;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      fragment.appendChild(link);
    } else {
      fragment.appendChild(make('span', '', attribution.provider));
    }
  }
  replaceContent(container, fragment);
  block.hidden = restaurants.length === 0;
}

function setContext(context: RestaurantViewContext): void {
  byId<HTMLElement>('restaurant_context').textContent = `${context.stationName}역 근처 · ${context.foodName}`;
  byId<HTMLAnchorElement>('restaurant_search_link').href = googleMapsSearchUrl(context.query);
  byId<HTMLAnchorElement>('restaurant_naver_link').href = naverMapSearchUrl(context.query);
}

export function resetRestaurantView(): void {
  const section = byId<HTMLElement>('restaurant_section');
  section.hidden = true;
  section.setAttribute('aria-busy', 'false');
  byId<HTMLElement>('restaurant_loading').hidden = true;
  byId<HTMLElement>('restaurant_cards').hidden = true;
  byId<HTMLElement>('restaurant_empty').hidden = true;
  byId<HTMLElement>('restaurant_count').hidden = true;
  byId<HTMLElement>('restaurant_extra_actions').hidden = true;
  byId<HTMLElement>('google_attribution').hidden = true;
  replaceContent(byId<HTMLElement>('restaurant_cards'));
}

export function renderRestaurantLoading(context: RestaurantViewContext): void {
  const section = byId<HTMLElement>('restaurant_section');
  section.hidden = false;
  section.setAttribute('aria-busy', 'true');
  setContext(context);
  byId<HTMLElement>('restaurant_loading').hidden = false;
  byId<HTMLElement>('restaurant_cards').hidden = true;
  byId<HTMLElement>('restaurant_empty').hidden = true;
  byId<HTMLElement>('restaurant_count').hidden = true;
  byId<HTMLElement>('restaurant_extra_actions').hidden = true;
  byId<HTMLElement>('google_attribution').hidden = true;
}

export function renderRestaurantError(context: RestaurantViewContext, message: string): void {
  const section = byId<HTMLElement>('restaurant_section');
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
  section.hidden = false;
  section.setAttribute('aria-busy', 'false');
  setContext(context);
  byId<HTMLElement>('restaurant_loading').hidden = true;
  byId<HTMLElement>('restaurant_cards').hidden = true;
  byId<HTMLElement>('restaurant_empty').hidden = false;
  byId<HTMLElement>('restaurant_count').hidden = true;
  byId<HTMLElement>('restaurant_empty_title').textContent = offline
    ? '인터넷 연결이 필요해요.'
    : '추천 정보를 불러오지 못했어요.';
  byId<HTMLElement>('restaurant_empty_context').textContent = offline
    ? '노선·역·음식 추첨은 그대로 사용할 수 있어요. 연결 후 음식만 다시 뽑으면 추천 식당을 불러옵니다.'
    : message;
  byId<HTMLElement>('restaurant_extra_actions').hidden = offline;
  byId<HTMLElement>('google_attribution').hidden = true;
}

export function renderRestaurants(
  context: RestaurantViewContext,
  restaurants: readonly RestaurantRecommendation[],
): void {
  const section = byId<HTMLElement>('restaurant_section');
  section.hidden = false;
  section.setAttribute('aria-busy', 'false');
  setContext(context);
  byId<HTMLElement>('restaurant_loading').hidden = true;
  byId<HTMLElement>('restaurant_extra_actions').hidden = false;
  replaceContent(byId<HTMLElement>('restaurant_cards'));

  if (!restaurants.length) {
    byId<HTMLElement>('restaurant_cards').hidden = true;
    byId<HTMLElement>('restaurant_empty').hidden = false;
    byId<HTMLElement>('restaurant_count').hidden = true;
    byId<HTMLElement>('restaurant_empty_title').textContent = '주변에서 추천 식당을 찾지 못했어요.';
    byId<HTMLElement>('restaurant_empty_context').textContent = `${context.stationName}역 주변의 ${context.foodName} 식당을 지도에서 둘러볼 수 있어요.`;
    byId<HTMLElement>('google_attribution').hidden = true;
    return;
  }

  const fragment = document.createDocumentFragment();
  restaurants.forEach((restaurant, index) => {
    const card = make('article', 'restaurant-card');
    const rank = make('span', 'restaurant-rank', String(index + 1));
    const name = make('h3', 'restaurant-name', restaurant.name);
    const description = make('p', 'restaurant-desc', restaurant.category || context.foodName);
    const meta = make('div', 'restaurant-meta');

    if (restaurant.rating !== undefined) {
      meta.appendChild(make('span', 'restaurant-rating', `★ ${restaurant.rating.toFixed(1)}`));
    }
    if ((restaurant.userRatingCount ?? 0) > 0) {
      meta.appendChild(make('span', 'restaurant-reviews', `평가 ${(restaurant.userRatingCount ?? 0).toLocaleString('ko-KR')}개`));
    }
    meta.appendChild(make('span', 'restaurant-distance', `역에서 ${distanceText(restaurant.distanceMeters)}`));

    const mapLink = make('a', 'restaurant-map-link google-place-link');
    mapLink.href = restaurant.mapUrl || googleMapsSearchUrl(`${restaurant.name} ${context.stationName}역`);
    mapLink.target = '_blank';
    mapLink.rel = 'noopener noreferrer';
    append(mapLink, make('span', 'map-mark', 'G'), document.createTextNode('구글지도에서 보기'));

    append(card, rank, name, description, meta, mapLink);
    fragment.appendChild(card);
  });

  replaceContent(byId<HTMLElement>('restaurant_cards'), fragment);
  byId<HTMLElement>('restaurant_cards').hidden = false;
  byId<HTMLElement>('restaurant_empty').hidden = true;
  byId<HTMLElement>('restaurant_count').textContent = `${restaurants.length}곳`;
  byId<HTMLElement>('restaurant_count').hidden = false;
  renderAttributions(restaurants);
}
