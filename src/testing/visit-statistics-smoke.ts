import { SUBWAY_LINES } from '../data/subway-lines';
import type { VisitRecord } from '../domain/types';
import { prepareVisitStatisticsExport } from '../ui/visit-statistics-export';
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
  const saveImage = document.getElementById('save_visit_statistics_image') as HTMLButtonElement | null;
  const closeBounds = close.getBoundingClientRect();
  const saveBounds = saveImage?.getBoundingClientRect();
  if (!saveImage || !saveBounds
    || dialogBounds.width > window.innerWidth || dialogBounds.height > window.innerHeight
    || closeBounds.top < 0 || closeBounds.bottom > window.innerHeight
    || saveBounds.left < dialogBounds.left || saveBounds.right > dialogBounds.right
    || saveBounds.top < dialogBounds.top || saveBounds.bottom > dialogBounds.bottom
    || getComputedStyle(saveImage).display === 'none'
    || getComputedStyle(saveImage).visibility === 'hidden') {
    throw new Error('Statistics dialog controls escaped or were hidden from the viewport.');
  }

  const saveCenterX = saveBounds.left + saveBounds.width / 2;
  const saveCenterY = saveBounds.top + saveBounds.height / 2;
  const saveHit = document.elementFromPoint(saveCenterX, saveCenterY);
  if (saveHit !== saveImage && !saveImage.contains(saveHit)) {
    throw new Error('Statistics image save action is visually covered.');
  }

  const liveMetricGrid = dialog.querySelector<HTMLElement>('.visit-statistics-grid');
  const prepared = prepareVisitStatisticsExport(dialog);
  try {
    const cloneBounds = prepared.clone.getBoundingClientRect();
    const exportBody = prepared.clone.querySelector<HTMLElement>('#visit_statistics_body');
    const exportControls = prepared.clone.querySelector<HTMLElement>('.visit-statistics-export-exclude');
    const exportMetricGrid = prepared.clone.querySelector<HTMLElement>('.visit-statistics-grid');
    const exportTierGrid = prepared.clone.querySelector<HTMLElement>('.visit-statistics-tier-grid');
    const exportLines = prepared.clone.querySelector<HTMLElement>('.visit-statistics-lines');
    const columnCount = (element: HTMLElement | null): number =>
      element
        ? getComputedStyle(element).gridTemplateColumns.split(/\s+/).filter(Boolean).length
        : 0;

    if (!exportBody || !liveMetricGrid
      || cloneBounds.left < -1 || cloneBounds.top < -1
      || Math.abs(cloneBounds.width - 720) > 2
      || prepared.clone.querySelectorAll('.visit-statistics-line').length !== SUBWAY_LINES.length
      || !prepared.clone.textContent?.includes('방문 통계')
      || !prepared.clone.textContent?.includes('다이아몬드')
      || !prepared.clone.classList.contains('visit-statistics-export-compact')
      || getComputedStyle(prepared.clone).position !== 'static'
      || getComputedStyle(exportBody).overflowY !== 'visible'
      || exportBody.scrollHeight > exportBody.clientHeight + 2
      || columnCount(exportMetricGrid) !== 4
      || columnCount(exportTierGrid) !== 4
      || columnCount(exportLines) !== 2
      || columnCount(liveMetricGrid) !== 2
      || (exportControls && getComputedStyle(exportControls).display !== 'none')) {
      throw new Error(`Statistics compact export layout failed: width=${cloneBounds.width}, metric=${columnCount(exportMetricGrid)}, tier=${columnCount(exportTierGrid)}, lines=${columnCount(exportLines)}, live=${columnCount(liveMetricGrid)}, overflow=${exportBody ? getComputedStyle(exportBody).overflowY : 'missing'}, scroll=${exportBody?.scrollHeight}/${exportBody?.clientHeight}, position=${getComputedStyle(prepared.clone).position}, controls=${exportControls ? getComputedStyle(exportControls).display : 'missing'}.`);
    }
  } finally {
    prepared.cleanup();
  }

  if (document.querySelector('[data-statistics-export-host="true"]')
    || document.querySelector('[data-statistics-export-clone="true"]')) {
    throw new Error('Statistics export leaked its temporary DOM.');
  }

  saveImage.focus();
  saveImage.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
  if (document.activeElement?.tagName !== 'SUMMARY') throw new Error('Statistics focus trap failed.');
  dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  if (view.isOpen || (app?.inert ?? false) !== originallyInert || document.body.style.overflow !== originalOverflow) {
    throw new Error('Statistics Escape dismissal did not restore the app.');
  }
}
