import { isAlcoholFoodId } from '../../data/food-category-features';
import { FOOD_BY_ID, FOOD_CATEGORIES } from '../../data/food-categories';
import { SUBWAY_LINE_BY_ID, SUBWAY_LINES } from '../../data/subway-lines';
import type { DrawHistoryItem } from '../../domain/types';
import type { AppPreferences, AppState } from '../../state/app-state';
import type { StorageService } from './storage';

// Keep the stable Web keys during the refactor so users do not lose preferences/history.
export const SETTINGS_STORAGE_KEY = 'next_stop_subway_v1';
export const HISTORY_STORAGE_KEY = 'next_stop_history_v1';

interface LegacySettings {
  selected?: unknown;
  selected_foods?: unknown;
  instant?: unknown;
}

interface LegacyHistoryItem {
  record_id?: unknown;
  line_id?: unknown;
  name?: unknown;
  ordinal?: unknown;
  food_id?: unknown;
}

function validIds(value: unknown, allowed: ReadonlySet<string>, fallback: readonly string[]): string[] {
  if (!Array.isArray(value)) return [...fallback];
  const result: string[] = [];
  for (const raw of value) {
    if (typeof raw !== 'string' || !allowed.has(raw) || result.includes(raw)) continue;
    result.push(raw);
  }
  return result.length ? result : [...fallback];
}

function sameIds(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && right.every((id) => left.includes(id));
}

export function loadPreferences(storage: StorageService): AppPreferences {
  const saved = storage.read<LegacySettings>(SETTINGS_STORAGE_KEY, {});
  const allLineIds = SUBWAY_LINES.map((line) => line.id);
  const allFoodIds = FOOD_CATEGORIES.map((food) => food.id);
  const previousDefaultFoodIds = FOOD_CATEGORIES.filter((food) => !isAlcoholFoodId(food.id)).map((food) => food.id);
  const loadedFoodIds = validIds(saved.selected_foods, new Set(allFoodIds), allFoodIds);
  const selectedFoodIds = Array.isArray(saved.selected_foods) && sameIds(loadedFoodIds, previousDefaultFoodIds)
    ? allFoodIds
    : loadedFoodIds;

  return {
    selectedLineIds: validIds(saved.selected, new Set(allLineIds), allLineIds),
    selectedFoodIds,
    instantDraw: Boolean(saved.instant),
  };
}

export function savePreferences(storage: StorageService, preferences: AppPreferences): void {
  storage.write(SETTINGS_STORAGE_KEY, {
    selected: preferences.selectedLineIds,
    selected_foods: preferences.selectedFoodIds,
    instant: preferences.instantDraw,
  });
}

export function loadHistory(storage: StorageService): DrawHistoryItem[] {
  const saved = storage.read<unknown>(HISTORY_STORAGE_KEY, []);
  if (!Array.isArray(saved)) return [];

  const history: DrawHistoryItem[] = [];
  for (const raw of saved as LegacyHistoryItem[]) {
    if (
      typeof raw.record_id !== 'string'
      || typeof raw.line_id !== 'string'
      || typeof raw.name !== 'string'
      || typeof raw.ordinal !== 'number'
      || !Number.isInteger(raw.ordinal)
    ) continue;

    const line = SUBWAY_LINE_BY_ID.get(raw.line_id);
    if (!line) continue;
    const station = line.stations[raw.ordinal - 1];
    if (!station || station.name !== raw.name) continue;
    const foodId = typeof raw.food_id === 'string' && FOOD_BY_ID.has(raw.food_id) ? raw.food_id : undefined;

    history.push({
      id: raw.record_id,
      lineId: raw.line_id,
      stationName: raw.name,
      stationOrdinal: raw.ordinal,
      foodId,
    });
    if (history.length >= 12) break;
  }
  return history;
}

export function saveHistory(storage: StorageService, history: readonly DrawHistoryItem[]): void {
  storage.write(
    HISTORY_STORAGE_KEY,
    history.slice(0, 12).map((item) => ({
      record_id: item.id,
      line_id: item.lineId,
      name: item.stationName,
      ordinal: item.stationOrdinal,
      food_id: item.foodId ?? null,
    })),
  );
}

export function loadPersistedInitialState(storage: StorageService): AppState {
  return {
    preferences: loadPreferences(storage),
    attractions: [],
    recommendations: [],
    history: loadHistory(storage),
  };
}
