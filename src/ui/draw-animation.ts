import { FOOD_BY_ID } from '../data/food-categories';
import { SUBWAY_LINE_BY_ID } from '../data/subway-lines';
import type { AppState } from '../state/app-state';
import type { FoodCategory, SubwayLine, SubwayStation } from '../domain/types';
import { readableInk } from './color';
import { byId } from './dom';

export type AnimatedDrawStage = 'line' | 'station' | 'food';

export interface DrawAnimationOptions {
  instant?: boolean;
  random?: () => number;
  durationMs?: number;
}

function prefersReducedMotion(): boolean {
  try {
    return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  } catch {
    return false;
  }
}

function randomItem<T>(items: readonly T[], random: () => number): T | undefined {
  if (!items.length) return undefined;
  const value = random();
  const normalized = Number.isFinite(value) && value >= 0 && value < 1 ? value : Math.random();
  return items[Math.floor(normalized * items.length)];
}

function previewLine(line: SubwayLine): void {
  const badge = byId<HTMLElement>('line_badge');
  badge.textContent = line.badge;
  badge.className = `line-badge${line.badge.length > 1 ? ' wide' : ''}`;
  badge.style.setProperty('--line', line.color);
  badge.style.setProperty('--line-ink', readableInk(line.color));
  const title = byId<HTMLElement>('line_title');
  title.textContent = line.name;
  title.className = `line-title${line.name.length > 5 ? ' long' : ''}`;
  byId<HTMLElement>('line_meta').textContent = `수록 ${line.stations.length}개 역 · 1~${line.stations.length}번째`;
}

function previewStation(station: SubwayStation): void {
  const number = byId<HTMLElement>('ordinal_number');
  number.textContent = String(station.ordinal);
  number.className = `ordinal-number${station.ordinal >= 100 ? ' three-digits' : ''}`;
  const name = byId<HTMLElement>('station_name');
  name.textContent = station.name;
  name.className = `station-name${station.name.length > 7 ? ' long' : ''}`;
  byId<HTMLElement>('station_context').textContent = `${station.segmentLabel} · 구간 내 ${station.localIndex}번째`;
}

function previewFood(food: FoodCategory): void {
  byId<HTMLElement>('food_emoji').textContent = food.emoji;
  byId<HTMLElement>('food_group').textContent = food.group;
  const name = byId<HTMLElement>('food_name');
  name.textContent = food.name;
  name.className = `food-name${food.name.length > 8 ? ' long' : ''}`;
  byId<HTMLElement>('food_examples').textContent = `예: ${food.examples}`;
}

function panelFor(stage: AnimatedDrawStage): HTMLElement {
  return byId<HTMLElement>(stage === 'line' ? 'line_panel' : stage === 'station' ? 'station_panel' : 'food_panel');
}

function candidatesFor(stage: AnimatedDrawStage, state: Readonly<AppState>): readonly (SubwayLine | SubwayStation | FoodCategory)[] {
  if (stage === 'line') {
    return state.preferences.selectedLineIds
      .map((id) => SUBWAY_LINE_BY_ID.get(id))
      .filter((line): line is SubwayLine => Boolean(line));
  }
  if (stage === 'station') return state.currentLine?.stations ?? [];
  return state.preferences.selectedFoodIds
    .map((id) => FOOD_BY_ID.get(id))
    .filter((food): food is FoodCategory => Boolean(food));
}

function showPreview(stage: AnimatedDrawStage, candidate: SubwayLine | SubwayStation | FoodCategory): void {
  if (stage === 'line') previewLine(candidate as SubwayLine);
  else if (stage === 'station') previewStation(candidate as SubwayStation);
  else previewFood(candidate as FoodCategory);
}

export async function animateDrawStage(
  stage: AnimatedDrawStage,
  state: Readonly<AppState>,
  options: DrawAnimationOptions = {},
): Promise<void> {
  const instant = options.instant ?? state.preferences.instantDraw;
  if (instant || prefersReducedMotion()) return;

  const candidates = candidatesFor(stage, state);
  if (!candidates.length) return;
  const random = options.random ?? Math.random;
  const duration = options.durationMs ?? 900;
  const panel = panelFor(stage);
  const helper = byId<HTMLElement>('helper');
  panel.classList.add('rolling');
  helper.textContent = stage === 'line'
    ? '오늘은 어떤 노선이 기다리고 있을까요?'
    : stage === 'station'
      ? `${state.currentLine?.name ?? ''}의 역 중에서 뽑고 있어요.`
      : '오늘의 한 끼를 골라보는 중이에요.';

  const start = Date.now();
  try {
    await new Promise<void>((resolve) => {
      const tick = () => {
        const elapsed = Date.now() - start;
        if (elapsed >= duration) {
          resolve();
          return;
        }
        const candidate = randomItem(candidates, random);
        if (candidate) showPreview(stage, candidate);
        window.setTimeout(tick, 65 + Math.floor(elapsed * 0.11));
      };
      window.setTimeout(tick, 25);
    });
  } finally {
    panel.classList.remove('rolling');
  }
}

export function revealDrawStage(stage: AnimatedDrawStage): void {
  if (prefersReducedMotion()) return;

  // Run after the final render so the chosen card gets an unmistakable payoff.
  window.requestAnimationFrame(() => {
    const panel = panelFor(stage);
    panel.getAnimations().forEach((animation) => animation.cancel());
    panel.animate(
      [
        {
          transform: 'translateY(0) scale(1)',
          filter: 'brightness(1)',
          boxShadow: '0 0 0 0 rgba(215,247,117,0)',
          offset: 0,
        },
        {
          transform: 'translateY(-10px) scale(1.075)',
          filter: 'brightness(1.07)',
          boxShadow: '0 10px 18px rgba(32,59,47,.18), 0 0 0 8px #d7f775',
          offset: 0.30,
        },
        {
          transform: 'translateY(3px) scale(.985)',
          filter: 'brightness(1.02)',
          boxShadow: '0 3px 7px rgba(32,59,47,.12), 0 0 0 3px rgba(215,247,117,.72)',
          offset: 0.68,
        },
        {
          transform: 'translateY(-2px) scale(1.018)',
          filter: 'brightness(1.03)',
          boxShadow: '0 4px 9px rgba(32,59,47,.10), 0 0 0 2px rgba(215,247,117,.4)',
          offset: 0.84,
        },
        {
          transform: 'translateY(0) scale(1)',
          filter: 'brightness(1)',
          boxShadow: '0 0 0 0 rgba(215,247,117,0)',
          offset: 1,
        },
      ],
      {
        duration: 520,
        easing: 'cubic-bezier(.16,.84,.22,1)',
      },
    );
  });
}
