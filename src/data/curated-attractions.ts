import type { AttractionRecommendation } from '../domain/types';

interface AttractionGroup {
  stations: readonly string[];
  attractions: readonly AttractionRecommendation[];
}

function attraction(id: string, name: string, category: string, mapQuery = name, note?: string): AttractionRecommendation {
  return { id, name, category, mapQuery, note };
}

const GROUPS: readonly AttractionGroup[] = [
  {
    stations: ['l4:이촌', 'gc:이촌'],
    attractions: [
      attraction('national-museum-of-korea', '국립중앙박물관', '박물관'),
      attraction('yongsan-family-park', '용산가족공원', '공원'),
    ],
  },
  {
    stations: ['l3:경복궁'],
    attractions: [
      attraction('gyeongbokgung-palace', '경복궁', '궁궐'),
      attraction('national-palace-museum', '국립고궁박물관', '박물관'),
    ],
  },
  {
    stations: ['l3:안국'],
    attractions: [
      attraction('changdeokgung-palace', '창덕궁', '궁궐'),
      attraction('bukchon-hanok-village', '북촌한옥마을', '한옥마을'),
    ],
  },
  {
    stations: ['l5:광화문'],
    attractions: [
      attraction('gwanghwamun-square', '광화문광장', '광장'),
      attraction('gyeongbokgung-palace', '경복궁', '궁궐'),
    ],
  },
  {
    stations: ['l1:시청', 'l2:시청'],
    attractions: [
      attraction('deoksugung-palace', '덕수궁', '궁궐'),
      attraction('seoul-plaza', '서울광장', '광장'),
    ],
  },
  {
    stations: ['l1:종로3가', 'l3:종로3가', 'l5:종로3가'],
    attractions: [
      attraction('jongmyo-shrine', '종묘', '문화유산'),
      attraction('ikseondong-hanok-street', '익선동 한옥거리', '거리'),
    ],
  },
  {
    stations: ['l3:독립문'],
    attractions: [
      attraction('seodaemun-prison-history-hall', '서대문형무소역사관', '역사관'),
      attraction('dongnimmun-gate', '독립문', '문화유산'),
    ],
  },
  {
    stations: ['l2:동대문역사문화공원', 'l4:동대문역사문화공원', 'l5:동대문역사문화공원'],
    attractions: [attraction('ddp', '동대문디자인플라자 DDP', '문화공간', '동대문디자인플라자')],
  },
  {
    stations: ['l1:동대문', 'l4:동대문'],
    attractions: [attraction('heunginjimun-gate', '흥인지문', '문화유산')],
  },
  {
    stations: ['l4:혜화'],
    attractions: [
      attraction('daehakro', '대학로', '거리'),
      attraction('naksan-park', '낙산공원', '공원'),
    ],
  },
  {
    stations: ['l3:충무로', 'l4:충무로'],
    attractions: [attraction('namsangol-hanok-village', '남산골한옥마을', '한옥마을')],
  },
  {
    stations: ['l4:회현'],
    attractions: [attraction('namdaemun-market', '남대문시장', '전통시장')],
  },
  {
    stations: ['l1:서울역', 'l4:서울역', 'gc:서울역', 'ar:서울역', 'gtx:서울역'],
    attractions: [
      attraction('culture-station-seoul-284', '문화역서울284', '문화공간'),
      attraction('seoullo-7017', '서울로7017', '도심산책'),
    ],
  },
  {
    stations: ['l4:삼각지', 'l6:삼각지'],
    attractions: [attraction('war-memorial-of-korea', '전쟁기념관', '박물관')],
  },
  {
    stations: ['l6:한강진'],
    attractions: [attraction('leeum-museum', '리움미술관', '미술관')],
  },
  {
    stations: ['l6:효창공원앞', 'gc:효창공원앞'],
    attractions: [attraction('hyochang-park', '효창공원', '공원')],
  },
  {
    stations: ['l5:여의나루'],
    attractions: [attraction('yeouido-hangang-park', '여의도한강공원', '한강공원')],
  },
  {
    stations: ['l5:여의도', 'l9:여의도'],
    attractions: [attraction('yeouido-park', '여의도공원', '공원')],
  },
  {
    stations: ['l6:망원'],
    attractions: [
      attraction('mangwon-hangang-park', '망원한강공원', '한강공원'),
      attraction('mangwon-market', '망원시장', '전통시장'),
    ],
  },
  {
    stations: ['l6:월드컵경기장'],
    attractions: [
      attraction('world-cup-park', '월드컵공원', '공원'),
      attraction('haneul-park', '하늘공원', '공원'),
    ],
  },
  {
    stations: ['l9:선유도'],
    attractions: [attraction('seonyudo-park', '선유도공원', '공원')],
  },
  {
    stations: ['l9:노들'],
    attractions: [attraction('nodeul-island', '노들섬', '복합문화공간')],
  },
  {
    stations: ['l7:자양'],
    attractions: [attraction('ttukseom-hangang-park', '뚝섬한강공원', '한강공원')],
  },
  {
    stations: ['l5:광나루'],
    attractions: [attraction('gwangnaru-hangang-park', '광나루한강공원', '한강공원')],
  },
  {
    stations: ['l3:고속터미널', 'l7:고속터미널', 'l9:고속터미널', 'l9:신반포'],
    attractions: [
      attraction('banpo-hangang-park', '반포한강공원', '한강공원'),
      attraction('sebit-islands', '세빛섬', '복합문화공간'),
    ],
  },
  {
    stations: ['l2:잠실', 'l8:잠실'],
    attractions: [
      attraction('seokchon-lake', '석촌호수', '호수공원'),
      attraction('lotte-world-tower', '롯데월드타워', '랜드마크'),
    ],
  },
  {
    stations: ['l8:석촌', 'l9:석촌', 'l9:송파나루'],
    attractions: [attraction('seokchon-lake', '석촌호수', '호수공원')],
  },
  {
    stations: ['l8:몽촌토성', 'l9:한성백제', 'l5:올림픽공원', 'l9:올림픽공원'],
    attractions: [attraction('olympic-park', '올림픽공원', '공원')],
  },
  {
    stations: ['l9:마곡나루', 'ar:마곡나루'],
    attractions: [attraction('seoul-botanic-park', '서울식물원', '식물원')],
  },
  {
    stations: ['l7:어린이대공원'],
    attractions: [attraction('seoul-childrens-grand-park', '서울어린이대공원', '공원')],
  },
  {
    stations: ['l5:아차산'],
    attractions: [attraction('achasan-mountain', '아차산', '자연·산책')],
  },
  {
    stations: ['l4:대공원'],
    attractions: [attraction('seoul-grand-park', '서울대공원', '공원')],
  },
  {
    stations: ['l4:경마공원'],
    attractions: [attraction('letsrun-park-seoul', '렛츠런파크 서울', '테마공원')],
  },
  {
    stations: ['l3:정발산', 'l3:마두'],
    attractions: [attraction('ilsan-lake-park', '일산호수공원', '호수공원')],
  },
  {
    stations: ['l1:인천', 'l1:동인천'],
    attractions: [
      attraction('incheon-chinatown', '인천 차이나타운', '거리'),
      attraction('jayugongwon-park', '자유공원', '공원'),
    ],
  },
  {
    stations: ['ic1:센트럴파크', 'ic1:인천대입구'],
    attractions: [attraction('songdo-central-park', '송도 센트럴파크', '공원')],
  },
  {
    stations: ['ic2:인천대공원'],
    attractions: [attraction('incheon-grand-park', '인천대공원', '공원')],
  },
  {
    stations: ['sb:서울숲'],
    attractions: [attraction('seoul-forest', '서울숲', '공원')],
  },
  {
    stations: ['sl:관악산'],
    attractions: [attraction('gwanaksan-mountain', '관악산', '자연·산책')],
  },
  {
    stations: ['ev:전대·에버랜드'],
    attractions: [attraction('everland', '에버랜드', '테마파크')],
  },
  {
    stations: ['cc:김유정'],
    attractions: [attraction('kim-you-jeong-house-of-literature', '김유정문학촌', '문학·문화')],
  },
  {
    stations: ['l9:봉은사'],
    attractions: [
      attraction('bongeunsa-temple', '봉은사', '사찰'),
      attraction('coex', '코엑스', '복합문화공간'),
    ],
  },
  {
    stations: ['l2:삼성'],
    attractions: [
      attraction('coex', '코엑스', '복합문화공간'),
      attraction('bongeunsa-temple', '봉은사', '사찰'),
    ],
  },
  {
    stations: ['l4:명동'],
    attractions: [
      attraction('myeongdong-cathedral', '명동성당', '문화유산'),
      attraction('myeongdong-street', '명동거리', '거리'),
    ],
  },
];

const ATTRACTIONS_BY_STATION = new Map<string, readonly AttractionRecommendation[]>();
for (const group of GROUPS) {
  for (const station of group.stations) {
    ATTRACTIONS_BY_STATION.set(station, group.attractions.slice(0, 2));
  }
}

export function getCuratedAttractions(lineId: string, stationName: string): AttractionRecommendation[] {
  const attractions = ATTRACTIONS_BY_STATION.get(`${lineId}:${stationName}`) ?? [];
  return attractions.slice(0, 2).map((item) => ({ ...item }));
}
