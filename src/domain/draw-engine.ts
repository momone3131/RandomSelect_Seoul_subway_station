export type RandomSource = () => number;

export function randomIndex(length: number, random: RandomSource = Math.random): number {
  if (!Number.isInteger(length) || length < 1) {
    throw new RangeError('length must be a positive integer');
  }
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError('random source must return a finite value in [0, 1)');
  }
  return Math.floor(value * length);
}

export function drawOne<T>(items: readonly T[], random: RandomSource = Math.random): T {
  if (!items.length) {
    throw new RangeError('cannot draw from an empty list');
  }
  return items[randomIndex(items.length, random)] as T;
}
