import { SUBWAY_LINES } from '../data/subway-lines';
import type { VisitRecord } from '../domain/types';
import type { VisitStatisticsView } from '../ui/visit-statistics-view';

/** Browser-only checks inside the existing isolated ?selftest=1 CI run. No writes. */
export function runVisitStatisticsSmoke(view: VisitStatisticsView): void {
  const app = document.getElementById('app');
  const originallyInert = app?.inert ?? false;
  const originalOverflow = document.body.style.overflow;
  const trigger = document.getElementById('visit_statistics_btn');
  const mapTrigger = document.getElementById('footprint_map_btn');
  if (!trigger || trigger.parentElement !== mapTrigger?.parentElement) {
    throw new Error('Statistics and footprint buttons must share the main visit action row.');
  }
  view.open([]);
  if (!view.isOpen || document.querySelector('#visit_statistics_station_count')?.textContent !== '0') {
    throw new Error('Empty statistics did not render.');
  }
  view.close();

  const line = SUBWAY_LINES.find((item) => item.id === 'l4')!;
  const station = line.stations.find((item) => item.name === '총신대입구(이수)')!;
  const sample: VisitRecord = {
    id: 'statistics-smoke-only', lineId: line.id, stationName: station.name,
    stationOrdinal: station.ordinal, shownAttractions: [], attractions: [{ id: 'gyeongbokgung-palace', name: '경복궁' }],
    visitedAt: '2026-09-18', createdAt: 1,
  };
  view.open([sample, { ...sample, id: 'statistics-smoke-revisit', visitedAt: undefined }]);
  const dialog = document.getElementById('visit_statistics_dialog')!;
  if (document.getElementById('visit_statistics_station_count')?.textContent !== '1'
    || document.querySelectorAll('.visit-statistics-line').length !== SUBWAY_LINES.length
    || document.querySelectorAll('.visit-statistics-tier-card').length !== 4
    || !dialog.textContent?.includes('다이아몬드') || !dialog.textContent.includes('1곳')
    || !dialog.textContent?.includes('2회') || !dialog.textContent.includes('방문일 미입력 1건')
    || !app?.inert) {
    throw new Error('Visit statistics count, line rows, date or modal isolation failed.');
  }
  const dialogBounds = dialog.getBoundingClientRect();
  const close = document.getElementById('close_visit_statistics')!;
  const closeBounds = close.getBoundingClientRect();
  if (dialogBounds.width > window.innerWidth || dialogBounds.height > window.innerHeight
    || closeBounds.top < 0 || closeBounds.bottom > window.innerHeight) {
    throw new Error('Statistics dialog or close control escaped the viewport.');
  }
  close.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
  if (document.activeElement?.tagName !== 'SUMMARY') throw new Error('Statistics focus trap failed.');
  dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  if (view.isOpen || (app?.inert ?? false) !== originallyInert || document.body.style.overflow !== originalOverflow) {
    throw new Error('Statistics Escape dismissal did not restore the app.');
  }
}
