import { describe, expect, it } from 'vitest';
import { getCuratedAttractions } from '../src/data/curated-attractions';

describe('curated attractions', () => {
  it('returns representative Tier A attractions for strong destinations', () => {
    expect(getCuratedAttractions('l4', '이촌').map((item) => item.name)).toEqual([
      '국립중앙박물관',
      '용산가족공원',
    ]);
    expect(getCuratedAttractions('l5', '여의나루').map((item) => item.name)).toEqual([
      '여의도한강공원',
    ]);
  });

  it('includes worthwhile Tier B neighborhood destinations', () => {
    expect(getCuratedAttractions('l2', '문래').map((item) => item.name)).toEqual([
      '문래창작촌',
    ]);
    expect(getCuratedAttractions('l5', '장한평').map((item) => item.name)).toEqual([
      '서울새활용플라자',
    ]);
    expect(getCuratedAttractions('l7', '광명사거리').map((item) => item.name)).toEqual([
      '광명전통시장',
    ]);
  });

  it('does not force a recommendation for an uncurated station', () => {
    expect(getCuratedAttractions('l2', '아현')).toEqual([]);
  });

  it('never exposes more than two curated attractions', () => {
    expect(getCuratedAttractions('l2', '잠실')).toHaveLength(2);
    expect(getCuratedAttractions('l6', '월드컵경기장')).toHaveLength(2);
    expect(getCuratedAttractions('l4', '신용산')).toHaveLength(2);
  });
});
