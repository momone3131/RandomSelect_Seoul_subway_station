import { getStaticStationLocation } from '../data/station-coordinates';
import { FOOD_BY_ID } from '../data/food-categories';
import { SUBWAY_LINE_BY_ID } from '../data/subway-lines';
import { groupVisitsByPhysicalStation, type VisitFootprintStation } from '../domain/visit-footprint';
import type { VisitRecord } from '../domain/types';
import type { StationLocationService } from '../services/places/station-location';
import { readableInk } from './color';
import { append, byId, make, replaceContent } from './dom';

interface LocatedFootprintStation {
  group: VisitFootprintStation;
  latitude: number;
  longitude: number;
}

interface WorldPoint {
  x: number;
  y: number;
}

const TILE_SIZE = 256;
const MIN_ZOOM = 6;
const MAX_ZOOM = 16;
const SINGLE_PIN_ZOOM = 13;

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
  const title = make('h2', '', '발자취 지도');
  title.id = 'footprint_title';
  const summary = make('p', 'footprint-summary', '방문한 역을 지도에서 모아봐요.');
  summary.id = 'footprint_summary';
  append(titleWrap, title, summary);
  const close = make('button', 'close-btn', '×') as HTMLButtonElement;
  close.id = 'close_footprint';
  close.type = 'button';
  close.setAttribute('aria-label', '발자취 지도 닫기');
  append(head, titleWrap, close);

  const body = make('div', 'footprint-body');
  const status = make('div', 'footprint-map-status', '');
  status.id = 'footprint_map_status';

  const mapWrap = make('div', 'footprint-map-wrap');
  const map = make('div', 'footprint-map');
  map.id = 'footprint_map';
  map.setAttribute('role', 'region');
  map.setAttribute('aria-label', '방문 역 발자취 지도');

  const zoomControls = make('div', 'footprint-zoom-controls');
  const zoomIn = make('button', '', '+') as HTMLButtonElement;
  zoomIn.id = 'footprint_zoom_in';
  zoomIn.type = 'button';
  zoomIn.setAttribute('aria-label', '지도 확대');
  const zoomOut = make('button', '', '−') as HTMLButtonElement;
  zoomOut.id = 'footprint_zoom_out';
  zoomOut.type = 'button';
  zoomOut.setAttribute('aria-label', '지도 축소');
  append(zoomControls, zoomIn, zoomOut);

  const attribution = make('div', 'footprint-attribution');
  const attributionLink = document.createElement('a');
  attributionLink.href = 'https://www.openstreetmap.org/copyright';
  attributionLink.target = '_blank';
  attributionLink.rel = 'noopener noreferrer';
  attributionLink.textContent = '© OpenStreetMap contributors';
  attribution.appendChild(attributionLink);

  append(mapWrap, map, zoomControls, attribution);

  const missing = make('p', 'footprint-missing');
  missing.id = 'footprint_missing';
  missing.hidden = true;

  const detail = make('section', 'footprint-detail');
  detail.id = 'footprint_detail';
  detail.setAttribute('aria-live', 'polite');

  append(body, status, mapWrap, missing, detail);
  append(dialog, head, body);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
}

function clampLatitude(latitude: number): number {
  return Math.max(-85.05112878, Math.min(85.05112878, latitude));
}

