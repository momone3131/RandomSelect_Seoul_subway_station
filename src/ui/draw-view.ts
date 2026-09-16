import type { AppState } from '../state/app-state';
import type { FoodCategory, SubwayLine, SubwayStation } from '../domain/types';
import { readableInk } from './color';
import { append, byId, make, replaceContent } from './dom';
import { placePrimaryDrawButton, type PrimaryDrawStage } from './primary-draw-placement';

export interface DrawViewStatus {
  busy: boolean;
  modalOpen: boolean;
}

function setTrailingText(element: HTMLElement, text: string): void {
  const lastNode = element.lastChild;
  if (lastNode?.nodeType === Node.TEXT_NODE) lastNode.textContent = text;
  else element.append(document.createTextNode(text));
}

function renderHero(state: Readonly<AppState>): void {
  const title = byId<HTMLElement>('page-title');
  const copy = !state.currentLine
    ? '어디로 가볼까?'
    : !state.currentStation
      ? '어느 역에서 내릴까?'
      : !state.currentFood
        ? '식사도 해야지?'
        : '이 코스로 가자!';
  replaceContent(title, make('span', '', copy));
}

const REDRAW_INK: Record<'line_panel' | 'station_panel' | 'food_panel', string> = {
  line_panel: '#8da877',
  station_panel: '#7898a6',
  food_panel: '#b18868',
};

function placeCardRedrawButton(
  button: HTMLButtonElement,
  panelId: 'line_panel' | 'station_panel' | 'food_panel',
  visible: boolean,
  label: string,
): void {
  const panel = byId<HTMLElement>(panelId);
  button.className = 'card-redraw-btn';
  button.hidden = !visible;
  button.setAttribute('aria-label', label);
  button.style.cssText = [
    'position:absolute',
    'top:7px',
    'right:8px',
    'z-index:4',
    'display:grid',
    'place-items:center',
    'width:36px',
    'height:36px',
    'min-height:36px',
    'padding:0',
    'border:0',
    'border-radius:0',
    'background:transparent',
    `color:${REDRAW_INK[panelId]}`,
    'font-size:0',
    'box-shadow:none',
    'opacity:.88',
  ].join(';');
  if (button.parentElement !== panel) panel.appendChild(button);
}

function renderLine(line?: SubwayLine): void {
  const badge = byId<HTMLDivElement>('line_badge');
  const title = byId<HTMLDivElement>('line_title');
  const meta = byId<HTMLDivElement>('line_meta');

  if (!line) {
    badge.textContent = '?';
    badge.className = 'line-badge';
    badge.style.removeProperty('--line');
    badge.style.removeProperty('--line-ink');
    title.textContent = '';
    title.className = 'line-title placeholder';
    meta.textContent = '';
    return;
  }

  badge.textContent = line.badge;
  badge.className = `line-badge${line.badge.length > 1 ? ' wide' : ''}`;
  badge.style.setProperty('--line', line.color);
  badge.style.setProperty('--line-ink', readableInk(line.color));
  title.textContent = line.name;
  title.className = `line-title${line.name.length > 5 ? ' long' : ''}`;
  meta.textContent = '';
}

function renderStation(station?: SubwayStation, line?: SubwayLine): void {
  const panel = byId<HTMLElement>('station_panel');
  const number = byId<HTMLSpanElement>('ordinal_number');
  const name = byId<HTMLDivElement>('station_name');
  const context = byId<HTMLDivElement>('station_context');

  if (!line) {
    panel.className = 'panel station-panel waiting';
    panel.style.removeProperty('--station-line');
    panel.style.removeProperty('--station-line-ink');
    number.textContent = '?';
    number.className = 'ordinal-number';
    name.textContent = '';
    name.className = 'station-name';
    context.textContent = '';
    return;
  }

  panel.style.setProperty('--station-line', line.color);
  panel.style.setProperty('--station-line-ink', readableInk(line.color));

  if (!station) {
    panel.className = 'panel station-panel ready';
    number.textContent = '?';
    number.className = 'ordinal-number';
    name.textContent = '';
    name.className = 'station-name';
    context.textContent = '';
    return;
  }

  panel.className = 'panel station-panel complete';
  number.textContent = String(station.ordinal);
  number.className = `ordinal-number${station.ordinal >= 100 ? ' three-digits' : ''}`;
  name.textContent = station.name;
  name.className = `station-name${station.name.length > 7 ? ' long' : ''}`;
  context.textContent = '';
}

function renderFood(food: FoodCategory | undefined, station: SubwayStation | undefined): void {
  const panel = byId<HTMLElement>('food_panel');
  const emoji = byId<HTMLDivElement>('food_emoji');
  const group = byId<HTMLDivElement>('food_group');
  const name = byId<HTMLDivElement>('food_name');
  const examples = byId<HTMLDivElement>('food_examples');

  if (!food) {
    panel.className = `panel food-panel ${station ? 'ready' : 'waiting'}`;
    emoji.textContent = '';
    group.textContent = '';
    name.textContent = '뭐 먹을까?';
    name.className = 'food-name food-question';
    examples.textContent = '';
    return;
  }

  panel.className = 'panel food-panel complete';
  emoji.textContent = food.emoji;
  group.textContent = '';
  name.textContent = food.name;
  name.className = `food-name${food.name.length > 8 ? ' long' : ''}`;
  examples.textContent = '';
}

