import { SUBWAY_LINES } from '../data/subway-lines';
import type { VisitRecord } from '../domain/types';
import type { VisitStatisticsView } from '../ui/visit-statistics-view';

async function assertPngHasVisibleContent(blob: Blob): Promise<void> {
  if (blob.type !== 'image/png' || blob.size < 1_000) {
    throw new Error('Statistics export did not produce a valid PNG.');
  }

  const bitmap = await createImageBitmap(blob);
  try {
    if (bitmap.width < 200 || bitmap.height < 500) {
      throw new Error(`Statistics PNG dimensions are implausible: ${bitmap.width}×${bitmap.height}.`);
    }

    const sampleWidth = Math.min(160, bitmap.width);
    const sampleHeight = Math.min(640, Math.max(320, Math.round(bitmap.height * sampleWidth / bitmap.width)));
    const canvas = document.createElement('canvas');
    canvas.width = sampleWidth;
    canvas.height = sampleHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Statistics PNG smoke could not create a 2D canvas.');

    context.drawImage(bitmap, 0, 0, sampleWidth, sampleHeight);
    const pixels = context.getImageData(0, 0, sampleWidth, sampleHeight).data;
    const background = [pixels[0], pixels[1], pixels[2]];
    let distinct = 0;
    const total = sampleWidth * sampleHeight;

    for (let i = 0; i < pixels.length; i += 4) {
      const delta = Math.abs(pixels[i] - background[0])
        + Math.abs(pixels[i + 1] - background[1])
        + Math.abs(pixels[i + 2] - background[2]);
      if (delta > 24) distinct += 1;
    }

    if (distinct / total < 0.02) {
      throw new Error('Statistics PNG is effectively blank.');
    }
  } finally {
    bitmap.close();
  }
}

/** Browser-only checks inside the existing isolated ?selftest=1 CI run. No writes. */
export async function runVisitStatisticsSmoke(view: VisitStatisticsView): Promise<void> {
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

  const exported = await view.createImageBlob();
  await assertPngHasVisibleContent(exported);
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
