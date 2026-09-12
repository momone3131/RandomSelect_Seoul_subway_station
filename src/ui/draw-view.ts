import type { AppState } from '../state/app-state';
import type { FoodCategory, SubwayLine, SubwayStation } from '../domain/types';
import { readableInk } from './color';
import { append, byId, make, replaceContent } from './dom';

export interface DrawViewStatus {
  busy: boolean;
  modalOpen: boolean;
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
    title.textContent = '어떤 노선을 탈까요?';
    title.className = 'line-title placeholder';
    meta.textContent = '먼저 노선을 뽑아주세요';
    return;
  }

  badge.textContent = line.badge;
  badge.className = `line-badge${line.badge.length > 1 ? ' wide' : ''}`;
  badge.style.setProperty('--line', line.color);
  badge.style.setProperty('--line-ink', readableInk(line.color));
  title.textContent = line.name;
  title.className = `line-title${line.name.length > 5 ? ' long' : ''}`;
  meta.textContent = `수록 ${line.stations.length}개 역 · 1~${line.stations.length}번째`;
}

function renderStation(station?: SubwayStation, line?: SubwayLine): void {
  const panel = byId<HTMLElement>('station_panel');
  const number = byId<HTMLSpanElement>('ordinal_number');
  const name = byId<HTMLDivElement>('station_name');
  const context = byId<HTMLDivElement>('station_context');

  if (!line) {
    panel.className = 'panel station-panel waiting';
    number.textContent = '?';
    number.className = 'ordinal-number';
    name.textContent = '다음 뽑기를 기다리는 중';
    name.className = 'station-name';
    context.textContent = '노선을 먼저 뽑으면 역을 뽑을 수 있어요';
    return;
  }

  if (!station) {
    panel.className = 'panel station-panel ready';
    number.textContent = '?';
    number.className = 'ordinal-number';
    name.textContent = '한 번 더 뽑아주세요';
    name.className = 'station-name';
    context.textContent = `1~${line.stations.length}번째 역 중 하나를 뽑아요`;
    return;
  }

  panel.className = 'panel station-panel complete';
  number.textContent = String(station.ordinal);
  number.className = `ordinal-number${station.ordinal >= 100 ? ' three-digits' : ''}`;
  name.textContent = station.name;
  name.className = `station-name${station.name.length > 7 ? ' long' : ''}`;
  context.textContent = `${station.segmentLabel} · 구간 내 ${station.localIndex}번째`;
}

function renderFood(food: FoodCategory | undefined, station: SubwayStation | undefined, selectedCount: number): void {
  const panel = byId<HTMLElement>('food_panel');
  const emoji = byId<HTMLDivElement>('food_emoji');
  const group = byId<HTMLDivElement>('food_group');
  const name = byId<HTMLDivElement>('food_name');
  const examples = byId<HTMLDivElement>('food_examples');

  if (!food) {
    panel.className = `panel food-panel ${station ? 'ready' : 'waiting'}`;
    emoji.textContent = '🍴';
    group.textContent = station ? '오늘의 한 끼는?' : '마지막 뽑기';
    name.textContent = station ? '이제 음식을 뽑아요' : '무엇을 먹을까요?';
    name.className = 'food-name placeholder';
    examples.textContent = station ? `${selectedCount}종 중에서 하나를 뽑아요` : '역을 정한 뒤 음식 종목을 뽑아요';
    return;
  }

  panel.className = 'panel food-panel complete';
  emoji.textContent = food.emoji;
  group.textContent = food.group;
  name.textContent = food.name;
  name.className = `food-name${food.name.length > 8 ? ' long' : ''}`;
  examples.textContent = `예: ${food.examples}`;
}

function renderSteps(state: Readonly<AppState>): void {
  const stepOne = byId<HTMLElement>('step_one');
  const stepTwo = byId<HTMLElement>('step_two');
  const stepThree = byId<HTMLElement>('step_three');

  stepOne.className = `step ${!state.currentLine ? 'current' : 'done'}`;
  stepTwo.className = `step ${state.currentStation ? 'done' : state.currentLine ? 'current' : ''}`;
  stepThree.className = `step ${state.currentFood ? 'done' : state.currentStation ? 'current' : ''}`;

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

  drawButton.disabled = locked || state.preferences.selectedLineIds.length === 0 || state.preferences.selectedFoodIds.length === 0;
  byId<HTMLButtonElement>('settings_btn').disabled = locked;
  byId<HTMLButtonElement>('food_settings_btn').disabled = locked;
  restart.disabled = locked;
  stationRedraw.disabled = locked || !state.currentStation;
  foodRedraw.disabled = locked || !state.currentFood;
  copy.disabled = locked || !state.currentStation;
  instant.disabled = status.busy;
  instant.checked = state.preferences.instantDraw;

  drawButton.className = `draw-btn${status.busy ? ' busy' : ''}`;
  byId<HTMLElement>('draw_shell').setAttribute('aria-busy', String(status.busy));
  byId<HTMLElement>('draw_shell').setAttribute(
    'data-stage',
    !state.currentLine ? 'line' : !state.currentStation ? 'station' : !state.currentFood ? 'food' : 'done',
  );
  byId<HTMLElement>('draw_label').textContent = status.busy
    ? '두근두근, 뽑는 중…'
    : !state.currentLine
      ? '노선 뽑기'
      : !state.currentStation
        ? '역 순서 뽑기'
        : !state.currentFood
          ? '음식 종목 뽑기'
          : '새 코스 다시 뽑기';

  byId<HTMLElement>('scope_count').textContent = `${state.preferences.selectedLineIds.length}개 노선`;
  byId<HTMLElement>('food_scope_count').textContent = `${state.preferences.selectedFoodIds.length}종 음식`;
  byId<HTMLElement>('secondary_actions').hidden = !state.currentLine;
  stationRedraw.hidden = !state.currentStation;
  foodRedraw.hidden = !state.currentFood;
  copy.hidden = !state.currentStation;
  byId<HTMLElement>('map_actions').hidden = !state.currentStation;
  renderSteps(state);
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
  byId<HTMLElement>('detail_count').textContent = `${line.stations.length}개`;
  byId<HTMLElement>('line_note').textContent = line.note || `${line.segments[0]?.label ?? ''} 순서로 셉니다. 첫 번째 역도 추첨 대상에 포함합니다.`;

  const fragment = document.createDocumentFragment();
  line.segments.forEach((segment, segmentIndex) => {
    const stations = line.stations.filter((station) => station.segmentIndex === segmentIndex);
    if (!stations.length) return;
    const heading = make('h3', 'segment-heading', `${segment.label} · ${stations[0]!.ordinal}~${stations.at(-1)!.ordinal}번째`);
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
  renderLine(state.currentLine);
  renderStation(state.currentStation, state.currentLine);
  renderFood(state.currentFood, state.currentStation, state.preferences.selectedFoodIds.length);
  renderControls(state, status);
  renderStationList(state.currentLine, state.currentStation);
}
