import { describe, expect, it } from 'vitest';
import { getCuratedAttractions } from '../src/data/curated-attractions';

describe('curated attractions', () => {
  it('returns representative attractions for stations with a strong destination', () => {
    expect(getCuratedAttractions('l4', '이촌').map((item) => item.name)).toEqual([
      '국립중앙박물관',
      '용산가족공원',
    ]);
    expect(getCuratedAttractions('l5', '여의나루').map((item) => item.name)).toEqual([
      '여의도한강공원',
    ]);
  });

  it('does not force a recommendation for an uncurated station', () => {
    expect(getCuratedAttractions('l2', '강남')).toEqual([]);
  });

  it('never exposes more than two curated attractions', () => {
    expect(getCuratedAttractions('l2', '잠실')).toHaveLength(2);
    expect(getCuratedAttractions('l6', '월드컵경기장')).toHaveLength(2);
  });
});