function project(latitude: number, longitude: number, zoom: number): WorldPoint {
  const scale = TILE_SIZE * 2 ** zoom;
  const lat = clampLatitude(latitude) * Math.PI / 180;
  const sin = Math.sin(lat);
  return {
    x: ((longitude + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

function fitZoom(
  points: readonly LocatedFootprintStation[],
  width: number,
  height: number,
): number {
  if (points.length <= 1) return SINGLE_PIN_ZOOM;
  const usableWidth = Math.max(120, width - 72);
  const usableHeight = Math.max(120, height - 72);

  for (let zoom = MAX_ZOOM; zoom >= MIN_ZOOM; zoom -= 1) {
    const projected = points.map((point) => project(point.latitude, point.longitude, zoom));
    const xs = projected.map((point) => point.x);
    const ys = projected.map((point) => point.y);
    if (
      Math.max(...xs) - Math.min(...xs) <= usableWidth
      && Math.max(...ys) - Math.min(...ys) <= usableHeight
    ) return zoom;
  }
  return MIN_ZOOM;
}

function averageStaticLocation(group: VisitFootprintStation): { latitude: number; longitude: number } | undefined {
  const locations = group.references
    .map((reference) => getStaticStationLocation(reference.lineId, reference.stationName))
    .filter((location): location is { latitude: number; longitude: number } => Boolean(location));
  if (!locations.length) return undefined;
  return {
    latitude: locations.reduce((sum, item) => sum + item.latitude, 0) / locations.length,
    longitude: locations.reduce((sum, item) => sum + item.longitude, 0) / locations.length,
  };
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
  private generation = 0;
  private located: LocatedFootprintStation[] = [];
  private groups: VisitFootprintStation[] = [];
  private missing: VisitFootprintStation[] = [];
  private selectedGroupId?: string;
  private zoom?: number;

  constructor(private readonly stationLocations: StationLocationService) {
    ensureFootprintModal();
    byId<HTMLButtonElement>('footprint_zoom_in').addEventListener('click', () => {
      if (!this.located.length) return;
      this.zoom = Math.min(MAX_ZOOM, (this.zoom ?? SINGLE_PIN_ZOOM) + 1);
      this.renderMap();
    });
    byId<HTMLButtonElement>('footprint_zoom_out').addEventListener('click', () => {
      if (!this.located.length) return;
      this.zoom = Math.max(MIN_ZOOM, (this.zoom ?? SINGLE_PIN_ZOOM) - 1);
      this.renderMap();
    });
    window.addEventListener('resize', () => {
      if (this.isOpen && this.located.length) this.renderMap();
    });
  }

  get isOpen(): boolean {
    return !byId<HTMLElement>('footprint_overlay').hidden;
  }

  async open(visits: readonly VisitRecord[]): Promise<void> {
    const generation = ++this.generation;
    this.groups = groupVisitsByPhysicalStation(visits);
    this.located = [];
    this.missing = [];
    this.zoom = undefined;
    this.selectedGroupId = this.groups[0]?.id;

    byId<HTMLElement>('footprint_summary').textContent =
      `방문 역 ${this.groups.length}곳 · 방문 기록 ${visits.length}개`;
    byId<HTMLElement>('footprint_map_status').textContent =
      this.groups.length ? `${this.groups.length}개 역 위치를 확인하는 중…` : '저장된 방문 기록이 없어요.';
    byId<HTMLElement>('footprint_missing').hidden = true;
    replaceContent(byId<HTMLElement>('footprint_map'), document.createDocumentFragment());
    replaceContent(byId<HTMLElement>('footprint_detail'), document.createDocumentFragment());
    byId<HTMLElement>('footprint_overlay').hidden = false;
    window.setTimeout(() => byId<HTMLElement>('footprint_dialog').focus(), 0);

    if (!this.groups.length) return;

    const pending: VisitFootprintStation[] = [];
    for (const group of this.groups) {
      const staticLocation = averageStaticLocation(group);
      if (staticLocation) {
        this.located.push({ group, ...staticLocation });
      } else {
        pending.push(group);
      }
    }

    if (this.located.length) {
      window.requestAnimationFrame(() => {
        if (generation === this.generation && this.isOpen) {
          this.renderMap();
          this.renderDetails();
        }
      });
    }

    let completed = 0;
    let cursor = 0;
    const worker = async () => {
      while (cursor < pending.length) {
        const index = cursor;
        cursor += 1;
        const group = pending[index];
        const visit = group.visits[0];
        const line = visit ? SUBWAY_LINE_BY_ID.get(visit.lineId) : undefined;
        if (!visit || !line) {
          this.missing.push(group);
          continue;
        }
        try {
          const location = await this.stationLocations.resolve(line, visit.stationName);
          if (generation !== this.generation) return;
          this.located.push({ group, latitude: location.latitude, longitude: location.longitude });
        } catch {
          if (generation !== this.generation) return;
          this.missing.push(group);
        } finally {
          completed += 1;
          if (generation === this.generation && this.isOpen) {
            byId<HTMLElement>('footprint_map_status').textContent =
              `역 위치 확인 중… ${completed}/${pending.length}`;
          }
        }
      }
    };

    const workerCount = Math.min(4, pending.length);
    await Promise.all(Array.from({ length: workerCount }, () => worker()));
    if (generation !== this.generation || !this.isOpen) return;

    this.located.sort((left, right) => (
      this.groups.indexOf(left.group) - this.groups.indexOf(right.group)
    ));
    this.zoom = undefined;
    this.renderMap();
    this.renderDetails();
    this.renderMissing();
    byId<HTMLElement>('footprint_map_status').textContent =
      this.missing.length
        ? `${this.located.length}곳 표시 · ${this.missing.length}곳 위치 확인 실패`
        : `${this.located.length}개 방문 역을 표시했어요.`;
  }

  close(): void {
    this.generation += 1;
    byId<HTMLElement>('footprint_overlay').hidden = true;
  }

  private renderMap(): void {
    const map = byId<HTMLElement>('footprint_map');
    const fragment = document.createDocumentFragment();
    if (!this.located.length) {
      fragment.appendChild(make('div', 'footprint-map-empty', '표시할 수 있는 방문 역 위치가 아직 없어요.'));
      replaceContent(map, fragment);
      return;
    }

    const width = map.clientWidth || 680;
    const height = map.clientHeight || 440;
    const zoom = this.zoom ?? fitZoom(this.located, width, height);
    this.zoom = zoom;

    const projected = this.located.map((point) => ({
      point,
      world: project(point.latitude, point.longitude, zoom),
    }));
    const xs = projected.map((item) => item.world.x);
    const ys = projected.map((item) => item.world.y);
    const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
    const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;
    const originX = centerX - width / 2;
    const originY = centerY - height / 2;

    const tileLayer = make('div', 'footprint-tile-layer');
    const tileStartX = Math.floor(originX / TILE_SIZE);
    const tileEndX = Math.floor((originX + width) / TILE_SIZE);
    const tileStartY = Math.floor(originY / TILE_SIZE);
    const tileEndY = Math.floor((originY + height) / TILE_SIZE);
    const tileCount = 2 ** zoom;

    for (let rawX = tileStartX; rawX <= tileEndX; rawX += 1) {
      for (let rawY = tileStartY; rawY <= tileEndY; rawY += 1) {
        if (rawY < 0 || rawY >= tileCount) continue;
        const tileX = ((rawX % tileCount) + tileCount) % tileCount;
        const image = document.createElement('img');
        image.className = 'footprint-tile';
        image.alt = '';
        image.draggable = false;
        image.loading = 'eager';
        image.src = `https://tile.openstreetmap.org/${zoom}/${tileX}/${rawY}.png`;
        image.style.left = `${rawX * TILE_SIZE - originX}px`;
        image.style.top = `${rawY * TILE_SIZE - originY}px`;
        tileLayer.appendChild(image);
      }
    }

    const markerLayer = make('div', 'footprint-marker-layer');
    for (const item of projected) {
      const marker = make(
        'button',
        `footprint-pin${item.point.group.id === this.selectedGroupId ? ' selected' : ''}`,
      ) as HTMLButtonElement;
      marker.type = 'button';
      marker.style.left = `${item.world.x - originX}px`;
      marker.style.top = `${item.world.y - originY}px`;
      const firstLine = SUBWAY_LINE_BY_ID.get(item.point.group.visits[0]?.lineId ?? '');
      marker.style.setProperty('--pin-line', firstLine?.color ?? '#29483b');
      marker.style.setProperty('--pin-ink', readableInk(firstLine?.color ?? '#29483b'));
      marker.setAttribute(
        'aria-label',
        `${item.point.group.stationName}역, ${item.point.group.visits.length}회 방문`,
      );
      const core = make('span', 'footprint-pin-core', item.point.group.visits.length > 1
        ? String(item.point.group.visits.length)
        : '');
      marker.appendChild(core);
      marker.addEventListener('click', () => {
        this.selectedGroupId = item.point.group.id;
        this.renderMap();
        this.renderDetails();
      });
      markerLayer.appendChild(marker);
    }

    append(fragment, tileLayer, markerLayer);
    replaceContent(map, fragment);
  }

  private renderDetails(): void {
    const detail = byId<HTMLElement>('footprint_detail');
    const group = this.groups.find((item) => item.id === this.selectedGroupId)
      ?? this.groups[0];
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
    const lineIds = Array.from(new Set(group.visits.map((visit) => visit.lineId)));
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

  private renderMissing(): void {
    const missing = byId<HTMLElement>('footprint_missing');
    if (!this.missing.length) {
      missing.hidden = true;
      missing.textContent = '';
      return;
    }
    const names = this.missing.slice(0, 4).map((group) => `${group.stationName}역`);
    const suffix = this.missing.length > names.length ? ` 외 ${this.missing.length - names.length}곳` : '';
    missing.textContent = `위치를 찾지 못해 지도에 표시하지 못한 역: ${names.join(', ')}${suffix}`;
    missing.hidden = false;
  }
}
