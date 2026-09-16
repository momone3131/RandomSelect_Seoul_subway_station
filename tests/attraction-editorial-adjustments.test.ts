import { describe, expect, it } from 'vitest';
import { getCuratedAttractions } from '../src/data/curated-attractions';

describe('attraction editorial adjustments', () => {
  it('treats Garosu-gil and Yongridan-gil as silver-tier destinations', () => {
    expect(getCuratedAttractions('l3', '신사').find((item) => item.id === 'garosu-gil')?.tier).toBe('silver');
    expect(getCuratedAttractions('l4', '신용산').find((item) => item.id === 'yongridan-gil')?.tier).toBe('silver');
  });

  it('includes Yongridan-gil for Yongsan station alongside I-Park Mall', () => {
    for (const lineId of ['l1', 'gc']) {
      const items = getCuratedAttractions(lineId, '용산');
      expect(items.map((item) => item.id)).toEqual(['ipark-mall-yongsan', 'yongridan-gil']);
      expect(items[1]).toMatchObject({ tier: 'silver', mapQuery: '용리단길 서울 용산구 한강로2가' });
    }
  });
});
