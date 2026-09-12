import { FOOD_BY_ID } from '../data/food-categories';
import { SUBWAY_LINE_BY_ID } from '../data/subway-lines';
import type { DrawHistoryItem, SubwayLine } from '../domain/types';
import { readableInk } from './color';
import { append, byId, make, replaceContent } from './dom';

function lineBadge(line: SubwayLine): HTMLElement {
  const badge = make('span', `mini-badge${line.badge.length > 1 ? ' wide' : ''}`, line.badge);
  badge.style.setProperty('--line', line.color);
  badge.style.setProperty('--line-ink', readableInk(line.color));
  badge.setAttribute('aria-hidden', 'true');
  return badge;
}

export function renderHistory(history: readonly DrawHistoryItem[]): void {
  byId<HTMLElement>('history_count').textContent = String(history.length);
  byId<HTMLButtonElement>('clear_history').hidden = history.length === 0;

  const fragment = document.createDocumentFragment();
  if (!history.length) {
    fragment.appendChild(make('div', 'history-empty', '역과 음식을 뽑으면 오늘의 외출 코스가 여기에 남아요.'));
    replaceContent(byId<HTMLElement>('history_list'), fragment);
    return;
  }

  for (const item of history) {
    const line = SUBWAY_LINE_BY_ID.get(item.lineId);
    if (!line) continue;
    const food = item.foodId ? FOOD_BY_ID.get(item.foodId) : undefined;
    const card = make('div', 'history-item');
    const text = make('div', 'history-copy');
    const name = make('div', 'history-name', item.stationName);
    name.title = item.stationName;
    const meta = make('div', 'history-meta', `${line.name} · 목록의 ${item.stationOrdinal}번째`);
    const meal = make(
      'div',
      `history-food${food ? '' : ' pending'}`,
      food ? `${food.emoji} ${food.name}` : '음식 미선택',
    );
    append(text, name, meta, meal);
    append(card, lineBadge(line), text);
    fragment.appendChild(card);
  }

  replaceContent(byId<HTMLElement>('history_list'), fragment);
}
