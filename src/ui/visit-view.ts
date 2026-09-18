import { getCuratedAttractions } from '../data/curated-attractions';
import { FOOD_BY_ID } from '../data/food-categories';
import { SUBWAY_LINE_BY_ID } from '../data/subway-lines';
import type { AttractionSnapshot, DrawHistoryItem, SubwayLine, VisitRecord } from '../domain/types';
import { readableInk } from './color';
import { append, byId, make, replaceContent } from './dom';

export interface VisitFormSubmission {
  visitId?: string;
  sourceHistoryId?: string;
  lineId: string;
  stationName: string;
  stationOrdinal: number;
  drawnFoodId?: string;
  shownAttractions: AttractionSnapshot[];
  includeFood: boolean;
  selectedAttractionIds: string[];
  visitedAt?: string;
}

export interface VisitListCallbacks {
  onEdit(visit: VisitRecord): void;
  onDelete(visit: VisitRecord): void;
  onOpenMap(): void;
}

function lineBadge(line: SubwayLine): HTMLElement {
  const badge = make('span', `mini-badge${line.badge.length > 1 ? ' wide' : ''}`, line.badge);
  badge.style.setProperty('--line', line.color);
  badge.style.setProperty('--line-ink', readableInk(line.color));
  badge.setAttribute('aria-hidden', 'true');
  return badge;
}

function todayLocal(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function fallbackAttractions(item: DrawHistoryItem): AttractionSnapshot[] {
  if (item.attractionOptions?.length) return item.attractionOptions.map((option) => ({ ...option }));
  return getCuratedAttractions(item.lineId, item.stationName).map((attraction) => ({
    id: attraction.id,
    name: attraction.name,
  }));
}

function ensureVisitSection(): HTMLElement {
  let section = document.getElementById('visit_history');
  if (section) return section;

  section = make('section', 'history visit-history');
  section.id = 'visit_history';
  section.setAttribute('aria-labelledby', 'visit_history_title');

  const head = make('div', 'section-head');
  const title = make('h2');
  title.id = 'visit_history_title';
  title.append('다녀온 곳 ');
  const count = make('span', 'count-bubble', '0');
  count.id = 'visit_count';
  title.appendChild(count);
  const mapButton = make('button', 'history-visit-btn visit-map-btn', '발자취 지도') as HTMLButtonElement;
  mapButton.id = 'footprint_map_btn';
  mapButton.type = 'button';
  mapButton.hidden = true;
  head.appendChild(title);
  head.appendChild(mapButton);

  const list = make('div', 'history-list visit-list');
  list.id = 'visit_list';
  list.appendChild(make('div', 'history-empty', '방문한 역을 기록하면 추첨 기록을 지워도 여기에 계속 남아요.'));

  append(section, head, list);
  const history = document.querySelector<HTMLElement>('section.history');
  if (!history) throw new Error('Missing draw history section.');
  history.insertAdjacentElement('afterend', section);
  return section;
}

function ensureVisitModal(): void {
  if (document.getElementById('visit_overlay')) return;

  const overlay = make('div', 'modal-overlay');
  overlay.id = 'visit_overlay';
  overlay.hidden = true;

  const dialog = make('section', 'settings-modal visit-modal');
  dialog.id = 'visit_dialog';
  dialog.tabIndex = -1;
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'visit_title');
  dialog.setAttribute('aria-describedby', 'visit_desc');

  const head = make('div', 'dialog-head');
  const title = make('h2', '', '다녀온 곳 기록');
  title.id = 'visit_title';
  const desc = make('p', '', '역은 항상 기록돼요. 음식과 명소는 실제로 간 것만 선택하세요.');
  desc.id = 'visit_desc';
  const close = make('button', 'close-btn', '×') as HTMLButtonElement;
  close.id = 'close_visit';
  close.type = 'button';
  close.setAttribute('aria-label', '방문 기록 창 닫기');
  append(head, title, desc, close);

  const body = make('div', 'dialog-body visit-dialog-body');
  const station = make('div', 'visit-station-card');
  station.innerHTML = '<span>방문 역 · 필수</span><strong id="visit_station_name"></strong><small id="visit_station_line"></small>';

  const dateField = make('label', 'visit-date-field');
  const dateLabel = make('span', '', '방문일 · 선택');
  const dateInput = document.createElement('input');
  dateInput.id = 'visit_date';
  dateInput.type = 'date';
  append(dateField, dateLabel, dateInput);

  const foodGroup = make('fieldset', 'visit-choice-group');
  foodGroup.id = 'visit_food_group';
  const foodLegend = make('legend', '', '실제로 먹었나요?');
  const foodOptions = make('div', 'visit-choice-list');
  foodOptions.id = 'visit_food_options';
  append(foodGroup, foodLegend, foodOptions);

  const attractionGroup = make('fieldset', 'visit-choice-group');
  attractionGroup.id = 'visit_attraction_group';
  const attractionLegend = make('legend', '', '실제로 들른 명소');
  const attractionHint = make('p', 'visit-choice-hint', '여러 곳을 다녀왔다면 모두 선택할 수 있어요.');
  const attractionOptions = make('div', 'visit-choice-list');
  attractionOptions.id = 'visit_attraction_options';
  append(attractionGroup, attractionLegend, attractionHint, attractionOptions);

  append(body, station, dateField, foodGroup, attractionGroup);

  const foot = make('div', 'dialog-foot');
  const note = make('p', 'dialog-note', '최근 추첨 기록을 지워도 이 방문 기록은 별도로 유지됩니다.');
  const cancel = make('button', 'plain-btn', '취소') as HTMLButtonElement;
  cancel.id = 'cancel_visit';
  cancel.type = 'button';
  const save = make('button', 'apply-btn', '방문 기록 저장') as HTMLButtonElement;
  save.id = 'save_visit';
  save.type = 'button';
  append(foot, note, cancel, save);

  append(dialog, head, body, foot);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
}

