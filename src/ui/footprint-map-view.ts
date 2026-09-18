import { getFootprintMapAnchor, FOOTPRINT_MAP_VIEWBOX } from '../data/footprint-map-anchors';
import { FOOD_BY_ID } from '../data/food-categories';
import { SUBWAY_LINE_BY_ID } from '../data/subway-lines';
import { groupVisitsByPhysicalStation, type VisitFootprintStation } from '../domain/visit-footprint';
import type { VisitRecord } from '../domain/types';
import { readableInk } from './color';
import { append, byId, make, replaceContent } from './dom';

interface PointerPoint {
  x: number;
  y: number;
}

const REFERENCE_MAP_URL = './footprint-seoul-subway-reference.svg';
const ZOOM_FACTOR = 1.35;
const MAX_FIT_MULTIPLIER = 9;

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
  const summary = make('p', 'footprint-summary', '수도권 전체 노선도에서 다녀온 역을 채워갑니다.');
  summary.id = 'footprint_summary';
  append(titleWrap, title, summary);

  const close = make('button', 'close-btn', '×') as HTMLButtonElement;
  close.id = 'close_footprint';
  close.type = 'button';
  close.setAttribute('aria-label', '발자취 노선도 닫기');
  append(head, titleWrap, close);

  const body = make('div', 'footprint-body');
  const status = make('div', 'footprint-map-status', '드래그해서 이동 · 확대해서 역 이름 확인');
  status.id = 'footprint_map_status';

  const mapWrap = make('div', 'footprint-map-wrap');
  const viewport = make('div', 'footprint-map-viewport');
  viewport.id = 'footprint_map';
  viewport.setAttribute('role', 'region');
  viewport.setAttribute('aria-label', '방문 역 수도권 전체 지하철 노선도');

  const stage = make('div', 'footprint-reference-stage');
  stage.id = 'footprint_reference_stage';
  const referenceImage = document.createElement('img');
  referenceImage.className = 'footprint-reference-image';
  referenceImage.src = REFERENCE_MAP_URL;
  referenceImage.alt = '';
  referenceImage.draggable = false;
  stage.appendChild(referenceImage);

  const extensionLayer = make('div', 'footprint-extension-layer');
  extensionLayer.id = 'footprint_extension_layer';
  stage.appendChild(extensionLayer);

  const markerLayer = make('div', 'footprint-marker-layer');
  markerLayer.id = 'footprint_marker_layer';
  stage.appendChild(markerLayer);
  viewport.appendChild(stage);

  const controls = make('div', 'footprint-zoom-controls');
  const zoomIn = make('button', '', '+') as HTMLButtonElement;
  zoomIn.id = 'footprint_zoom_in';
  zoomIn.type = 'button';
  zoomIn.setAttribute('aria-label', '노선도 확대');
  const zoomOut = make('button', '', '−') as HTMLButtonElement;
  zoomOut.id = 'footprint_zoom_out';
  zoomOut.type = 'button';
  zoomOut.setAttribute('aria-label', '노선도 축소');
  const fit = make('button', 'footprint-fit-btn', '전체') as HTMLButtonElement;
  fit.id = 'footprint_fit_all';
  fit.type = 'button';
  fit.setAttribute('aria-label', '전체 노선도 보기');
  append(controls, zoomIn, zoomOut, fit);

  const source = make('div', 'footprint-reference-source', 'Reference · Public domain subway diagram');
  append(mapWrap, viewport, controls, source);

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

