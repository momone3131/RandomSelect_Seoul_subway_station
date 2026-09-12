import { describe, expect, it } from 'vitest';
import { drawOne, randomIndex } from '../src/domain/draw-engine';

describe('draw engine', () => {
  it('maps a deterministic random value to an index', () => {
    expect(randomIndex(4, () => 0)).toBe(0);
    expect(randomIndex(4, () => 0.2499)).toBe(0);
    expect(randomIndex(4, () => 0.25)).toBe(1);
    expect(randomIndex(4, () => 0.9999)).toBe(3);
  });

  it('draws from the supplied candidate list only', () => {
    expect(drawOne(['line1', 'line2', 'line3'], () => 0.5)).toBe('line2');
  });

  it('rejects empty draws and invalid random values', () => {
    expect(() => drawOne([], () => 0.5)).toThrow();
    expect(() => randomIndex(3, () => 1)).toThrow();
  });
});
