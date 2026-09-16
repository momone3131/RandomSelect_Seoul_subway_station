import type { AttractionRecommendation } from '../domain/types';

type Spec = readonly [id: string, name: string, category: string, mapQuery?: string];

const makeAttraction = ([id, name, category, mapQuery]: Spec): AttractionRecommendation => ({
  id,
  name,
  category,
  mapQuery: mapQuery ?? name,
});

// Purpose-built night-view layer. These are viewpoints where looking over the city after dark
// is a primary reason to visit, not merely places that also happen to look nice at night.
const GROUPS: readonly { stations: readonly string[]; attractions: readonly Spec[] }[] = [
  {
    stations: ['l3:충무로', 'l4:충무로'],
    attractions: [
      ['n-seoul-tower', 'N서울타워', '랜드마크·전망', 'N서울타워 서울 용산구 남산공원길 105'],
    ],
  },
  {
    stations: ['gc:응봉'],
    attractions: [
      ['eungbongsan-palgakjeong', '응봉산 팔각정', '전망·야경', '응봉산 팔각정 서울 성동구 응봉동'],
    ],
  },
  {
    stations: ['l3:옥수', 'gc:옥수'],
    attractions: [
      ['dalmaji-bong-park', '달맞이봉공원', '전망·야경', '달맞이봉공원 서울 성동구 옥수동'],
    ],
  },
  {
    stations: ['l6:버티고개'],
    attractions: [
      ['maebongsan-palgakjeong', '매봉산 팔각정', '전망·야경', '매봉산공원 팔각정 서울 성동구 옥수동 428-6'],
    ],
  },
  {
    stations: ['l9:노들'],
    attractions: [
      ['yongyangbongjeojeong-park', '용양봉저정공원', '전망·야경', '용양봉저정공원 서울 동작구 본동 산3-9'],
    ],
  },
  {
    stations: ['l8:산성', 'l8:남한산성입구'],
    attractions: [
      ['namhansanseong-west-gate-viewpoint', '남한산성 서문 전망대', '성곽·전망', '남한산성 서문 경기도 광주시 남한산성면'],
    ],
  },
];

const BY_STATION = new Map<string, AttractionRecommendation[]>();
for (const group of GROUPS) {
  for (const station of group.stations) {
    BY_STATION.set(station, group.attractions.map(makeAttraction));
  }
}

export const NIGHT_VIEWPOINT_STATION_KEYS = Object.freeze([...BY_STATION.keys()]);

export function getNightViewpointAttractions(lineId: string, stationName: string): AttractionRecommendation[] {
  return (BY_STATION.get(`${lineId}:${stationName}`) ?? []).map((item) => ({ ...item }));
}
