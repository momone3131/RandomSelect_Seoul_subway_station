import { getPhysicalStationKey } from '../data/station-equivalence';
import { FOOD_BY_ID } from '../data/food-categories';
import { SUBWAY_LINE_BY_ID, SUBWAY_LINES } from '../data/subway-lines';
import { groupVisitsByPhysicalStation, type VisitFootprintStation } from '../domain/visit-footprint';
import type { VisitRecord } from '../domain/types';
import { readableInk } from './color';
import { append, byId, make, replaceContent } from './dom';

function ensureFootprintModal(): void {
  if (document.getElementById('footprint_overlay')) return;

  const overlay = make('div', 'modal-overlay');
  overlay.id = 'footprint_overlay';
  overlay.hidden = true;

  const dialog = make('section', 'settings-modal footprint-modal');
  dialog.id = 'footprint_dialog';
  dialog.tabIndex = -1;
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'footprint_title');

  const head = make('div', 'dialog-head footprint-head');
  const titleWrap = make('div');
  const title = make('h2', '', '발자취 노선도');
  title.id = 'footprint_title';
  const summary = make('p', 'footprint-summary', '다녀온 역이 하나씩 채워집니다.');
  summary.id = 'footprint_summary';
  append(titleWrap, title, summary);

  const close = make('button', 'close-btn', '×') as HTMLButtonElement;
  close.id = 'close_footprint';
  close.type = 'button';
  close.setAttribute('aria-label', '발자취 노선도 닫기');
  append(head, titleWrap, close);

  const body = make('div', 'footprint-body');
  const status = make('div', 'footprint-map-status', '작은 점은 미방문 · 크게 채워진 점은 방문한 역');
  status.id = 'footprint_map_status';

  const mapWrap = make('div', 'footprint-map-wrap');
  const map = make('div', 'footprint-map footprint-network-scroll');
  map.id = 'footprint_map';
  map.setAttribute('role', 'region');
  map.setAttribute('aria-label', '방문 역 지하철 노선도');
  mapWrap.appendChild(map);

  const detail = make('section', 'footprint-detail');
  detail.id = 'footprint_detail';
  detail.setAttribute('aria-live', 'polite');

  append(body, status, mapWrap, detail);
  append(dialog, head, body);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
}

function formatDate(value: string | undefined): string {
  return value ? value.replace(/-/g, '.') : '날짜 미기록';
}

function visitDetailText(visit: VisitRecord): string {
  const details: string[] = [];
  const food = visit.foodId ? FOOD_BY_ID.get(visit.foodId) : undefined;
  if (food) details.push(`${food.emoji} ${food.name}`);
  if (visit.attractions.length) details.push(...visit.attractions.map((item) => item.name));
  return details.length ? details.join(' · ') : '역 방문만 기록';
}

export class FootprintMapView {
  private groups: VisitFootprintStation[] = [];
  private selectedGroupId?: string;

  constructor() {
    ensureFootprintModal();
  }

  get isOpen(): boolean {
    return !byId<HTMLElement>('footprint_overlay').hidden;
  }

  async open(visits: readonly VisitRecord[]): Promise<void> {
    this.groups = groupVisitsByPhysicalStation(visits);
    this.selectedGroupId = this.groups[0]?.id;

    byId<HTMLElement>('footprint_summary').textContent =
      `방문 역 ${this.groups.length}곳 · 방문 기록 ${visits.length}개`;
    byId<HTMLElement>('footprint_map_status').textContent =
      this.groups.length
        ? '작은 점은 미방문 · 크게 채워진 점은 방문한 역'
        : '저장된 방문 기록이 없어요.';

    byId<HTMLElement>('footprint_overlay').hidden = false;
    this.renderNetwork();
    this.renderDetails();
    window.setTimeout(() => byId<HTMLElement>('footprint_dialog').focus(), 0);
  }

  close(): void {
    byId<HTMLElement>('footprint_overlay').hidden = true;
  }

