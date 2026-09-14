import { describe, expect, it } from 'vitest';
import { getCuratedAttractions } from '../src/data/curated-attractions';
import { EXTRA_CURATED_STATION_KEYS } from '../src/data/curated-attractions-extra';
import { SUBWAY_LINES } from '../src/data/subway-lines';

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

  it('includes worthwhile neighborhood destinations', () => {
    expect(getCuratedAttractions('l2', '문래').map((item) => item.name)).toEqual(['문래창작촌']);
    expect(getCuratedAttractions('l5', '장한평').map((item) => item.name)).toEqual(['서울새활용플라자']);
    expect(getCuratedAttractions('l7', '광명사거리').map((item) => item.name)).toEqual(['광명전통시장']);
  });

  it('includes browse-worthy commercial and lifestyle destinations', () => {
    expect(getCuratedAttractions('l1', '광명').map((item) => item.name)).toEqual(['IKEA 광명', '롯데몰 광명']);
    expect(getCuratedAttractions('l1', '화서').map((item) => item.name)).toEqual(['스타필드 수원']);
    expect(getCuratedAttractions('l3', '삼송').map((item) => item.name)).toEqual(['스타필드 고양']);
    expect(getCuratedAttractions('l3', '원흥').map((item) => item.name)).toEqual(['IKEA 고양']);
    expect(getCuratedAttractions('ic1', '테크노파크').map((item) => item.name)).toEqual([
      '현대프리미엄아울렛 송도점',
      '트리플스트리트',
    ]);
  });

  it('uses an exact nearby anchor for broad or ambiguous attraction targets', () => {
    expect(getCuratedAttractions('ic2', '검암')).toEqual([
      expect.objectContaining({
        name: '경인아라뱃길 시천가람터',
        mapQuery: '시천가람터 인천광역시 서구 시천동 158-11',
      }),
    ]);
    expect(getCuratedAttractions('l5', '오목교').map((item) => item.name)).toEqual([
      '현대백화점 목동점',
    ]);
  });

  it('can supplement an existing one-place station without exceeding two', () => {
    expect(getCuratedAttractions('l5', '여의도').map((item) => item.name)).toEqual([
      '여의도공원',
      '더현대 서울',
    ]);
    expect(getCuratedAttractions('l4', '대공원').map((item) => item.name)).toEqual([
      '서울대공원',
      '국립과천과학관',
    ]);
  });

  it('only references stations that exist in the draw dataset', () => {
    const stationKeys = new Set(
      SUBWAY_LINES.flatMap((line) => line.stations.map((station) => `${line.id}:${station.name}`)),
    );
    expect(EXTRA_CURATED_STATION_KEYS.filter((key) => !stationKeys.has(key))).toEqual([]);
  });

  it('never stores a station-only target for an attraction', () => {
    for (const line of SUBWAY_LINES) {
      for (const station of line.stations) {
        for (const attraction of getCuratedAttractions(line.id, station.name)) {
          const target = (attraction.mapQuery ?? attraction.name).trim();
          expect(target).not.toBe(`${station.name}역`);
        }
      }
    }
  });

  it('does not force a recommendation for an uncurated station', () => {
    expect(getCuratedAttractions('l2', '아현')).toEqual([]);
  });

  it('never exposes more than two curated attractions', () => {
    expect(getCuratedAttractions('l2', '잠실')).toHaveLength(2);
    expect(getCuratedAttractions('l6', '월드컵경기장')).toHaveLength(2);
    expect(getCuratedAttractions('l1', '광명')).toHaveLength(2);
  });
});