export class VisitModalView {
  private source?: VisitFormSubmission;

  constructor() {
    ensureVisitModal();
  }

  get isOpen(): boolean {
    return !byId<HTMLElement>('visit_overlay').hidden;
  }

  openFromHistory(item: DrawHistoryItem, existing?: VisitRecord): void {
    const shownAttractions = existing
      ? existing.shownAttractions.map((option) => ({ ...option }))
      : fallbackAttractions(item);
    const drawnFoodId = existing?.drawnFoodId ?? item.foodId;

    this.open({
      visitId: existing?.id,
      sourceHistoryId: item.id,
      lineId: item.lineId,
      stationName: item.stationName,
      stationOrdinal: item.stationOrdinal,
      drawnFoodId,
      shownAttractions,
      includeFood: Boolean(existing?.foodId),
      selectedAttractionIds: existing?.attractions.map((attraction) => attraction.id) ?? [],
      visitedAt: existing ? existing.visitedAt : todayLocal(),
    });
  }

  openVisit(visit: VisitRecord): void {
    this.open({
      visitId: visit.id,
      sourceHistoryId: visit.sourceHistoryId,
      lineId: visit.lineId,
      stationName: visit.stationName,
      stationOrdinal: visit.stationOrdinal,
      drawnFoodId: visit.drawnFoodId,
      shownAttractions: visit.shownAttractions.map((option) => ({ ...option })),
      includeFood: Boolean(visit.foodId),
      selectedAttractionIds: visit.attractions.map((attraction) => attraction.id),
      visitedAt: visit.visitedAt,
    });
  }

  close(): void {
    byId<HTMLElement>('visit_overlay').hidden = true;
    this.source = undefined;
  }

  getSubmission(): VisitFormSubmission | undefined {
    if (!this.source) return undefined;
    const food = document.querySelector<HTMLInputElement>('input[name="visit_food"]');
    const selectedAttractionIds = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[name="visit_attraction"]:checked'),
    ).map((input) => input.value);
    const visitedAt = byId<HTMLInputElement>('visit_date').value || undefined;

