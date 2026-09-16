import { describe, expect, it } from 'vitest';
import { ALCOHOL_FOOD_IDS, isAlcoholFoodId } from '../src/data/food-category-features';
import { FOOD_CATEGORIES } from '../src/data/food-categories';
import {
  HISTORY_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  loadHistory,
  loadPreferences,
  saveHistory,
  savePreferences,
} from '../src/services/storage/app-persistence';
import type { StorageService } from '../src/services/storage/storage';

class MemoryStorage implements StorageService {
  values = new Map<string, unknown>();
  read<T>(key: string, fallback: T): T { return (this.values.has(key) ? this.values.get(key) : fallback) as T; }
  write<T>(key: string, value: T): void { this.values.set(key, value); }
  remove(key: string): void { this.values.delete(key); }
}

describe('stable web persistence compatibility', () => {
  it('loads and saves the existing v9 settings key shape', () => {
    const storage = new MemoryStorage();
    storage.values.set(SETTINGS_STORAGE_KEY, { selected: ['l2'], selected_foods: ['c_dimsum'], instant: true });

    const preferences = loadPreferences(storage);
    expect(preferences).toEqual({ selectedLineIds: ['l2'], selectedFoodIds: ['c_dimsum'], instantDraw: true });

    savePreferences(storage, preferences);
    expect(storage.values.get(SETTINGS_STORAGE_KEY)).toEqual({ selected: ['l2'], selected_foods: ['c_dimsum'], instant: true });
  });

  it('treats the previous 36-category full selection as all 42 categories after the alcohol expansion', () => {
    const storage = new MemoryStorage();
    const previousDefault = FOOD_CATEGORIES.filter((food) => !isAlcoholFoodId(food.id)).map((food) => food.id);
    expect(previousDefault).toHaveLength(36);
    storage.values.set(SETTINGS_STORAGE_KEY, { selected_foods: previousDefault });

    const preferences = loadPreferences(storage);
    expect(preferences.selectedFoodIds).toHaveLength(42);
    for (const id of ALCOHOL_FOOD_IDS) expect(preferences.selectedFoodIds).toContain(id);
  });

  it('does not inject alcohol into a deliberately narrowed saved food selection', () => {
    const storage = new MemoryStorage();
    storage.values.set(SETTINGS_STORAGE_KEY, { selected_foods: ['c_dimsum', 'w_pizza'] });
    expect(loadPreferences(storage).selectedFoodIds).toEqual(['c_dimsum', 'w_pizza']);
  });

  it('migrates the existing v9 history shape without changing its storage contract', () => {
    const storage = new MemoryStorage();
    storage.values.set(HISTORY_STORAGE_KEY, [{
      record_id: 'r1', line_id: 'l2', name: '시청', ordinal: 1, food_id: 'c_dimsum',
    }]);

    const history = loadHistory(storage);
    expect(history).toEqual([{ id: 'r1', lineId: 'l2', stationName: '시청', stationOrdinal: 1, foodId: 'c_dimsum' }]);

    saveHistory(storage, history);
    expect(storage.values.get(HISTORY_STORAGE_KEY)).toEqual([{
      record_id: 'r1', line_id: 'l2', name: '시청', ordinal: 1, food_id: 'c_dimsum',
    }]);
  });
});