  private renderNetwork(): void {
    const map = byId<HTMLElement>('footprint_map');
    const fragment = document.createDocumentFragment();

    if (!this.groups.length) {
      fragment.appendChild(make('div', 'footprint-map-empty', '방문 기록을 저장하면 노선도에 발자취가 생겨요.'));
      replaceContent(map, fragment);
      return;
    }

    const groupById = new Map(this.groups.map((group) => [group.id, group]));
    const network = make('div', 'footprint-network');

    for (const line of SUBWAY_LINES) {
      const visitedKeys = new Set<string>();
      for (const station of line.stations) {
        const key = getPhysicalStationKey(line.id, station.name);
        if (groupById.has(key)) visitedKeys.add(key);
      }

      const row = make('section', 'footprint-line-row');
      const label = make('div', 'footprint-line-label');
      const badge = make('span', 'footprint-line-badge', line.badge);
      badge.style.setProperty('--line', line.color);
      badge.style.setProperty('--line-ink', readableInk(line.color));
      const labelCopy = make('div');
      labelCopy.appendChild(make('strong', '', line.name));
      labelCopy.appendChild(make('small', '', `${visitedKeys.size} / ${line.stations.length}`));
      append(label, badge, labelCopy);

      const track = make('div', 'footprint-line-track');
      track.style.setProperty('--line', line.color);
      track.style.setProperty('--station-count', String(line.stations.length));
      track.style.minWidth = `${Math.max(520, line.stations.length * 25)}px`;

      for (const station of line.stations) {
        const key = getPhysicalStationKey(line.id, station.name);
        const group = groupById.get(key);
        const cell = make('div', 'footprint-station-cell');

        if (group) {
          const node = make(
            'button',
            `footprint-station-node visited${key === this.selectedGroupId ? ' selected' : ''}`,
          ) as HTMLButtonElement;
          node.type = 'button';
          node.dataset.footprintKey = key;
          node.style.setProperty('--line', line.color);
          node.setAttribute('aria-pressed', key === this.selectedGroupId ? 'true' : 'false');
          node.setAttribute('aria-label', `${station.name}역, ${group.visits.length}회 방문`);
          node.title = `${station.name}역 · ${group.visits.length}회 방문`;
          if (group.visits.length > 1) node.appendChild(make('span', 'footprint-visit-count', String(group.visits.length)));
          node.addEventListener('click', () => {
            this.selectedGroupId = key;
            this.updateNodeSelection();
            this.renderDetails();
          });
          cell.appendChild(node);
          cell.appendChild(make('span', 'footprint-station-label', station.name));
        } else {
          const node = make('span', 'footprint-station-node');
          node.style.setProperty('--line', line.color);
          node.title = `${station.name}역`;
          node.setAttribute('aria-hidden', 'true');
          cell.appendChild(node);
        }

        track.appendChild(cell);
      }

      append(row, label, track);
      network.appendChild(row);
    }

    fragment.appendChild(network);
    replaceContent(map, fragment);
  }

  private updateNodeSelection(): void {
    const map = byId<HTMLElement>('footprint_map');
    for (const node of map.querySelectorAll<HTMLButtonElement>('[data-footprint-key]')) {
      const selected = node.dataset.footprintKey === this.selectedGroupId;
      node.classList.toggle('selected', selected);
      node.setAttribute('aria-pressed', selected ? 'true' : 'false');
    }
  }

  private renderDetails(): void {
    const detail = byId<HTMLElement>('footprint_detail');
    const group = this.groups.find((item) => item.id === this.selectedGroupId) ?? this.groups[0];
    if (!group) {
      replaceContent(detail, document.createDocumentFragment());
      return;
    }

    this.selectedGroupId = group.id;
    const fragment = document.createDocumentFragment();
    const head = make('div', 'footprint-detail-head');
    const titleWrap = make('div');
    const name = make('h3', '', `${group.stationName}역`);
    const meta = make('p', '', `${group.visits.length}회 방문`);
    append(titleWrap, name, meta);

    const lineWrap = make('div', 'footprint-line-chips');
    const lineIds = Array.from(new Set(group.references.map((reference) => reference.lineId)));
    for (const lineId of lineIds) {
      const line = SUBWAY_LINE_BY_ID.get(lineId);
      if (!line) continue;
      const chip = make('span', 'footprint-line-chip', line.badge);
      chip.title = line.name;
      chip.style.setProperty('--line', line.color);
      chip.style.setProperty('--line-ink', readableInk(line.color));
      lineWrap.appendChild(chip);
    }
    append(head, titleWrap, lineWrap);
    fragment.appendChild(head);

    const history = make('div', 'footprint-visit-history');
    for (const visit of group.visits) {
      const line = SUBWAY_LINE_BY_ID.get(visit.lineId);
      const row = make('article', 'footprint-visit-row');
      const rowHead = make('div', 'footprint-visit-row-head');
      rowHead.appendChild(make('strong', '', formatDate(visit.visitedAt)));
      rowHead.appendChild(make('span', '', line?.name ?? visit.lineId));
      const body = make('p', '', visitDetailText(visit));
      append(row, rowHead, body);
      history.appendChild(row);
    }
    fragment.appendChild(history);
    replaceContent(detail, fragment);
  }
}
