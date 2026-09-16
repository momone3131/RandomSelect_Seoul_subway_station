// Food-category feature flags that are independent from cuisine grouping.
// These IDs represent destinations where drinking is a primary purpose, not merely restaurants that also sell alcohol.
export const ALCOHOL_FOOD_IDS = [
  'b_izakaya',
  'b_wine',
  'b_cocktail',
  'b_craft_beer',
  'b_traditional',
  'b_whisky',
] as const;

const ALCOHOL_IDS = new Set<string>(ALCOHOL_FOOD_IDS);

export function isAlcoholFoodId(id: string): boolean {
  return ALCOHOL_IDS.has(id);
}
