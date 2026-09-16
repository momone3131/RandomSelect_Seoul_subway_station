// Orthogonal attraction features. Unlike prominence tiers, these can overlap any tier.
// Keep nightscape conservative: only places where going after dark is itself a meaningful reason to visit.
export const NIGHTSCAPE_ATTRACTION_IDS = [
  'ddp',
  'naksan-park',
  'nodeul-island',
  'banpo-hangang-park',
  'sebit-islands',
  'seokchon-lake',
  'lotte-world-tower',
  'songdo-central-park',
  'gwanggyo-lake-park',
  'laveniche',
] as const;

const NIGHTSCAPE_IDS = new Set<string>(NIGHTSCAPE_ATTRACTION_IDS);

export function isNightscapeAttraction(id: string): boolean {
  return NIGHTSCAPE_IDS.has(id);
}