    return {
      ...this.source,
      includeFood: Boolean(food?.checked),
      selectedAttractionIds,
      visitedAt,
    };
  }

  private open(source: VisitFormSubmission): void {
    this.source = {
      ...source,
      shownAttractions: source.shownAttractions.map((option) => ({ ...option })),
      selectedAttractionIds: [...source.selectedAttractionIds],
    };

    const line = SUBWAY_LINE_BY_ID.get(source.lineId);
    byId<HTMLElement>('visit_station_name').textContent = `${source.stationName}역`;
    byId<HTMLElement>('visit_station_line').textContent = line?.name ?? source.lineId;
    byId<HTMLInputElement>('visit_date').value = source.visitedAt ?? '';

    const foodList = byId<HTMLElement>('visit_food_options');
    const foodFragment = document.createDocumentFragment();
    const food = source.drawnFoodId ? FOOD_BY_ID.get(source.drawnFoodId) : undefined;
    if (food) {
      const label = make('label', 'visit-check-row');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'visit_food';
      input.value = food.id;
      input.checked = source.includeFood;
      const copy = make('span', '', `${food.emoji} ${food.name}`);
      append(label, input, copy);
      foodFragment.appendChild(label);
    } else {
      foodFragment.appendChild(make('div', 'visit-none', '이 추첨 기록에는 음식 종목이 아직 없어요.'));
    }
    replaceContent(foodList, foodFragment);

    const attractionList = byId<HTMLElement>('visit_attraction_options');
    const attractionFragment = document.createDocumentFragment();
    const selected = new Set(source.selectedAttractionIds);
    if (source.shownAttractions.length) {
      for (const attraction of source.shownAttractions) {
        const label = make('label', 'visit-check-row');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'visit_attraction';
        input.value = attraction.id;
        input.checked = selected.has(attraction.id);
        append(label, input, make('span', '', attraction.name));
        attractionFragment.appendChild(label);
      }
    } else {
      attractionFragment.appendChild(make('div', 'visit-none', '이 역에는 당시 표시된 추천 명소가 없어요.'));
    }
    replaceContent(attractionList, attractionFragment);

    byId<HTMLElement>('visit_overlay').hidden = false;
    window.setTimeout(() => byId<HTMLElement>('visit_dialog').focus(), 0);
  }
}

export function renderVisits(visits: readonly VisitRecord[], callbacks: VisitListCallbacks): void {
  ensureVisitSection();
  byId<HTMLElement>('visit_count').textContent = String(visits.length);
  const mapButton = byId<HTMLButtonElement>('footprint_map_btn');
  mapButton.hidden = visits.length === 0;
  mapButton.onclick = visits.length ? callbacks.onOpenMap : null;
  const fragment = document.createDocumentFragment();

  if (!visits.length) {
    fragment.appendChild(make('div', 'history-empty', '방문한 역을 기록하면 추첨 기록을 지워도 여기에 계속 남아요.'));
    replaceContent(byId<HTMLElement>('visit_list'), fragment);
    return;
  }

  for (const visit of visits) {
    const line = SUBWAY_LINE_BY_ID.get(visit.lineId);
    if (!line) continue;
    const food = visit.foodId ? FOOD_BY_ID.get(visit.foodId) : undefined;

    const card = make('div', 'history-item visit-item');
    const copy = make('div', 'history-copy');
    const name = make('div', 'history-name', visit.stationName);
    const date = visit.visitedAt ? visit.visitedAt.replace(/-/g, '.') : '날짜 미기록';
    const meta = make('div', 'history-meta', `${line.name} · ${date}`);
    append(copy, name, meta);

    const details = make('div', 'visit-details');
    const detailParts: string[] = [];
    if (food) detailParts.push(`${food.emoji} ${food.name}`);
    if (visit.attractions.length) detailParts.push(...visit.attractions.map((item) => item.name));
    details.textContent = detailParts.length ? detailParts.join(' · ') : '역 방문만 기록';
    copy.appendChild(details);

    const actions = make('div', 'visit-card-actions');
    const edit = make('button', 'history-visit-btn', '수정') as HTMLButtonElement;
    edit.type = 'button';
    edit.addEventListener('click', () => callbacks.onEdit(visit));
    const remove = make('button', 'history-visit-btn danger', '삭제') as HTMLButtonElement;
    remove.type = 'button';
    remove.addEventListener('click', () => callbacks.onDelete(visit));
    append(actions, edit, remove);

    append(card, lineBadge(line), copy, actions);
    fragment.appendChild(card);
  }

  replaceContent(byId<HTMLElement>('visit_list'), fragment);
}
