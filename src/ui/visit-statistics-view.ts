import { buildVisitStatistics } from '../domain/visit-statistics';
import type { VisitRecord } from '../domain/types';
import { append, make } from './dom';
import { renderVisitStatisticsImage, saveVisitStatisticsImage } from './visit-statistics-export';
import './visit-statistics.css';

function percentageLabel(value: number): string {
  if (value > 0 && value < 0.1) return '<0.1%';
  return `${Math.floor(value * 10) / 10}%`;
}

function progress(value: number): HTMLElement {
  const track = make('div', 'visit-statistics-track');
  track.setAttribute('aria-hidden', 'true');
  const fill = make('span', 'visit-statistics-fill');
  fill.style.width = `${Math.min(100, Math.max(0, value))}%`;
  track.appendChild(fill);
  return track;
}

const TIER_LABELS = { diamond: '다이아몬드', gold: '골드', silver: '실버', standard: '스탠다드' } as const;

function metric(title: string, value: string, detail: string, date = false): HTMLElement {
  const card = make('div', `visit-statistics-card${date ? ' is-date' : ''}`);
  append(card, make('h3', '', title), make('strong', '', value), make('small', '', detail));
  return card;
}

export class VisitStatisticsView {
  private readonly overlay = make('div', 'modal-overlay');
  private readonly dialog = make('section', 'settings-modal');
  private readonly body = make('div');
  private readonly closeButton = make('button', 'close-btn', '×');
  private readonly saveButton = make('button', 'visit-statistics-save-btn visit-statistics-export-exclude', '이미지 저장');
  private returnFocus?: HTMLElement;
  private previousBodyOverflow = '';
  private appWasInert = false;

