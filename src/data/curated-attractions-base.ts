import type { AttractionRecommendation } from '../domain/types';

interface AttractionGroup {
  stations: readonly string[];
  attractions: readonly AttractionRecommendation[];
}

function attraction(id: string, name: string, category: string, mapQuery = name, note?: string): AttractionRecommendation {
  return { id, name, category, mapQuery, note };
}

// Curation policy: docs/ATTRACTION_CURATION.md
// Only Tier A/B destinations are listed. Never add a weak place merely to fill two slots.
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
    stations: ['l1:종각'],
    attractions: [
      attraction('bosingak-pavilion', '보신각', '문화유산'),
      attraction('cheonggyecheon-stream', '청계천', '도심산책'),
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
    stations: ['l1:종로5가'],
    attractions: [attraction('gwangjang-market', '광장시장', '전통시장')],
  },
  {
    stations: ['l2:을지로3가', 'l3:을지로3가'],
    attractions: [attraction('euljiro-nogari-alley', '을지로 노가리골목', '거리·상권')],
  },
  {
    stations: ['l1:제기동'],
    attractions: [
      attraction('seoul-yangnyeongsi', '서울약령시', '전통시장'),
      attraction('gyeongdong-market', '경동시장', '전통시장'),
    ],
  },
  {
    stations: ['l1:신설동', 'l2:신설동'],
    attractions: [attraction('seoul-folk-flea-market', '서울풍물시장', '전통시장')],
  },
  {
    stations: ['l1:동묘앞', 'l6:동묘앞'],
    attractions: [attraction('dongmyo-flea-market', '동묘벼룩시장', '시장·거리')],
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
    attractions: [
      attraction('heunginjimun-gate', '흥인지문', '문화유산'),
      attraction('dongdaemun-market', '동대문종합시장', '시장'),
    ],
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
    stations: ['l4:신용산'],
    attractions: [
      attraction('yongridan-gil', '용리단길', '거리·상권'),
      attraction('amorepacific-museum-of-art', '아모레퍼시픽미술관', '미술관'),
    ],
  },
  {
    stations: ['l6:한강진'],
    attractions: [attraction('leeum-museum', '리움미술관', '미술관')],
  },
  {
    stations: ['l6:녹사평'],
    attractions: [attraction('gyeongnidan-gil', '경리단길', '거리·상권')],
  },
  {
    stations: ['l6:이태원'],
    attractions: [attraction('itaewon-world-food-street', '이태원 세계음식거리', '거리·상권')],
  },
  {
    stations: ['l6:효창공원앞', 'gc:효창공원앞'],
    attractions: [attraction('hyochang-park', '효창공원', '공원')],
  },
  {
    stations: ['l4:동작', 'l9:동작'],
    attractions: [attraction('seoul-national-cemetery', '국립서울현충원', '역사·공원')],
  },
  {
    stations: ['l1:노량진', 'l9:노량진'],
    attractions: [attraction('noryangjin-fish-market', '노량진수산시장', '시장')],
  },
  {
    stations: ['l1:영등포'],
    attractions: [attraction('times-square-yeongdeungpo', '타임스퀘어', '복합문화·쇼핑', '영등포 타임스퀘어')],
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
    stations: ['l9:국회의사당'],
    attractions: [attraction('national-assembly', '국회의사당', '랜드마크')],
  },
  {
    stations: ['l6:망원'],
    attractions: [
      attraction('mangwon-hangang-park', '망원한강공원', '한강공원'),
      attraction('mangwon-market', '망원시장', '전통시장'),
    ],
  },
  {
    stations: ['l2:홍대입구', 'gc:홍대입구', 'ar:홍대입구'],
    attractions: [
      attraction('hongdae-walking-street', '홍대 걷고싶은거리', '거리·상권'),
      attraction('gyeongui-line-forest-park', '경의선숲길', '도심산책'),
    ],
  },
  {
    stations: ['l5:공덕', 'l6:공덕', 'gc:공덕', 'ar:공덕', 'l6:대흥'],
    attractions: [attraction('gyeongui-line-forest-park', '경의선숲길', '도심산책')],
  },
  {
    stations: ['l2:문래'],
    attractions: [attraction('mullae-art-village', '문래창작촌', '문화거리')],
  },
  {
    stations: ['l6:월드컵경기장'],
    attractions: [
      attraction('haneul-park', '하늘공원', '공원'),
      attraction('oil-tank-culture-park', '문화비축기지', '복합문화공간'),
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
    stations: ['l9:석촌고분'],
    attractions: [attraction('seokchon-dong-tombs', '서울 석촌동 고분군', '역사유적')],
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
    stations: ['l7:용마산'],
    attractions: [attraction('yongmasan-mountain', '용마산', '자연·산책')],
  },
  {
    stations: ['l7:도봉산'],
    attractions: [attraction('dobongsan-mountain', '도봉산', '자연·산책')],
  },
  {
    stations: ['l7:수락산'],
    attractions: [attraction('suraksan-mountain', '수락산', '자연·산책')],
  },
  {
    stations: ['l6:화랑대'],
    attractions: [
      attraction('hwarangdae-railroad-park', '화랑대철도공원', '문화공원'),
      attraction('gyeongchun-line-forest-park', '경춘선숲길', '도심산책'),
    ],
  },
  {
    stations: ['l7:공릉'],
    attractions: [attraction('gyeongchun-line-forest-park', '경춘선숲길', '도심산책')],
  },
  {
    stations: ['l4:미아사거리'],
    attractions: [attraction('dream-forest', '북서울꿈의숲', '공원')],
  },
  {
    stations: ['l7:보라매'],
    attractions: [attraction('boramae-park', '보라매공원', '공원')],
  },
  {
    stations: ['l2:뚝섬', 'sb:서울숲'],
    attractions: [attraction('seoul-forest', '서울숲', '공원')],
  },
  {
    stations: ['l2:성수'],
    attractions: [attraction('seongsu-yeonmujang-gil', '성수 연무장길', '거리·상권')],
  },
  {
    stations: ['l2:건대입구', 'l7:건대입구'],
    attractions: [attraction('common-ground', '커먼그라운드', '복합문화·쇼핑')],
  },
  {
    stations: ['l2:신당', 'l6:신당'],
    attractions: [attraction('sindang-tteokbokki-town', '신당동 떡볶이타운', '거리·상권')],
  },
  {
    stations: ['l2:강남', 'l9:신논현'],
    attractions: [attraction('gangnam-daero', '강남역 강남대로', '거리·상권')],
  },
  {
    stations: ['l2:서울대입구'],
    attractions: [attraction('sharosu-gil', '샤로수길', '거리·상권')],
  },
  {
    stations: ['l2:신림'],
    attractions: [attraction('sillim-sundae-town', '신림동 순대타운', '거리·상권')],
  },
  {
    stations: ['l3:홍제'],
    attractions: [attraction('hongje-waterfall', '홍제폭포', '수변·산책', '홍제천 인공폭포')],
  },
  {
    stations: ['l3:신사'],
    attractions: [attraction('garosu-gil', '가로수길', '거리·상권', '신사동 가로수길')],
  },
  {
    stations: ['l3:남부터미널'],
    attractions: [attraction('seoul-arts-center', '예술의전당', '문화공간')],
  },
  {
    stations: ['l3:양재'],
    attractions: [attraction('yangjaecheon-stream', '양재천', '수변·산책')],
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
    stations: ['l1:관악'],
    attractions: [attraction('anyang-art-park', '안양예술공원', '예술·공원')],
  },
  {
    stations: ['l4:평촌'],
    attractions: [attraction('pyeongchon-central-park', '평촌중앙공원', '공원')],
  },
  {
    stations: ['l4:중앙'],
    attractions: [attraction('ansan-culture-square', '안산문화광장', '광장·문화')],
  },
  {
    stations: ['l4:고잔'],
    attractions: [
      attraction('gyeonggi-museum-of-modern-art', '경기도미술관', '미술관'),
      attraction('hwarang-reservoir-park', '화랑유원지', '공원'),
    ],
  },
  {
    stations: ['l3:정발산', 'l3:마두'],
    attractions: [attraction('ilsan-lake-park', '일산호수공원', '호수공원')],
  },
  {
    stations: ['l5:서대문'],
    attractions: [
      attraction('donuimun-museum-village', '돈의문박물관마을', '역사·문화'),
      attraction('gyeonghuigung-palace', '경희궁', '궁궐'),
    ],
  },
  {
    stations: ['l5:마장'],
    attractions: [attraction('majong-livestock-market', '마장축산물시장', '시장', '마장 축산물시장')],
  },
  {
    stations: ['l5:답십리'],
    attractions: [attraction('dapsimni-antique-market', '답십리 고미술상가', '시장·문화')],
  },
  {
    stations: ['l5:장한평'],
    attractions: [attraction('seoul-upcycling-plaza', '서울새활용플라자', '문화공간')],
  },
  {
    stations: ['l5:미사'],
    attractions: [attraction('misa-lake-park', '미사호수공원', '호수공원')],
  },
  {
    stations: ['l5:하남검단산'],
    attractions: [
      attraction('geomdansan-mountain', '검단산', '자연·산책'),
      attraction('starfield-hanam', '스타필드 하남', '복합문화·쇼핑'),
    ],
  },
  {
    stations: ['l7:광명사거리'],
    attractions: [attraction('gwangmyeong-traditional-market', '광명전통시장', '전통시장')],
  },
  {
    stations: ['l7:상동'],
    attractions: [attraction('sangdong-lake-park', '상동호수공원', '호수공원')],
  },
  {
    stations: ['l7:삼산체육관'],
    attractions: [attraction('korea-manhwa-museum', '한국만화박물관', '박물관')],
  },
  {
    stations: ['l8:동구릉'],
    attractions: [attraction('donggureung-royal-tombs', '동구릉', '왕릉·문화유산')],
  },
  {
    stations: ['l8:장자호수공원'],
    attractions: [attraction('jangja-lake-park', '장자호수공원', '호수공원')],
  },
  {
    stations: ['l8:암사'],
    attractions: [attraction('amsadong-prehistoric-site', '서울 암사동 유적', '역사유적')],
  },
  {
    stations: ['l9:선정릉'],
    attractions: [attraction('seonjeongneung', '선정릉', '왕릉·문화유산')],
  },
  {
    stations: ['l1:인천', 'l1:동인천'],
    attractions: [
      attraction('incheon-chinatown', '인천 차이나타운', '거리'),
      attraction('jayugongwon-park', '자유공원', '공원'),
    ],
  },
  {
    stations: ['l1:부평', 'ic1:부평'],
    attractions: [attraction('bupyeong-underground-shopping-mall', '부평지하상가', '쇼핑·거리')],
  },
  {
    stations: ['ic1:예술회관'],
    attractions: [
      attraction('incheon-culture-arts-center', '인천문화예술회관', '문화공간'),
      attraction('guwol-dong-rodeo-street', '구월동 로데오거리', '거리·상권'),
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
