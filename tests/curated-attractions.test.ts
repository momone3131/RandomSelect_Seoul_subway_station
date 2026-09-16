import { describe, expect, it } from 'vitest';
import { isNightscapeAttraction, NIGHTSCAPE_ATTRACTION_IDS } from '../src/data/curated-attraction-features';
import { attractionTierForId } from '../src/data/curated-attraction-tiers';
import { getCuratedAttractions } from '../src/data/curated-attractions';
import { EXTRA_CURATED_STATION_KEYS } from '../src/data/curated-attractions-extra';
import { LOCAL_CURATED_STATION_KEYS } from '../src/data/curated-attractions-local';
import { NIGHT_VIEWPOINT_STATION_KEYS } from '../src/data/curated-attractions-night-viewpoints';
import { SUBWAY_LINES } from '../src/data/subway-lines';

describe('curated attractions', () => {
  it('returns representative strong attractions without changing established ordering', () => {
    expect(getCuratedAttractions('l4', '이촌').map((item) => item.name)).toEqual(['국립중앙박물관', '용산가족공원']);
    expect(getCuratedAttractions('l5', '여의나루').map((item) => item.name)).toEqual(['여의도한강공원']);
  });

  it('includes worthwhile neighborhood destinations', () => {
    expect(getCuratedAttractions('l2', '문래').map((item) => item.name)).toEqual(['문래창작촌']);
    expect(getCuratedAttractions('l5', '장한평').map((item) => item.name)).toEqual(['서울새활용플라자']);
    expect(getCuratedAttractions('l7', '광명사거리').map((item) => item.name)).toEqual(['광명전통시장']);
  });

  it('broadens coverage with commercial streets, markets and sizeable parks', () => {
    expect(getCuratedAttractions('l2', '아현').map((item) => item.name)).toEqual(['아현시장']);
    expect(getCuratedAttractions('l7', '사가정').map((item) => item.name)).toEqual(['용마폭포공원', '용마산 스카이워크']);
    expect(getCuratedAttractions('l8', '남한산성입구').map((item) => item.name)).toEqual(['남한산성', '남한산성 서문 전망대']);
    expect(getCuratedAttractions('ic1', '인천시청').map((item) => item.name)).toEqual(['인천중앙공원']);
    expect(getCuratedAttractions('sl', '보라매공원').map((item) => item.name)).toEqual(['보라매공원']);
    expect(LOCAL_CURATED_STATION_KEYS.length).toBeGreaterThan(60);
  });

  it('includes browse-worthy commercial and lifestyle destinations', () => {
    expect(getCuratedAttractions('l1', '광명').map((item) => item.name)).toEqual(['IKEA 광명', '롯데몰 광명']);
    expect(getCuratedAttractions('l1', '화서').map((item) => item.name)).toEqual(['스타필드 수원', '수원화성 서장대']);
    expect(getCuratedAttractions('l3', '삼송').map((item) => item.name)).toEqual(['스타필드 고양']);
    expect(getCuratedAttractions('l3', '원흥').map((item) => item.name)).toEqual(['IKEA 고양']);
    expect(getCuratedAttractions('ic1', '테크노파크').map((item) => item.name)).toEqual(['현대프리미엄아울렛 송도점', '트리플스트리트']);
  });

  it('assigns visual tiers while keeping the tier label out of attraction names', () => {
    expect(getCuratedAttractions('l3', '경복궁')[0]).toEqual(expect.objectContaining({ name: '경복궁', tier: 'diamond' }));
    expect(getCuratedAttractions('l2', '성수')[0]).toEqual(expect.objectContaining({ name: '성수 연무장길', tier: 'gold' }));
    expect(getCuratedAttractions('l3', '신사')[0]).toEqual(expect.objectContaining({ name: '가로수길', tier: 'silver' }));
    expect(getCuratedAttractions('l9', '중앙보훈병원')[0]).toEqual(expect.objectContaining({ name: '일자산 허브천문공원', tier: 'standard' }));
    expect(getCuratedAttractions('l2', '아현')[0]).toEqual(expect.objectContaining({ name: '아현시장', tier: 'standard' }));
    for (const line of SUBWAY_LINES) for (const station of line.stations) for (const attraction of getCuratedAttractions(line.id, station.name)) {
      expect(['diamond', 'gold', 'silver', 'standard']).toContain(attraction.tier);
      expect(attraction.name).not.toMatch(/^(다이아|금|은|골드|실버)\s/i);
    }
  });

  it('keeps the diamond jackpot tier exclusive to the chosen four', () => {
    for (const id of ['gyeongbokgung-palace','national-museum-of-korea','lotte-world-tower','bukchon-hanok-village']) expect(attractionTierForId(id)).toBe('diamond');
    expect(attractionTierForId('everland')).toBe('gold');
    expect(attractionTierForId('changdeokgung-palace')).toBe('gold');
  });

  it('locks the 2026 full-audit prominence boundary', () => {
    for (const id of ['seoul-forest','seokchon-lake','songdo-central-park','incheon-chinatown','incheon-open-port-street','imjingak-pyeonghwa-nuri','cheonggyecheon-stream','n-seoul-tower']) expect(attractionTierForId(id)).toBe('gold');
    for (const id of ['seodaemun-prison-history-hall','daehakro','dongmyo-flea-market','sindang-tteokbokki-town','bongeunsa-temple','ilsan-lake-park','donggureung-royal-tombs','incheon-grand-park','gangchon-recreation-area','bojeong-cafe-street','laveniche','gwacheon-national-science-museum','gocheok-sky-dome','seokchon-dong-tombs','seosomun-shrine-history-museum','eungbongsan-palgakjeong','namhansanseong-west-gate-viewpoint','suwon-hwaseong-seojangdae']) expect(attractionTierForId(id)).toBe('silver');
    for (const id of ['seoullo-7017','yangjae-citizens-forest','yongma-waterfall-park','yanghwa-hangang-park','iljasan-herb-astronomy-park','incheon-central-park','sampaehangang-park','eungye-lake-park','hwagyesa-temple','dongbaek-lake-park','lotte-dept-dongtan','dalmaji-bong-park','maebongsan-palgakjeong','yongwangsan-skywalk','samsung-haemaji-park','yongmasan-skywalk','yongyangbongjeojeong-park']) expect(attractionTierForId(id)).toBe('standard');
  });

  it('classifies nightscape as elevated city-view destinations independent from prominence tier', () => {
    expect(NIGHTSCAPE_ATTRACTION_IDS).toHaveLength(12);
    for (const id of ['n-seoul-tower','naksan-park','eungbongsan-palgakjeong','dalmaji-bong-park','maebongsan-palgakjeong','yongwangsan-skywalk','samsung-haemaji-park','yongmasan-skywalk','yongyangbongjeojeong-park','lotte-world-tower','namhansanseong-west-gate-viewpoint','suwon-hwaseong-seojangdae']) expect(isNightscapeAttraction(id)).toBe(true);
    for (const id of ['ddp','nodeul-island','banpo-hangang-park','sebit-islands','seokchon-lake','songdo-central-park','gwanggyo-lake-park','laveniche']) expect(isNightscapeAttraction(id)).toBe(false);
    expect(getCuratedAttractions('l2', '잠실')).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'lotte-world-tower', tier: 'diamond', nightscape: true }), expect.objectContaining({ id: 'seokchon-lake', tier: 'gold' })]));
    expect(getCuratedAttractions('l4', '혜화')).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'naksan-park', tier: 'silver', nightscape: true })]));
    expect(getCuratedAttractions('gc', '응봉')).toEqual([expect.objectContaining({ id: 'eungbongsan-palgakjeong', tier: 'silver', nightscape: true })]);
    expect(getCuratedAttractions('l6', '버티고개')).toEqual([expect.objectContaining({ id: 'maebongsan-palgakjeong', tier: 'standard', nightscape: true })]);
    expect(getCuratedAttractions('l9', '노들')).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'yongyangbongjeojeong-park', tier: 'standard', nightscape: true })]));
  });

  it('adds specific elevated night viewpoints without replacing stronger established attractions', () => {
    expect(getCuratedAttractions('l3', '충무로').map((item) => item.name)).toEqual(['남산골한옥마을', 'N서울타워']);
    expect(getCuratedAttractions('l3', '옥수').map((item) => item.name)).toEqual(['달맞이봉공원']);
    expect(getCuratedAttractions('l9', '신목동').map((item) => item.name)).toEqual(['용왕산 스카이워크']);
    expect(getCuratedAttractions('l7', '청담').map((item) => item.name)).toEqual(['청담 명품거리', '삼성해맞이공원']);
    expect(getCuratedAttractions('l8', '남한산성입구').map((item) => item.name)).toEqual(['남한산성', '남한산성 서문 전망대']);
    expect(getCuratedAttractions('l1', '화서')).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'suwon-hwaseong-seojangdae', tier: 'silver', nightscape: true })]));
  });

  it('uses an exact nearby anchor for broad or ambiguous attraction targets', () => {
    expect(getCuratedAttractions('ic2', '검암')).toEqual([expect.objectContaining({ name: '경인아라뱃길 시천가람터', mapQuery: '시천가람터 인천광역시 서구 시천동 158-11' })]);
    expect(getCuratedAttractions('l5', '오목교').map((item) => item.name)).toEqual(['현대백화점 목동점']);
  });

  it('can supplement an existing one-place station without exceeding two', () => {
    expect(getCuratedAttractions('l5', '여의도').map((item) => item.name)).toEqual(['여의도공원', '더현대 서울']);
    expect(getCuratedAttractions('l4', '대공원').map((item) => item.name)).toEqual(['서울대공원', '국립과천과학관']);
  });

  it('only references stations that exist in the draw dataset', () => {
    const stationKeys = new Set(SUBWAY_LINES.flatMap((line) => line.stations.map((station) => `${line.id}:${station.name}`)));
    expect(EXTRA_CURATED_STATION_KEYS.filter((key) => !stationKeys.has(key))).toEqual([]);
    expect(LOCAL_CURATED_STATION_KEYS.filter((key) => !stationKeys.has(key))).toEqual([]);
    expect(NIGHT_VIEWPOINT_STATION_KEYS.filter((key) => !stationKeys.has(key))).toEqual([]);
  });

  it('never stores a station-only target for an attraction', () => {
    for (const line of SUBWAY_LINES) for (const station of line.stations) for (const attraction of getCuratedAttractions(line.id, station.name)) {
      const target = (attraction.mapQuery ?? attraction.name).trim();
      expect(target).not.toBe(`${station.name}역`);
    }
  });

  it('still allows genuinely weak locations to remain uncurated', () => { expect(getCuratedAttractions('l1', '직산')).toEqual([]); });

  it('never exposes more than two curated attractions', () => {
    expect(getCuratedAttractions('l2', '잠실')).toHaveLength(2);
    expect(getCuratedAttractions('l6', '월드컵경기장')).toHaveLength(2);
    expect(getCuratedAttractions('l1', '광명')).toHaveLength(2);
    for (const line of SUBWAY_LINES) for (const station of line.stations) expect(getCuratedAttractions(line.id, station.name).length).toBeLessThanOrEqual(2);
  });
});
