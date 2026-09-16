import { describe, expect, it } from 'vitest';
import { ALCOHOL_FOOD_IDS, isAlcoholFoodId } from '../src/data/food-category-features';
import { FOOD_CATEGORIES } from '../src/data/food-categories';
import { SUBWAY_LINES } from '../src/data/subway-lines';

function unique<T>(items: readonly T[]): boolean {
  return new Set(items).size === items.length;
}

describe('static Random Seoul data', () => {
  it('preserves the 24-line baseline and expands food draws to 42 categories', () => {
    expect(SUBWAY_LINES).toHaveLength(24);
    expect(FOOD_CATEGORIES).toHaveLength(42);
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

  it('keeps exactly six alcohol-primary categories in a dedicated group', () => {
    expect(ALCOHOL_FOOD_IDS).toHaveLength(6);
    const alcoholFoods = FOOD_CATEGORIES.filter((food) => isAlcoholFoodId(food.id));
    expect(alcoholFoods).toHaveLength(6);
    expect(alcoholFoods.every((food) => food.group === '주류·바')).toBe(true);
    expect(alcoholFoods.map((food) => food.name)).toEqual([
      '이자카야',
      '와인바',
      '칵테일바',
      '수제맥주·펍',
      '전통주·막걸리주점',
      '위스키바',
    ]);
  });

  it('keeps a dedicated Google search query for every food category', () => {
    for (const food of FOOD_CATEGORIES) {
      expect(food.searchQuery?.trim()).toBeTruthy();
    }
  });
});
