// Orthogonal attraction features. Unlike prominence tiers, these can overlap any tier.
// Nightscape is intentionally strict: the place should be known for looking out over the city after dark,
// rather than merely being attractive or illuminated at night.
export const NIGHTSCAPE_ATTRACTION_IDS = [
  'n-seoul-tower',
  'naksan-park',
  'eungbongsan-palgakjeong',
  'dalmaji-bong-park',
  'maebongsan-palgakjeong',
  'yongyangbongjeojeong-park',
  'lotte-world-tower',
  'namhansanseong-west-gate-viewpoint',
] as const;

const NIGHTSCAPE_IDS = new Set<string>(NIGHTSCAPE_ATTRACTION_IDS);

export function isNightscapeAttraction(id: string): boolean {
  return NIGHTSCAPE_IDS.has(id);
}