function renderSteps(state: Readonly<AppState>): void {
  const stepOne = byId<HTMLElement>('step_one');
  const stepTwo = byId<HTMLElement>('step_two');
  const stepThree = byId<HTMLElement>('step_three');

  stepOne.className = `step ${!state.currentLine ? 'current' : 'done'}`;
  stepTwo.className = `step ${state.currentStation ? 'done' : state.currentLine ? 'current' : ''}`;
  stepThree.className = `step ${state.currentFood ? 'done' : state.currentStation ? 'current' : ''}`;
  setTrailingText(stepOne, '노선');
  setTrailingText(stepTwo, '역');
  setTrailingText(stepThree, '음식');

  for (const step of [stepOne, stepTwo, stepThree]) {
    if (step.classList.contains('current')) step.setAttribute('aria-current', 'step');
    else step.removeAttribute('aria-current');
  }
}

function renderControls(state: Readonly<AppState>, status: DrawViewStatus): void {
  const locked = status.busy || status.modalOpen;
  const drawButton = byId<HTMLButtonElement>('draw_btn');
  const restart = byId<HTMLButtonElement>('restart_btn');
  const stationRedraw = byId<HTMLButtonElement>('station_redraw_btn');
  const foodRedraw = byId<HTMLButtonElement>('food_redraw_btn');
  const copy = byId<HTMLButtonElement>('copy_btn');
  const instant = byId<HTMLInputElement>('instant');
  const stage: PrimaryDrawStage = !state.currentLine
    ? 'line'
    : !state.currentStation
      ? 'station'
      : !state.currentFood
        ? 'food'
        : 'done';

  drawButton.disabled = locked || state.preferences.selectedLineIds.length === 0 || state.preferences.selectedFoodIds.length === 0;
  byId<HTMLButtonElement>('settings_btn').disabled = locked;
  byId<HTMLButtonElement>('food_settings_btn').disabled = locked;
  restart.disabled = locked || !state.currentLine;
  stationRedraw.disabled = locked || !state.currentStation;
  foodRedraw.disabled = locked || !state.currentFood;
  copy.disabled = locked || !state.currentStation;
  instant.disabled = status.busy;
  instant.checked = state.preferences.instantDraw;
  byId<HTMLElement>('scope_count').textContent = `${state.preferences.selectedLineIds.length}개 노선`;
  byId<HTMLElement>('food_scope_count').textContent = `${state.preferences.selectedFoodIds.length}종 음식`;

  drawButton.className = `draw-btn${status.busy ? ' busy' : ''}`;
  const drawShell = byId<HTMLElement>('draw_shell');
  drawShell.setAttribute('aria-busy', String(status.busy));
  drawShell.setAttribute('data-stage', stage);

  byId<HTMLElement>('line_panel_label').textContent = '노선';
  byId<HTMLElement>('station_panel_label').textContent = '역';
  byId<HTMLElement>('food_panel_label').textContent = '음식';
  byId<HTMLElement>('draw_label').textContent = status.busy
    ? '뽑는 중…'
    : stage === 'line'
      ? '노선 뽑기'
      : stage === 'station'
        ? '역 뽑기'
        : stage === 'food'
          ? '음식 뽑기'
          : '새 코스';

  setTrailingText(copy, '복사');
  placeCardRedrawButton(restart, 'line_panel', Boolean(state.currentLine), '노선 다시 뽑기');
  placeCardRedrawButton(stationRedraw, 'station_panel', Boolean(state.currentStation), '역 다시 뽑기');
  placeCardRedrawButton(foodRedraw, 'food_panel', Boolean(state.currentFood), '음식 다시 뽑기');

  const mapActions = byId<HTMLElement>('map_actions');
  if (copy.parentElement !== mapActions) mapActions.prepend(copy);
  copy.hidden = !state.currentStation;
  byId<HTMLElement>('secondary_actions').hidden = true;
  mapActions.hidden = !state.currentStation;
  renderSteps(state);
  placePrimaryDrawButton(stage);
}

function renderStationList(line?: SubwayLine, selected?: SubwayStation): void {
  const detail = byId<HTMLDetailsElement>('station_detail');
  if (!line) {
    detail.hidden = true;
    detail.open = false;
    return;
  }

  detail.hidden = false;
  byId<HTMLElement>('detail_title').textContent = `${line.name} 역 목록`;
  byId<HTMLElement>('detail_count').textContent = '';
  byId<HTMLElement>('line_note').textContent = '';

  const fragment = document.createDocumentFragment();
  line.segments.forEach((segment, segmentIndex) => {
    const stations = line.stations.filter((station) => station.segmentIndex === segmentIndex);
    if (!stations.length) return;
    const heading = make('h3', 'segment-heading', segment.label);
    const grid = make('div', 'station-grid');
    for (const station of stations) {
      const picked = selected?.ordinal === station.ordinal;
      const item = make('div', `station-item${picked ? ' picked' : ''}`);
      if (picked) item.setAttribute('aria-current', 'true');
      append(
        item,
        make('span', 'station-index', `${station.ordinal < 10 ? '0' : ''}${station.ordinal}`),
        make('span', '', station.name),
      );
      grid.appendChild(item);
    }
    append(fragment, heading, grid);
  });
  replaceContent(byId<HTMLElement>('station_list'), fragment);
}

export function renderDrawView(state: Readonly<AppState>, status: DrawViewStatus): void {
  renderHero(state);
  renderLine(state.currentLine);
  renderStation(state.currentStation, state.currentLine);
  renderFood(state.currentFood, state.currentStation);
  renderControls(state, status);
  renderStationList(state.currentLine, state.currentStation);
}
