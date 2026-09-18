import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const historyView = readFileSync(new URL('../src/ui/history-view.ts', import.meta.url), 'utf8');
const visitView = readFileSync(new URL('../src/ui/visit-view.ts', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');

describe('durable visit history hub contract', () => {
  it('allows initial registration from recent history but routes later management to footprints', () => {
    expect(historyView).toContain("existingVisit ? '발자취에 등록됨' : '다녀왔어요'");
    expect(historyView).toContain('visitButton.disabled = true');
    expect(historyView).not.toContain("existingVisit ? '방문 기록 수정'");
  });

  it('does not render durable visit cards on the main screen', () => {
    expect(visitView).toContain("'발자취 노선도 보기'");
    expect(visitView).toContain('section.hidden = visits.length === 0');
    expect(visitView).not.toContain("const card = make('div', 'history-item visit-item')");
    expect(visitView).not.toContain("'visit_list'");
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
