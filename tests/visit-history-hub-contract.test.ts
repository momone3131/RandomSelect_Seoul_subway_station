import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const historyView = readFileSync(new URL('../src/ui/history-view.ts', import.meta.url), 'utf8');
const visitView = readFileSync(new URL('../src/ui/visit-view.ts', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
const drawView = readFileSync(new URL('../src/ui/draw-view.ts', import.meta.url), 'utf8');
const shell = readFileSync(new URL('../src/ui/shell.html', import.meta.url), 'utf8');

describe('durable visit history hub contract', () => {
  it('allows initial registration from recent history but routes later management to footprints', () => {
    expect(historyView).toContain("existingVisit ? '발자취에 등록됨' : '발자취 등록하기'");
    expect(historyView).toContain('visitButton.disabled = true');
    expect(historyView).not.toContain("existingVisit ? '방문 기록 수정'");
  });

  it('does not render a separate footprint module or durable visit cards on the main screen', () => {
    expect(visitView).toContain("'발자취 노선도'");
    expect(visitView).toContain("'방문 통계'");
    expect(visitView).not.toContain("'발자취 '");
    expect(visitView).not.toContain("'visit_count'");
    expect(visitView).not.toContain("'visit-hub'");
    expect(visitView).not.toContain("const card = make('div', 'history-item visit-item')");
    expect(visitView).not.toContain("'visit_list'");
  });

  it('places two quiet visit utilities directly below the station-list control', () => {
    expect(visitView).toContain("stationDetail.insertAdjacentElement('afterend', tools)");
    expect(visitView).toContain("mapButton.disabled = visits.length === 0");
    expect(visitView).toContain("statisticsButton.onclick = callbacks.onOpenStatistics");
  });

  it('uses a small hero registration action after course completion', () => {
    expect(shell).toContain('id="hero_visit_btn"');
    expect(shell).not.toContain('id="current_course_visit_btn"');
    expect(shell).not.toContain('id="done_actions"');
    expect(drawView).toContain("heroVisit.textContent = currentVisit ? '발자취' : '등록'");
    expect(main).toContain("byId<HTMLButtonElement>('hero_visit_btn').addEventListener('click'");
    expect(main).toContain('openVisitFromHistory(item)');
    expect(main).toContain('openFootprintMap()');
  });

  it('removes the instant-draw checkbox and keeps normal draw animation as the product behavior', () => {
    expect(shell).not.toContain('id="instant"');
    expect(shell).not.toContain('바로 뽑기');
    expect(main).not.toContain("setInstantDraw((event.currentTarget");
    expect(main).toContain('instant: selfTestMode');
  });

  it('tells new registrations where their durable record can be found', () => {
    expect(main).toContain('발자취 노선도에서 확인할 수 있어요.');
  });

  it('opens footprint management callbacks for edit/delete', () => {
    expect(main).toContain('onEdit: openVisitRecordFromFootprint');
    expect(main).toContain('onDelete: deleteVisitRecord');
    expect(main).toContain('returnToFootprintAfterVisitModal');
  });
});