function pointerPoint(event: PointerEvent, viewport: HTMLElement): PointerPoint {
  const rect = viewport.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function distance(left: PointerPoint, right: PointerPoint): number {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

function midpoint(left: PointerPoint, right: PointerPoint): PointerPoint {
  return { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 };
}

export class FootprintMapView {
  private groups: VisitFootprintStation[] = [];
  private selectedGroupId?: string;

  private scale = 1;
  private fitScale = 1;
  private panX = 0;
  private panY = 0;

  private readonly pointers = new Map<number, PointerPoint>();
  private lastSinglePointer?: PointerPoint;
  private pinchDistance?: number;
  private pinchCenter?: PointerPoint;

  constructor() {
    ensureFootprintModal();
    this.bindMapInteractions();

    byId<HTMLButtonElement>('footprint_zoom_in').addEventListener('click', () => {
      const viewport = byId<HTMLElement>('footprint_map');
      this.zoomAt(
        this.scale * ZOOM_FACTOR,
        { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 },
      );
    });
    byId<HTMLButtonElement>('footprint_zoom_out').addEventListener('click', () => {
      const viewport = byId<HTMLElement>('footprint_map');
      this.zoomAt(
        this.scale / ZOOM_FACTOR,
        { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 },
      );
    });
    byId<HTMLButtonElement>('footprint_fit_all').addEventListener('click', () => this.fitAll());

    window.addEventListener('resize', () => {
      if (!this.isOpen) return;
      this.fitAll();
    });
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
        ? '방문한 역이 노선도 위에 표시돼요 · 드래그/확대 가능'
        : '저장된 방문 기록이 없어요.';

    byId<HTMLElement>('footprint_overlay').hidden = false;
    this.renderMarkers();
    this.renderDetails();

    window.requestAnimationFrame(() => {
      this.fitAll();
      byId<HTMLElement>('footprint_dialog').focus();
    });
  }

  close(): void {
    this.pointers.clear();
    this.lastSinglePointer = undefined;
    this.pinchDistance = undefined;
    this.pinchCenter = undefined;
    byId<HTMLElement>('footprint_overlay').hidden = true;
  }

  private bindMapInteractions(): void {
    const viewport = byId<HTMLElement>('footprint_map');

    viewport.addEventListener('wheel', (event) => {
      event.preventDefault();
      const point = {
        x: event.clientX - viewport.getBoundingClientRect().left,
        y: event.clientY - viewport.getBoundingClientRect().top,
      };
      const factor = event.deltaY < 0 ? 1.16 : 1 / 1.16;
      this.zoomAt(this.scale * factor, point);
    }, { passive: false });

    viewport.addEventListener('pointerdown', (event) => {
      if ((event.target as Element | null)?.closest('.footprint-visit-marker')) return;
      viewport.setPointerCapture(event.pointerId);
      const point = pointerPoint(event, viewport);
      this.pointers.set(event.pointerId, point);

      if (this.pointers.size === 1) {
        this.lastSinglePointer = point;
        this.pinchDistance = undefined;
        this.pinchCenter = undefined;
      } else if (this.pointers.size === 2) {
        const [first, second] = Array.from(this.pointers.values());
        this.pinchDistance = distance(first, second);
        this.pinchCenter = midpoint(first, second);
        this.lastSinglePointer = undefined;
      }
    });

    viewport.addEventListener('pointermove', (event) => {
      if (!this.pointers.has(event.pointerId)) return;
      this.pointers.set(event.pointerId, pointerPoint(event, viewport));

      if (this.pointers.size === 1) {
        const current = this.pointers.values().next().value as PointerPoint | undefined;
        if (!current || !this.lastSinglePointer) {
          this.lastSinglePointer = current;
          return;
        }
        this.panX += current.x - this.lastSinglePointer.x;
        this.panY += current.y - this.lastSinglePointer.y;
        this.lastSinglePointer = current;
        this.applyTransform();
        return;
      }

      if (this.pointers.size === 2) {
        const [first, second] = Array.from(this.pointers.values());
        const nextDistance = distance(first, second);
        const nextCenter = midpoint(first, second);
        if (
          this.pinchDistance
          && this.pinchCenter
          && this.pinchDistance > 0
        ) {
          const logicalX = (this.pinchCenter.x - this.panX) / this.scale;
          const logicalY = (this.pinchCenter.y - this.panY) / this.scale;
          const nextScale = this.clampScale(this.scale * (nextDistance / this.pinchDistance));
          this.scale = nextScale;
          this.panX = nextCenter.x - logicalX * nextScale;
          this.panY = nextCenter.y - logicalY * nextScale;
          this.applyTransform();
        }
        this.pinchDistance = nextDistance;
        this.pinchCenter = nextCenter;
      }
    });

    const finishPointer = (event: PointerEvent) => {
      this.pointers.delete(event.pointerId);
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);

      if (this.pointers.size === 1) {
        this.lastSinglePointer = this.pointers.values().next().value as PointerPoint;
      } else {
        this.lastSinglePointer = undefined;
      }
      this.pinchDistance = undefined;
      this.pinchCenter = undefined;
      this.applyTransform();
    };

    viewport.addEventListener('pointerup', finishPointer);
    viewport.addEventListener('pointercancel', finishPointer);
  }

  private fitAll(): void {
    const viewport = byId<HTMLElement>('footprint_map');
    const width = Math.max(1, viewport.clientWidth);
    const height = Math.max(1, viewport.clientHeight);
    const padding = 12;
    this.fitScale = Math.min(
      (width - padding * 2) / FOOTPRINT_MAP_VIEWBOX.width,
      (height - padding * 2) / FOOTPRINT_MAP_VIEWBOX.height,
    );
    this.scale = this.fitScale;
    this.panX = (width - FOOTPRINT_MAP_VIEWBOX.width * this.scale) / 2;
    this.panY = (height - FOOTPRINT_MAP_VIEWBOX.height * this.scale) / 2;
    this.applyTransform();
  }

  private zoomAt(nextScale: number, point: PointerPoint): void {
    const clamped = this.clampScale(nextScale);
    const logicalX = (point.x - this.panX) / this.scale;
    const logicalY = (point.y - this.panY) / this.scale;
    this.scale = clamped;
    this.panX = point.x - logicalX * clamped;
    this.panY = point.y - logicalY * clamped;
    this.applyTransform();
  }

  private clampScale(value: number): number {
    const minScale = this.fitScale * 0.9;
    const maxScale = this.fitScale * MAX_FIT_MULTIPLIER;
    return Math.max(minScale, Math.min(maxScale, value));
  }

  private clampPan(): void {
    const viewport = byId<HTMLElement>('footprint_map');
    const width = Math.max(1, viewport.clientWidth);
    const height = Math.max(1, viewport.clientHeight);
    const stageWidth = FOOTPRINT_MAP_VIEWBOX.width * this.scale;
    const stageHeight = FOOTPRINT_MAP_VIEWBOX.height * this.scale;
    const margin = 36;

    if (stageWidth <= width) this.panX = (width - stageWidth) / 2;
    else this.panX = Math.min(margin, Math.max(width - stageWidth - margin, this.panX));

    if (stageHeight <= height) this.panY = (height - stageHeight) / 2;
    else this.panY = Math.min(margin, Math.max(height - stageHeight - margin, this.panY));
  }

  private applyTransform(): void {
    this.clampPan();
    const stage = byId<HTMLElement>('footprint_reference_stage');
    stage.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;

    const inverse = this.scale > 0 ? 1 / this.scale : 1;
    for (const marker of stage.querySelectorAll<HTMLElement>('.footprint-visit-marker')) {
      marker.style.setProperty('--marker-inverse-scale', String(inverse));
    }
  }

  private renderMarkers(): void {
    const markerLayer = byId<HTMLElement>('footprint_marker_layer');
    const extensionLayer = byId<HTMLElement>('footprint_extension_layer');
    const markerFragment = document.createDocumentFragment();
    const extensionFragment = document.createDocumentFragment();

    for (const group of this.groups) {
      const reference = group.references[0];
      if (!reference) continue;
      const anchor = getFootprintMapAnchor(reference.lineId, reference.stationName);
      if (!anchor) continue;

      const marker = make(
        'button',
        `footprint-visit-marker${group.id === this.selectedGroupId ? ' selected' : ''}`,
      ) as HTMLButtonElement;
      marker.type = 'button';
      marker.dataset.footprintKey = group.id;
      marker.style.left = `${anchor.x}px`;
      marker.style.top = `${anchor.y}px`;
      marker.setAttribute('aria-pressed', group.id === this.selectedGroupId ? 'true' : 'false');
      marker.setAttribute('aria-label', `${group.stationName}역, ${group.visits.length}회 방문`);
      marker.title = `${group.stationName}역 · ${group.visits.length}회 방문`;

      const core = make('span', 'footprint-visit-marker-core', '✓');
      marker.appendChild(core);
      if (group.visits.length > 1) {
        marker.appendChild(make('span', 'footprint-visit-count', String(group.visits.length)));
      }

      marker.addEventListener('click', (event) => {
        event.stopPropagation();
        this.selectedGroupId = group.id;
        this.updateMarkerSelection();
        this.renderDetails();
      });
      markerLayer.appendChild(marker);

      if (anchor.source === 'synthetic-terminal-extension') {
        const terminal = getFootprintMapAnchor('gj', '탑석');
        if (terminal) {
          const dx = anchor.x - terminal.x;
          const dy = anchor.y - terminal.y;
          const line = make('span', 'footprint-synthetic-extension');
          line.style.left = `${terminal.x}px`;
          line.style.top = `${terminal.y}px`;
          line.style.width = `${Math.hypot(dx, dy)}px`;
          line.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
          extensionFragment.appendChild(line);
          const label = make('span', 'footprint-synthetic-label', '차량기지 임시승강장');
          label.style.left = `${anchor.x + 18}px`;
          label.style.top = `${anchor.y - 10}px`;
          extensionFragment.appendChild(label);
        }
      }
    }

    replaceContent(markerLayer, markerFragment);
    replaceContent(extensionLayer, extensionFragment);
  }

  private updateMarkerSelection(): void {
    const markerLayer = byId<HTMLElement>('footprint_marker_layer');
    for (const marker of markerLayer.querySelectorAll<HTMLButtonElement>('[data-footprint-key]')) {
      const selected = marker.dataset.footprintKey === this.selectedGroupId;
      marker.classList.toggle('selected', selected);
      marker.setAttribute('aria-pressed', selected ? 'true' : 'false');
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
