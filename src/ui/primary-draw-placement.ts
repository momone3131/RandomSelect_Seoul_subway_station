import { byId } from './dom';

export type PrimaryDrawStage = 'line' | 'station' | 'food' | 'done';

const PANEL_BY_STAGE: Record<Exclude<PrimaryDrawStage, 'done'>, string> = {
  line: 'line_panel',
  station: 'station_panel',
  food: 'food_panel',
};

export function placePrimaryDrawButton(stage: PrimaryDrawStage): void {
  const drawButton = byId<HTMLButtonElement>('draw_btn');
  const panels = Object.values(PANEL_BY_STAGE).map((id) => byId<HTMLElement>(id));
  const actionZone = document.querySelector<HTMLElement>('.action-zone');
  if (!actionZone) throw new Error('Missing .action-zone.');

  for (const panel of panels) panel.classList.remove('next-draw');

  if (stage === 'done') {
    drawButton.classList.remove('integrated');
    if (drawButton.parentElement !== actionZone) actionZone.prepend(drawButton);
    return;
  }

  const panel = byId<HTMLElement>(PANEL_BY_STAGE[stage]);
  panel.classList.add('next-draw');
  drawButton.classList.add('integrated');
  if (drawButton.parentElement !== panel) panel.appendChild(drawButton);
}
