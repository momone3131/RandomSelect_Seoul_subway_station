import { describe, expect, it } from 'vitest';
import { FOOD_CATEGORIES } from '../src/data/food-categories';
import { SUBWAY_LINES } from '../src/data/subway-lines';

function unique<T>(items: readonly T[]): boolean {
  return new Set(items).size === items.length;
}

describe('static Random Seoul data', () => {
  it('preserves the 24-line and 36-food baseline', () => {
    expect(SUBWAY_LINES).toHaveLength(24);
    expect(FOOD_CATEGORIES).toHaveLength(36);
  });

  it('has unique ids and valid expanded station ordinals', () => {
    expect(unique(SUBWAY_LINES.map((line) => line.id))).toBe(true);
    expect(unique(FOOD_CATEGORIES.map((food) => food.id))).toBe(true);

    for (const line of SUBWAY_LINES) {
      expect(line.stations.length).toBeGreaterThan(0);
      expect(unique(line.stations.map((station) => station.name))).toBe(true);
      expect(line.stations.map((station) => station.ordinal)).toEqual(
        Array.from({ length: line.stations.length }, (_, index) => index + 1),
      );
    }
  });

  it('keeps a dedicated Google search query for every food category', () => {
    for (const food of FOOD_CATEGORIES) {
      expect(food.searchQuery?.trim()).toBeTruthy();
    }
  });
});
