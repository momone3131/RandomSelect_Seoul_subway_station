import { isAlcoholFoodId } from '../../data/food-category-features';
import { FOOD_BY_ID, FOOD_CATEGORIES } from '../../data/food-categories';
import { SUBWAY_LINE_BY_ID, SUBWAY_LINES } from '../../data/subway-lines';
import type { AttractionSnapshot, DrawHistoryItem, VisitRecord } from '../../domain/types';
import type { AppPreferences, AppState } from '../../state/app-state';
import type { StorageService } from './storage';

// Keep the stable Web keys during the refactor so users do not lose preferences/history.
export const SETTINGS_STORAGE_KEY = 'next_stop_subway_v1';
export const HISTORY_STORAGE_KEY = 'next_stop_history_v1';
// Visit history is deliberately separate from draw history. Clearing the recent draw list must never remove visits.
export const VISITS_STORAGE_KEY = 'random_seoul_visits_v1';

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
  attractions?: unknown;
}

interface StoredVisitItem {
  record_id?: unknown;
  source_history_id?: unknown;
  line_id?: unknown;
  name?: unknown;
  ordinal?: unknown;
  drawn_food_id?: unknown;
  food_id?: unknown;
  shown_attractions?: unknown;
  attractions?: unknown;
  visited_at?: unknown;
  created_at?: unknown;
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

function validStation(lineId: unknown, stationName: unknown, ordinal: unknown) {
  if (
    typeof lineId !== 'string'
    || typeof stationName !== 'string'
    || typeof ordinal !== 'number'
    || !Number.isInteger(ordinal)
  ) return undefined;
  const line = SUBWAY_LINE_BY_ID.get(lineId);
  if (!line) return undefined;
  const station = line.stations[ordinal - 1];
  return station?.name === stationName ? station : undefined;
}

function attractionSnapshots(value: unknown): AttractionSnapshot[] {
  if (!Array.isArray(value)) return [];
  const result: AttractionSnapshot[] = [];
  const seen = new Set<string>();
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue;
    const id = (raw as { id?: unknown }).id;
    const name = (raw as { name?: unknown }).name;
    if (typeof id !== 'string' || typeof name !== 'string' || !id || !name || seen.has(id)) continue;
    seen.add(id);
    result.push({ id, name });
  }
  return result;
}

function validVisitDate(value: unknown): string | undefined {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  return value;
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
      || !validStation(raw.line_id, raw.name, raw.ordinal)
    ) continue;

    const foodId = typeof raw.food_id === 'string' && FOOD_BY_ID.has(raw.food_id) ? raw.food_id : undefined;
    const attractionOptions = attractionSnapshots(raw.attractions);

    history.push({
      id: raw.record_id,
      lineId: raw.line_id as string,
      stationName: raw.name as string,
      stationOrdinal: raw.ordinal as number,
      foodId,
      ...(attractionOptions.length ? { attractionOptions } : {}),
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
      ...(item.attractionOptions?.length ? { attractions: item.attractionOptions } : {}),
    })),
  );
}

export function loadVisits(storage: StorageService): VisitRecord[] {
  const saved = storage.read<unknown>(VISITS_STORAGE_KEY, []);
  if (!Array.isArray(saved)) return [];

  const visits: VisitRecord[] = [];
  const seenIds = new Set<string>();
  for (const raw of saved as StoredVisitItem[]) {
    if (
      typeof raw.record_id !== 'string'
      || seenIds.has(raw.record_id)
      || !validStation(raw.line_id, raw.name, raw.ordinal)
    ) continue;

    const drawnFoodId = typeof raw.drawn_food_id === 'string' && FOOD_BY_ID.has(raw.drawn_food_id)
      ? raw.drawn_food_id
      : undefined;
    const foodId = typeof raw.food_id === 'string' && FOOD_BY_ID.has(raw.food_id)
      && (!drawnFoodId || raw.food_id === drawnFoodId)
      ? raw.food_id
      : undefined;
    const shownAttractions = attractionSnapshots(raw.shown_attractions);
    const shownIds = new Set(shownAttractions.map((item) => item.id));
    const attractions = attractionSnapshots(raw.attractions)
      .filter((item) => shownIds.size === 0 || shownIds.has(item.id));
    const createdAt = typeof raw.created_at === 'number' && Number.isFinite(raw.created_at)
      ? raw.created_at
      : 0;

    seenIds.add(raw.record_id);
    visits.push({
      id: raw.record_id,
      ...(typeof raw.source_history_id === 'string' ? { sourceHistoryId: raw.source_history_id } : {}),
      lineId: raw.line_id as string,
      stationName: raw.name as string,
      stationOrdinal: raw.ordinal as number,
      drawnFoodId,
      foodId,
      shownAttractions,
      attractions,
      visitedAt: validVisitDate(raw.visited_at),
      createdAt,
    });
  }
  return visits;
}

export function saveVisits(storage: StorageService, visits: readonly VisitRecord[]): void {
  storage.write(
    VISITS_STORAGE_KEY,
    visits.map((item) => ({
      record_id: item.id,
      source_history_id: item.sourceHistoryId ?? null,
      line_id: item.lineId,
      name: item.stationName,
      ordinal: item.stationOrdinal,
      drawn_food_id: item.drawnFoodId ?? null,
      food_id: item.foodId ?? null,
      shown_attractions: item.shownAttractions,
      attractions: item.attractions,
      visited_at: item.visitedAt ?? null,
      created_at: item.createdAt,
    })),
  );
}

export function loadPersistedInitialState(storage: StorageService): AppState {
  return {
    preferences: loadPreferences(storage),
    attractions: [],
    recommendations: [],
    history: loadHistory(storage),
    visits: loadVisits(storage),
  };
}