  constructor(
    private readonly onClose: () => void = () => undefined,
    private readonly onMessage: (message: string) => void = () => undefined,
  ) {
    this.overlay.id = 'visit_statistics_overlay';
    this.overlay.hidden = true;
    this.dialog.id = 'visit_statistics_dialog';
    this.dialog.tabIndex = -1;
    this.dialog.setAttribute('role', 'dialog');
    this.dialog.setAttribute('aria-modal', 'true');
    this.dialog.setAttribute('aria-labelledby', 'visit_statistics_title');
    const head = make('div', 'dialog-head');
    const title = make('h2', '', '방문 통계');
    title.id = 'visit_statistics_title';
    this.saveButton.id = 'save_visit_statistics_image';
    this.saveButton.type = 'button';
    this.saveButton.setAttribute('aria-label', '방문 통계 전체 이미지 저장');
    this.saveButton.addEventListener('click', () => { void this.saveImage(); });
    this.closeButton.id = 'close_visit_statistics';
    this.closeButton.type = 'button';
    this.closeButton.classList.add('visit-statistics-export-exclude');
    this.closeButton.setAttribute('aria-label', '방문 통계 닫기');
    this.closeButton.addEventListener('click', () => this.close());
    append(head, title, this.saveButton, this.closeButton);
    this.body.id = 'visit_statistics_body';
    this.body.tabIndex = 0;
    this.body.setAttribute('aria-label', '방문 통계 상세');
    append(this.dialog, head, this.body);
    this.overlay.appendChild(this.dialog);
    document.body.appendChild(this.overlay);
    this.overlay.addEventListener('click', (event) => {
      if (event.target === this.overlay) this.close();
    });
    this.overlay.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        this.close();
      } else if (event.key === 'Tab') {
        const controls = Array.from(this.dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), summary, [tabindex="0"]',
        ));
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === this.dialog)) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    });
  }

  get isOpen(): boolean {
    return !this.overlay.hidden;
  }

  async createImageBlob(): Promise<Blob> {
    if (!this.isOpen) throw new Error('방문 통계를 연 뒤 이미지를 저장할 수 있어요.');
    return renderVisitStatisticsImage(this.dialog);
  }

  private async saveImage(): Promise<void> {
    if (this.saveButton.disabled) return;
    const originalLabel = this.saveButton.textContent || '이미지 저장';
    this.saveButton.disabled = true;
    this.saveButton.textContent = '저장 중…';

    try {
      const blob = await this.createImageBlob();
      const result = await saveVisitStatisticsImage(blob);
      this.onMessage(
        result.target === 'native-gallery'
          ? '방문 통계 이미지를 사진에 저장했어요.'
          : '방문 통계 이미지를 저장했어요.',
      );
    } catch (error) {
      console.error(error);
      this.onMessage('방문 통계 이미지 저장에 실패했어요.');
    } finally {
      this.saveButton.disabled = false;
      this.saveButton.textContent = originalLabel;
    }
  }

  open(visits: readonly VisitRecord[]): void {
    if (!this.isOpen) {
      this.returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
      this.previousBodyOverflow = document.body.style.overflow;
      const app = document.getElementById('app');
      this.appWasInert = app?.inert ?? false;
      if (app) app.inert = true;
      document.body.style.overflow = 'hidden';
    }
    this.overlay.hidden = false;
    this.refresh(visits);
    this.body.scrollTop = 0;
    this.closeButton.focus({ preventScroll: true });
  }

  close(): void {
    if (!this.isOpen) return;
    this.overlay.hidden = true;
    document.body.style.overflow = this.previousBodyOverflow;
    const app = document.getElementById('app');
    if (app) app.inert = this.appWasInert;
    this.onClose();
    if (this.returnFocus?.isConnected) this.returnFocus.focus({ preventScroll: true });
    this.returnFocus = undefined;
  }

  refresh(visits: readonly VisitRecord[]): void {
    if (!this.isOpen) return;
    const stats = buildVisitStatistics(visits);
    const scrollTop = this.body.scrollTop;
    const rulesWereOpen = this.body.querySelector('details')?.open ?? false;
    const content = document.createDocumentFragment();
    if (!stats.totalVisits) {
      content.appendChild(make('p', 'visit-statistics-empty', '아직 방문 기록이 없어요. 최근 추첨 기록에서 다녀온 곳을 등록해보세요.'));
    }
    const hero = make('section', 'visit-statistics-hero');
    hero.setAttribute('aria-label', '전체 역 방문 진행도');
    const total = make('div', 'visit-statistics-total');
    const count = make('strong', '', String(stats.visitedStations));
    count.id = 'visit_statistics_station_count';
    append(total, count, make('span', '', `/ ${stats.totalStations}개 역`));
    const progressCopy = make('div', 'visit-statistics-progress-copy');
    append(progressCopy, make('span', '', '앱에 수록된 서울·수도권 역'), make('strong', '', percentageLabel(stats.percentage)));
    append(hero, make('div', 'visit-statistics-eyebrow', '내가 다녀온 역'), total, progressCopy, progress(stats.percentage));
    content.appendChild(hero);

    const metrics = make('div', 'visit-statistics-grid');
    const date = stats.latestVisitedAt ? stats.latestVisitedAt.replace(/-/g, '.') : '미입력';
    append(metrics,
      metric('총 방문 기록', `${stats.totalVisits}회`, '같은 역 재방문도 포함'),
      metric('최근 방문일', date, stats.undatedVisits ? `방문일 미입력 ${stats.undatedVisits}건` : '직접 기록한 방문일 기준', true),
      metric('먹어본 음식·주류', `${stats.foodCategories}종`, `직접 체크한 기록 ${stats.foodVisits}회`),
      metric('다녀온 명소', `${stats.attractions}곳`, `재방문 포함 ${stats.attractionVisits}회`),
    );
    content.appendChild(metrics);

    const tierTitle = make('h3', 'visit-statistics-tier-title', '방문 명소 등급');
    tierTitle.id = 'visit_statistics_tier_title';
    const tierGrid = make('div', 'visit-statistics-tier-grid');
    tierGrid.setAttribute('aria-labelledby', tierTitle.id);
    for (const tier of stats.attractionTiers) {
      const card = make('div', `visit-statistics-tier-card visit-statistics-tier-${tier.tier}`);
      card.dataset.tier = tier.tier;
      append(
        card,
        make('span', 'visit-statistics-tier-name', TIER_LABELS[tier.tier]),
        make('strong', '', `${tier.attractions}곳`),
        make('small', '', tier.visits === tier.attractions ? `방문 ${tier.visits}회` : `재방문 포함 ${tier.visits}회`),
      );
      tierGrid.appendChild(card);
    }
    append(content, tierTitle, tierGrid);

    const lineTitle = make('h3', 'visit-statistics-lines-title', '노선별 방문 진행도');
    lineTitle.id = 'visit_statistics_lines_title';
    const lines = make('ul', 'visit-statistics-lines');
    lines.setAttribute('aria-labelledby', lineTitle.id);
    for (const line of stats.lines) {
      const item = make('li', 'visit-statistics-line');
      item.dataset.lineId = line.lineId;
      item.style.setProperty('--visit-statistics-color', line.color);
      const head = make('div', 'visit-statistics-line-head');
      const label = make('span', 'visit-statistics-line-label');
      const dot = make('span', 'visit-statistics-line-dot');
      dot.setAttribute('aria-hidden', 'true');
      append(label, dot, make('span', '', line.name));
      const count = make('span', 'visit-statistics-line-count', `${line.visitedStations} / ${line.totalStations}역`);
      count.appendChild(make('small', '', percentageLabel(line.percentage)));
      append(head, label, count);
      append(item, head, progress(line.percentage));
      lines.appendChild(item);
    }
    append(content, lineTitle, lines);

    const rules = make('details', 'visit-statistics-rules');
    rules.open = rulesWereOpen;
    append(rules,
      make('summary', '', '집계 기준'),
      make('p', '', '전체 역 수는 환승역을 하나로 셉니다. 노선별 진행도에는 해당 환승역이 속한 각 노선에 방문이 반영되며, 열차 탑승 여부를 뜻하지 않습니다.'),
      make('p', '', '음식·주류와 명소는 실제로 다녀왔다고 체크한 것만 셉니다. 같은 종목·명소는 한 종류·한 곳으로 세고 재방문 횟수는 따로 표시합니다. 명소 등급도 실제 방문 체크된 명소의 현재 등급을 기준으로 집계합니다.'),
      make('p', '', '방문일을 비워둔 기록도 방문 수에 포함됩니다. 최근 방문일에는 입력한 날짜만 사용합니다. 추첨 범위 설정은 통계의 전체 역 수를 바꾸지 않습니다.'),
    );
    content.appendChild(rules);
    this.body.replaceChildren(content);
    this.body.scrollTop = scrollTop;
  }
}
