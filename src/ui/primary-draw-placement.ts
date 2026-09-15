import { byId } from './dom';

export type PrimaryDrawStage = 'line' | 'station' | 'food' | 'done';

const PANEL_BY_STAGE: Record<Exclude<PrimaryDrawStage, 'done'>, string> = {
  line: 'line_panel',
  station: 'station_panel',
  food: 'food_panel',
};

const pressFeedbackBound = new WeakSet<HTMLButtonElement>();
let pressedPanel: HTMLElement | undefined;
let pressAnimation: Animation | undefined;

function releasePressedPanel(): void {
  if (!pressedPanel) return;
  const panel = pressedPanel;
  pressAnimation?.cancel();
  pressAnimation = undefined;
  pressedPanel = undefined;

  const release = panel.animate(
    [
      { transform: 'translateY(3px) scale(.985)', boxShadow: '0 1px 0 #8ea055' },
      { transform: 'translateY(-1px) scale(1)', boxShadow: '0 4px 0 #98aa5f' },
    ],
    { duration: 110, easing: 'cubic-bezier(.2,.8,.2,1)' },
  );
  release.addEventListener('finish', () => release.cancel(), { once: true });
}

function bindPressFeedback(drawButton: HTMLButtonElement): void {
  if (pressFeedbackBound.has(drawButton)) return;
  pressFeedbackBound.add(drawButton);

  drawButton.addEventListener('pointerdown', () => {
    const panel = drawButton.parentElement;
    if (!(panel instanceof HTMLElement) || !panel.classList.contains('next-draw')) return;

    releasePressedPanel();
    pressedPanel = panel;
    pressAnimation = panel.animate(
      [
        { transform: 'translateY(-1px) scale(1)', boxShadow: '0 4px 0 #98aa5f' },
        { transform: 'translateY(3px) scale(.985)', boxShadow: '0 1px 0 #8ea055' },
      ],
      { duration: 75, easing: 'ease-out', fill: 'forwards' },
    );
  });

  drawButton.addEventListener('pointerup', releasePressedPanel);
  drawButton.addEventListener('pointercancel', releasePressedPanel);
  drawButton.addEventListener('lostpointercapture', releasePressedPanel);
  drawButton.addEventListener('blur', releasePressedPanel);
}

export function placePrimaryDrawButton(stage: PrimaryDrawStage): void {
  const drawButton = byId<HTMLButtonElement>('draw_btn');
  bindPressFeedback(drawButton);

  const panels = Object.values(PANEL_BY_STAGE).map((id) => byId<HTMLElement>(id));
  const actionZone = document.querySelector<HTMLElement>('.action-zone');
  if (!actionZone) throw new Error('Missing .action-zone.');

  for (const panel of panels) panel.classList.remove('next-draw');

  if (stage === 'done') {
    releasePressedPanel();
    drawButton.classList.remove('integrated');
    if (drawButton.parentElement !== actionZone) actionZone.prepend(drawButton);
    return;
  }

  const panel = byId<HTMLElement>(PANEL_BY_STAGE[stage]);
  panel.classList.add('next-draw');
  drawButton.classList.add('integrated');
  if (drawButton.parentElement !== panel) panel.appendChild(drawButton);
}
