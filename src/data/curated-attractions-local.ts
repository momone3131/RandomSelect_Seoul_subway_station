import type { AttractionRecommendation } from '../domain/types';

type Spec = readonly [id: string, name: string, category: string, mapQuery?: string];
const a = ([id, name, category, mapQuery]: Spec): AttractionRecommendation => ({
  id,
  name,
  category,
  mapQuery: mapQuery ?? name,
});

// Broad local-outing layer. These are intentionally less strict than the original landmark seed:
// sizeable parks, distinctive commercial streets, markets, campuses and local cultural anchors.
// Tiny playgrounds, ordinary apartment parks and generic convenience facilities remain excluded.
const GROUPS: readonly { stations: readonly string[]; attractions: readonly Spec[] }[] = [
  { stations: ['l1:회기', 'gc:회기', 'cc:회기'], attractions: [['kyunghee-seoul-campus', '경희대학교 서울캠퍼스', '캠퍼스', '경희대학교 서울캠퍼스']] },
  { stations: ['l1:외대앞'], attractions: [['hufs-seoul-campus', '한국외국어대학교 서울캠퍼스', '캠퍼스', '한국외국어대학교 서울캠퍼스']] },
  { stations: ['l1:대방', 'sl:대방'], attractions: [['yeouido-saetgang-ecological-park', '여의도샛강생태공원', '생태·산책']] },
  { stations: ['l1:군포'], attractions: [['gunpo-station-market', '군포역전시장', '전통시장', '군포역전시장 경기도 군포시']] },

  { stations: ['l2:왕십리'], attractions: [['wangsimni-plaza', '왕십리광장', '광장·상권', '왕십리광장 서울 성동구 행당동'], ['enter6-wangsimni', '엔터식스 왕십리역점', '복합쇼핑']] },
  { stations: ['l2:한양대'], attractions: [['hanyang-seoul-campus', '한양대학교 서울캠퍼스', '캠퍼스']] },
  { stations: ['l2:낙성대'], attractions: [['nakseongdae-park', '낙성대공원', '역사·공원', '낙성대공원 서울 관악구 낙성대로 77']] },
  { stations: ['l2:사당'], attractions: [['sadang-food-street', '사당역 먹자골목', '거리·상권', '사당역 먹자골목 서울 동작구 사당동']] },
  { stations: ['l2:방배'], attractions: [['bangbae-cafe-street', '방배동 카페골목', '거리·상권', '방배동 카페골목 서울 서초구 방배동']] },
  { stations: ['l2:잠실새내'], attractions: [['saemaeul-market-jamsil', '새마을전통시장', '전통시장', '새마을전통시장 서울 송파구 석촌호수로12길']] },
  { stations: ['l2:종합운동장', 'l9:종합운동장'], attractions: [['jamsil-sports-complex', '잠실종합운동장', '스포츠·랜드마크', '잠실종합운동장 서울 송파구 올림픽로 25']] },
  { stations: ['l2:선릉', 'sb:선릉'], attractions: [['seonjeongneung', '선정릉', '왕릉·문화유산']] },
  { stations: ['l2:역삼'], attractions: [['kukkiwon', '국기원', '문화·체험', '국기원 서울 강남구 테헤란로7길 32']] },
  { stations: ['l2:구로디지털단지'], attractions: [['guro-kkalkkal-street', '구로디지털단지 깔깔거리', '거리·상권', '깔깔거리 서울 구로구 구로동']] },
  { stations: ['l2:대림'], attractions: [['daerim-chinatown', '대림동 차이나타운', '거리·상권', '대림동 차이나타운 서울 영등포구 대림동']] },
  { stations: ['l2:당산', 'l9:당산'], attractions: [['yanghwa-hangang-park', '양화한강공원', '한강공원']] },
  { stations: ['l2:아현'], attractions: [['ahyeon-market', '아현시장', '전통시장', '아현시장 서울 마포구 굴레방로9길']] },
  { stations: ['l2:충정로', 'l5:충정로'], attractions: [['seosomun-shrine-history-museum', '서소문성지역사박물관', '역사·문화', '서소문성지역사박물관 서울 중구 칠패로 5']] },
  { stations: ['l2:양천구청'], attractions: [['yangcheon-park', '양천공원', '공원', '양천공원 서울 양천구 목동동로 111']] },

  { stations: ['l3:연신내'], attractions: [['yeonseo-market', '연서시장', '전통시장', '연서시장 서울 은평구 통일로'], ['yeonsinnae-rodeo', '연신내 로데오거리', '거리·상권', '연신내 로데오거리 서울 은평구 갈현동']] },
  { stations: ['l3:무악재'], attractions: [['ansan-jarak-gil', '안산자락길', '도심산책', '안산자락길 무악재 서울 서대문구']] },
  { stations: ['l3:잠원'], attractions: [['jamwon-hangang-park', '잠원한강공원', '한강공원']] },
  { stations: ['l3:매봉'], attractions: [['yangjaecheon-stream', '양재천', '수변·산책']] },

  { stations: ['l4:수유'], attractions: [['suyu-food-street', '수유 먹자골목', '거리·상권', '수유 먹자골목 서울 강북구 수유동']] },
  { stations: ['l4:쌍문'], attractions: [['dooly-museum', '둘리뮤지엄', '전시·체험', '둘리뮤지엄 서울 도봉구 시루봉로1길 6']] },
  { stations: ['l4:성신여대입구'], attractions: [['sungshin-rodeo', '성신여대 로데오거리', '거리·상권', '성신여대 로데오거리 서울 성북구 동선동']] },
  { stations: ['l4:한성대입구'], attractions: [['seongbuk-dong-culture-street', '성북동 문화거리', '문화거리', '성북동 문화거리 서울 성북구 성북동']] },
  { stations: ['l4:과천', 'l4:정부과천청사'], attractions: [['gwacheon-central-park', '과천중앙공원', '공원', '과천중앙공원 경기도 과천시 별양동']] },
  { stations: ['l4:인덕원'], attractions: [['indeogwon-food-street', '인덕원 먹거리촌', '거리·상권', '인덕원 먹거리촌 경기도 안양시 동안구 관양동']] },
  { stations: ['l4:안산'], attractions: [['ansan-multicultural-food-street', '안산 다문화음식거리', '거리·상권', '안산 다문화음식거리 경기도 안산시 단원구 원곡동']] },

  { stations: ['l5:마포'], attractions: [['mapo-food-culture-street', '마포음식문화거리', '거리·상권', '마포음식문화거리 서울 마포구 용강동']] },
  { stations: ['l5:목동'], attractions: [['mokdong-rodeo', '목동 로데오거리', '거리·상권', '목동 로데오거리 서울 양천구 신정동']] },
  { stations: ['l5:화곡'], attractions: [['hwagok-bondong-market', '화곡본동시장', '전통시장', '화곡본동시장 서울 강서구 화곡동']] },
  { stations: ['l5:우장산'], attractions: [['ujangsan-park', '우장산공원', '공원', '우장산공원 서울 강서구 내발산동']] },
  { stations: ['l5:고덕'], attractions: [['godeok-riverside-eco-park', '고덕수변생태공원', '생태·산책', '고덕수변생태공원 서울 강동구 고덕동']] },
  { stations: ['l5:하남풍산'], attractions: [['starfield-hanam', '스타필드 하남', '복합문화·쇼핑']] },

  { stations: ['l6:상수'], attractions: [['sangsu-cafe-street', '상수동 카페거리', '거리·상권', '상수동 카페거리 서울 마포구 상수동']] },
  { stations: ['l6:창신'], attractions: [['changsin-cliff-village', '창신동 절벽마을', '전망·마을', '창신동 절벽마을 서울 종로구 창신동']] },
  { stations: ['l6:보문'], attractions: [['seongbukcheon-stream', '성북천 산책로', '수변·산책', '성북천 보문역 서울 성북구']] },
  { stations: ['l6:태릉입구'], attractions: [['taereung-gangneung', '태릉과 강릉', '왕릉·문화유산', '태릉과 강릉 서울 노원구 화랑로 681']] },
  { stations: ['l6:봉화산'], attractions: [['bonghwasan-trail', '봉화산 둘레길', '자연·산책', '봉화산 둘레길 서울 중랑구 신내동']] },
  { stations: ['l6:신내'], attractions: [['jungnang-camping-forest', '중랑캠핑숲', '공원', '중랑캠핑숲 서울 중랑구 망우로87길 110']] },

  { stations: ['l7:중계'], attractions: [['buramsan-healing-town', '불암산 힐링타운', '자연·산책', '불암산 힐링타운 서울 노원구 한글비석로12길']] },
  { stations: ['l7:면목'], attractions: [['myeonmok-golmok-market', '면목골목시장', '전통시장', '면목골목시장 서울 중랑구 면목동']] },
  { stations: ['l7:사가정'], attractions: [['yongma-waterfall-park', '용마폭포공원', '공원', '용마폭포공원 서울 중랑구 용마산로 250-12']] },
  { stations: ['l7:논현', 'sbd:논현'], attractions: [['nonhyeon-furniture-street', '논현동 가구거리', '특화거리', '논현동 가구거리 서울 강남구 학동로']] },
  { stations: ['l7:반포', 'l9:사평'], attractions: [['seorae-village', '서래마을 카페거리', '거리·상권', '서래마을 카페거리 서울 서초구 반포동']] },
  { stations: ['l7:내방'], attractions: [['seoripul-park', '서리풀공원', '공원·산책', '서리풀공원 서울 서초구 방배동']] },
  { stations: ['l7:신대방삼거리', 'sl:보라매공원'], attractions: [['boramae-park', '보라매공원', '공원']] },
  { stations: ['l7:철산'], attractions: [['cheolsan-rodeo', '철산 로데오거리', '거리·상권', '철산 로데오거리 경기도 광명시 철산동']] },
  { stations: ['l7:부천종합운동장', 'sh:부천종합운동장'], attractions: [['bucheon-bow-museum', '부천활박물관', '박물관', '부천활박물관 경기도 부천시 소사로 482']] },
  { stations: ['l7:굴포천', 'l7:부평구청'], attractions: [['gulpocheon-eco-stream', '굴포천 생태하천', '수변·산책', '굴포천 부평구청 인천광역시 부평구']] },

  { stations: ['l8:별내'], attractions: [['byeollae-cafe-street', '별내 카페거리', '거리·상권', '별내 카페거리 경기도 남양주시 별내동']] },
  { stations: ['l8:다산'], attractions: [['dasan-central-park', '다산중앙공원', '공원', '다산중앙공원 경기도 남양주시 다산동']] },
  { stations: ['l8:강동구청'], attractions: [['seongnaecheon-stream', '성내천 산책로', '수변·산책', '성내천 강동구청 서울 강동구']] },
  { stations: ['l8:문정'], attractions: [['munjeong-rodeo', '문정동 로데오거리', '거리·상권', '문정동 로데오거리 서울 송파구 문정동']] },
  { stations: ['l8:산성', 'l8:남한산성입구'], attractions: [['namhansanseong', '남한산성', '세계유산·산책', '남한산성 경기도 광주시 남한산성면 산성리']] },
  { stations: ['l8:신흥'], attractions: [['seongnam-central-market', '성남중앙시장', '전통시장', '성남중앙시장 경기도 성남시 수정구 신흥동']] },

  { stations: ['l9:흑석'], attractions: [['hyosajeong-park', '효사정공원', '전망·공원', '효사정공원 서울 동작구 현충로 55']] },
  { stations: ['l9:구반포'], attractions: [['banpo-hangang-park', '반포한강공원', '한강공원']] },
  { stations: ['l9:삼성중앙'], attractions: [['coex', '코엑스', '복합문화공간']] },
  { stations: ['l9:삼전'], attractions: [['seokchon-lake', '석촌호수', '호수공원']] },
  { stations: ['l9:둔촌오륜'], attractions: [['olympic-park', '올림픽공원', '공원']] },
  { stations: ['l9:중앙보훈병원'], attractions: [['iljasan-herb-astronomy-park', '일자산 허브천문공원', '공원·전망', '허브천문공원 서울 강동구 둔촌동 산86']] },

  { stations: ['ic1:박촌'], attractions: [['gyeyang-fortress-museum', '계양산성박물관', '박물관', '계양산성박물관 인천광역시 계양구 계양산로 101']] },
  { stations: ['ic1:부평시장'], attractions: [['bupyeong-market', '부평시장', '전통시장', '부평시장 인천광역시 부평구']] },
  { stations: ['ic1:인천시청', 'ic2:인천시청'], attractions: [['incheon-central-park', '인천중앙공원', '도심공원', '인천중앙공원 인천광역시 남동구 간석동']] },
  { stations: ['ic1:문학경기장'], attractions: [['incheon-munhak-stadium', '인천문학경기장', '스포츠·랜드마크', '인천문학경기장 인천광역시 미추홀구 매소홀로 618']] },
  { stations: ['ic1:지식정보단지'], attractions: [['songdo-michuhol-park', '송도 미추홀공원', '공원', '미추홀공원 인천광역시 연수구 해송로 59']] },
  { stations: ['ic1:국제업무지구', 'ic1:송도달빛축제공원'], attractions: [['songdo-moonlight-festival-park', '송도달빛축제공원', '수변·공원', '송도달빛축제공원 인천광역시 연수구 센트럴로 350']] },

  { stations: ['ic2:아시아드경기장'], attractions: [['incheon-asiad-main-stadium', '인천아시아드주경기장', '스포츠·랜드마크', '인천아시아드주경기장 인천광역시 서구 봉수대로 806']] },
  { stations: ['ic2:석남'], attractions: [['geobuk-market', '거북시장', '전통시장', '거북시장 인천광역시 서구 석남동']] },
  { stations: ['ic2:주안'], attractions: [['juan-2030-street', '주안 2030거리', '거리·상권', '주안 2030거리 인천광역시 미추홀구 주안동']] },
  { stations: ['ic2:만수'], attractions: [['mansu-market', '만수시장', '전통시장', '만수시장 인천광역시 남동구 만수동']] },

  { stations: ['gc:서강대'], attractions: [['gyeongui-line-forest-park', '경의선숲길', '도심산책']] },
  { stations: ['gc:능곡'], attractions: [['neunggok-market', '능곡전통시장', '전통시장', '능곡전통시장 경기도 고양시 덕양구']] },
  { stations: ['gc:도농'], attractions: [['space1-namyangju', '현대프리미엄아울렛 스페이스원', '복합문화·쇼핑', '현대프리미엄아울렛 스페이스원 남양주']] },
  { stations: ['gc:덕소'], attractions: [['sampaehangang-park', '삼패한강공원', '한강공원', '삼패한강공원 경기도 남양주시 삼패동']] },
  { stations: ['gc:팔당'], attractions: [['paldang-riverside', '팔당유원지', '수변·산책', '팔당유원지 경기도 남양주시 와부읍 팔당리']] },
  { stations: ['gc:양수'], attractions: [['dumulmeori', '두물머리', '수변·산책'], ['semiwon', '세미원', '정원·수변']] },

  { stations: ['cc:청평'], attractions: [['cheongpyeong-recreation-area', '청평유원지', '수변·산책', '청평유원지 경기도 가평군 청평면']] },
  { stations: ['cc:상천'], attractions: [['homyeong-lake-park', '호명호수공원', '호수·산책', '호명호수공원 경기도 가평군 청평면 상천리']] },

  { stations: ['sb:수내'], attractions: [['sunae-bundang-central-park', '분당중앙공원', '공원', '분당중앙공원 경기도 성남시 분당구 수내동']] },
  { stations: ['sb:영통'], attractions: [['yeongtong-central-commercial', '영통 중심상가', '거리·상권', '영통 중심상가 경기도 수원시 영통구 영통동']] },
  { stations: ['sb:인하대'], attractions: [['inha-culture-street', '인하문화의거리', '거리·상권', '인하문화의거리 인천광역시 미추홀구 용현동']] },
  { stations: ['sb:숭의'], attractions: [['incheon-football-stadium', '인천축구전용경기장', '스포츠·랜드마크', '인천축구전용경기장 인천광역시 중구 참외전로 246']] },

  { stations: ['sbd:신사'], attractions: [['garosu-gil', '가로수길', '거리·상권', '신사동 가로수길']] },
  { stations: ['sbd:신논현'], attractions: [['gangnam-daero', '강남대로', '거리·상권', '강남역 강남대로']] },
  { stations: ['sbd:양재시민의숲'], attractions: [['yangjae-citizens-forest', '양재시민의숲', '공원', '양재시민의숲 서울 서초구 매헌로 99']] },
  { stations: ['sbd:청계산입구'], attractions: [['cheonggyesan-mountain', '청계산', '자연·산책', '청계산입구 서울 서초구 원지동']] },
  { stations: ['sbd:성복'], attractions: [['lotte-mall-suji', '롯데몰 수지', '복합쇼핑', '롯데몰 수지 경기도 용인시 수지구 성복2로 38']] },
  { stations: ['sbd:상현'], attractions: [['gwanggyo-lake-park', '광교호수공원', '호수공원']] },

  { stations: ['gg:곤지암'], attractions: [['gyeonggi-ceramic-museum', '경기도자박물관', '박물관', '경기도자박물관 경기도 광주시 곤지암읍 경충대로 727']] },
  { stations: ['gg:이천'], attractions: [['seolbong-park', '설봉공원', '호수공원', '설봉공원 경기도 이천시 관고동']] },
  { stations: ['gg:여주'], attractions: [['silleuksa-temple', '신륵사', '사찰·문화유산', '신륵사 경기도 여주시 신륵사길 73']] },

  { stations: ['sh:원종'], attractions: [['wonjong-market', '원종종합시장', '전통시장', '원종종합시장 경기도 부천시 오정구 원종동']] },
  { stations: ['sh:소사'], attractions: [['sosa-market', '소사종합시장', '전통시장', '소사종합시장 경기도 부천시 소사구 소사본동']] },
  { stations: ['sh:시흥대야'], attractions: [['eungye-lake-park', '은계호수공원', '호수공원', '은계호수공원 경기도 시흥시 은행동']] },
  { stations: ['sh:시흥능곡'], attractions: [['siheung-gaetgol-eco-park', '시흥갯골생태공원', '생태·공원', '시흥갯골생태공원 경기도 시흥시 동서로 287']] },
  { stations: ['sh:초지'], attractions: [['hwarang-reservoir-park', '화랑유원지', '공원', '화랑유원지 경기도 안산시 단원구 초지동'], ['gyeonggi-museum-of-modern-art', '경기도미술관', '미술관']] },

  { stations: ['ui:솔밭공원'], attractions: [['solbat-neighborhood-park', '솔밭근린공원', '공원', '솔밭근린공원 서울 강북구 우이동']] },
  { stations: ['ui:화계'], attractions: [['hwagyesa-temple', '화계사', '사찰', '화계사 서울 강북구 화계사길 117']] },
  { stations: ['ui:북한산보국문'], attractions: [['bukhansan-dullegil-jeongneung', '북한산둘레길 정릉구간', '자연·산책', '북한산둘레길 정릉탐방안내소 서울 성북구']] },

  { stations: ['sl:신림'], attractions: [['sillim-sundae-town', '신림동 순대타운', '거리·상권']] },

  { stations: ['ev:동백'], attractions: [['dongbaek-lake-park', '동백호수공원', '호수공원', '동백호수공원 경기도 용인시 기흥구 동백동']] },
  { stations: ['gm:걸포북변'], attractions: [['geolpo-central-park', '걸포중앙공원', '공원', '걸포중앙공원 경기도 김포시 걸포동']] },
  { stations: ['gtx:동탄'], attractions: [['lotte-dept-dongtan', '롯데백화점 동탄점', '복합문화·쇼핑', '롯데백화점 동탄점 경기도 화성시 동탄역로 160']] },

  // 2026-09-18 zero-coverage audit: map/local-source research for genuinely visit-worthy stops.
  { stations: ['l1:전곡'], attractions: [['jeongok-ri-paleolithic-site', '전곡리 선사유적', '선사유적', '전곡리 선사유적 경기도 연천군 전곡읍 양연로 1510'], ['jeongok-prehistory-museum', '전곡선사박물관', '박물관', '전곡선사박물관 경기도 연천군 전곡읍 평화로443번길 2']] },
  { stations: ['l1:동두천중앙'], attractions: [['dongducheon-central-market', '동두천 중앙시장', '전통시장', '동두천 중앙시장 경기도 동두천시 중앙동']] },
  { stations: ['l1:망월사', 'l1:회룡'], attractions: [['wondobongsan-mountain', '원도봉산', '자연·산행', '원도봉탐방지원센터 경기도 의정부시 호원동']] },
  { stations: ['l1:방학'], attractions: [['banghak-dokkaebi-market', '방학동 도깨비시장', '전통시장', '방학동 도깨비시장 서울 도봉구 방학동']] },
  { stations: ['l1:신이문', 'l6:돌곶이'], attractions: [['uireung-royal-tomb', '의릉', '왕릉·문화유산', '의릉 서울 성북구 화랑로32길 146-20']] },
  { stations: ['l1:남영'], attractions: [['democracy-movement-memorial-hall', '민주화운동기념관', '역사·전시', '민주화운동기념관 서울 용산구 한강대로71길 37']] },
  { stations: ['l1:독산'], attractions: [['geumcheon-art-factory', '금천예술공장', '문화·예술', '금천예술공장 서울 금천구 범안로15길 57']] },
  { stations: ['l1:명학'], attractions: [['anyang-art-center', '안양아트센터', '공연·문화', '안양아트센터 경기도 안양시 만안구 문예로36번길 16']] },
  { stations: ['l1:오산대'], attractions: [['mulhyanggi-arboretum', '물향기수목원', '수목원', '물향기수목원 경기도 오산시 청학로 211']] },
  { stations: ['l1:송탄'], attractions: [['songtan-tourist-special-zone', '송탄 관광특구', '거리·상권', '송탄 관광특구 경기도 평택시 신장동']] },
  { stations: ['l1:부천'], attractions: [['bucheon-free-market', '부천자유시장', '전통시장', '부천자유시장 경기도 부천시 소사구 자유로']] },
  { stations: ['l1:백운'], attractions: [['bupyeong-art-center', '부평아트센터', '공연·문화', '부평아트센터 인천광역시 부평구 아트센터로 166']] },
  { stations: ['l1:도화', 'l1:제물포'], attractions: [['subong-park', '수봉공원', '공원·전망', '수봉공원 인천광역시 미추홀구 수봉안길 84']] },
  { stations: ['l1:도원'], attractions: [['incheon-football-stadium', '인천축구전용경기장', '스포츠·랜드마크', '인천축구전용경기장 인천광역시 중구 참외전로 246']] },

  { stations: ['l2:을지로4가'], attractions: [['gwangjang-market', '광장시장', '전통시장', '광장시장 서울 종로구 창경궁로 88']] },
  { stations: ['l2:잠실나루'], attractions: [['jamsil-hangang-park', '잠실한강공원', '한강공원', '잠실한강공원 서울 송파구 한가람로 65']] },
  { stations: ['l2:신대방', 'sl:보라매병원'], attractions: [['boramae-park', '보라매공원', '공원', '보라매공원 서울 동작구 여의대방로20길 33']] },
  { stations: ['l2:용두'], attractions: [['cheonggyecheon-museum', '청계천박물관', '박물관', '청계천박물관 서울 성동구 청계천로 530']] },

  { stations: ['l3:동대입구'], attractions: [['jangchungdan-park', '장충단공원', '역사·공원', '장충단공원 서울 중구 동호로']] },
  { stations: ['l3:불광'], attractions: [['bukhansan-ecological-park', '북한산생태공원', '생태·공원', '북한산생태공원 서울 은평구 불광동']] },
  { stations: ['l3:학여울', 'sb:대모산입구'], attractions: [['setec', 'SETEC', '전시·문화', 'SETEC 서울 강남구 남부순환로 3104']] },
  { stations: ['l3:수서'], attractions: [['daemosan-mountain', '대모산', '자연·산행', '대모산 서울 강남구']] },
  { stations: ['l3:가락시장'], attractions: [['garak-market', '가락시장', '시장·먹거리', '가락시장 서울 송파구 양재대로 932']] },
  { stations: ['l3:원당'], attractions: [['wondang-market', '원당시장', '전통시장', '원당시장 경기도 고양시 덕양구 마상로154번길 59']] },

  { stations: ['l4:불암산'], attractions: [['buramsan-healing-town', '불암산 힐링타운', '자연·산책', '불암산 힐링타운 서울 노원구 한글비석로12길']] },
  { stations: ['l4:수리산'], attractions: [['surisan-mountain', '수리산', '자연·산행', '수리산 도립공원 경기도 군포시']] },
  { stations: ['l4:상록수'], attractions: [['choi-yongshin-memorial', '최용신기념관', '역사·기념관', '최용신기념관 경기도 안산시 상록구 샘골서길 64']] },

  { stations: ['l5:방화', 'l5:개화산'], attractions: [['gaehwasan-trail', '개화산', '자연·산책', '개화산 전망대 서울 강서구']] },
  { stations: ['l5:영등포시장'], attractions: [['times-square-yeongdeungpo', '타임스퀘어', '복합문화·쇼핑', '영등포 타임스퀘어']] },
  { stations: ['l5:청구'], attractions: [['sindang-tteokbokki-town', '신당동 떡볶이타운', '거리·상권', '신당동 떡볶이타운 서울 중구 다산로33길']] },
  { stations: ['l5:오금'], attractions: [['ogeum-park', '오금공원', '공원', '오금공원 서울 송파구 오금로 363']] },
  { stations: ['l5:군자'], attractions: [['seoul-childrens-grand-park', '서울어린이대공원', '공원', '서울어린이대공원 서울 광진구 능동로 216']] },
  { stations: ['l5:방이'], attractions: [['bangyi-dong-ancient-tombs', '서울 방이동 고분군', '역사유적', '서울 방이동 고분군 서울 송파구 오금로 219']] },

  { stations: ['l7:먹골', 'l7:중화'], attractions: [['jungnang-rose-park', '중랑장미공원', '수변·공원', '중랑장미공원 서울 중랑구 중랑천로']] },
  { stations: ['l7:학동'], attractions: [['nonhyeon-furniture-street', '논현동 가구거리', '특화거리', '논현동 가구거리 서울 강남구 학동로']] },
  { stations: ['l7:숭실대입구'], attractions: [['korean-christian-museum', '숭실대학교 한국기독교박물관', '박물관·캠퍼스', '숭실대학교 한국기독교박물관 서울 동작구 상도로 369']] },

  { stations: ['l8:장지'], attractions: [['jangjicheon-waterfront-park', '장지천 수변감성공원', '수변·공원', '장지천 수변감성공원 서울 송파구 문정동 631']] },

  { stations: ['l9:양천향교'], attractions: [['yangcheon-hyanggyo', '양천향교', '문화유산', '양천향교 서울 강서구 양천로47나길 53'], ['gyeomjae-jeongseon-art-museum', '겸재정선미술관', '미술관', '겸재정선미술관 서울 강서구 양천로47길 36']] },

  { stations: ['ic1:원인재'], attractions: [['woninjae', '원인재', '문화유산', '원인재 인천 연수구 경원대로 322']] },
  { stations: ['ic1:계양'], attractions: [['gyulhyeon-naru', '경인아라뱃길 귤현나루', '수변·전망', '경인아라뱃길 귤현나루 인천 계양구 정서진로 1247']] },

  { stations: ['gc:문산'], attractions: [['munsan-free-market', '문산자유시장', '전통시장', '문산자유시장 경기도 파주시 문산읍 문향로 57']] },
  { stations: ['gc:풍산'], attractions: [['kim-dae-jung-residence-memorial', '김대중 대통령 사저 기념관', '역사·기념관', '김대중 대통령 사저 기념관 경기도 고양시 일산동구 햇살로95번길 34-12']] },
  { stations: ['gc:백마'], attractions: [['anygol-food-culture-street', '애니골', '거리·상권', '애니골 경기도 고양시 일산동구 애니골길']] },
  { stations: ['gc:행신'], attractions: [['haengsin-art-street', '행신아트거리', '거리·상권', '행신아트거리 경기도 고양시 덕양구 무원로54번길']] },

  { stations: ['cc:금곡'], attractions: [['hongyureung-royal-tombs', '홍유릉', '왕릉·문화유산', '홍유릉 경기도 남양주시 홍유릉로 352-1']] },
  { stations: ['cc:천마산'], attractions: [['cheonmasan-mountain', '천마산', '자연·산행', '천마산 경기도 남양주시 화도읍']] },
  { stations: ['cc:대성리'], attractions: [['daeseongri-tourist-site', '대성리 국민관광지', '수변·관광지', '대성리 국민관광지 경기도 가평군 청평면 대성리']] },

  { stations: ['sb:이매'], attractions: [['seongnam-arts-center', '성남아트센터', '공연·문화', '성남아트센터 경기도 성남시 분당구 성남대로 808']] },
  { stations: ['sb:월곶'], attractions: [['wolgot-port', '월곶포구', '수변·포구', '월곶포구 경기도 시흥시 월곶동']] },

  { stations: ['gm:사우'], attractions: [['gimpo-jangneung', '김포 장릉', '왕릉·문화유산', '김포 장릉 경기도 김포시 장릉로 79']] },

  { stations: ['gj:발곡'], attractions: [['uijeongbu-music-library', '의정부음악도서관', '문화·도서관', '의정부음악도서관 경기도 의정부시 장곡로 280']] },

  // 2026-09-18 zero-coverage audit, second pass.
  { stations: ['l2:서초'], attractions: [['national-library-of-korea', '국립중앙도서관', '도서관·문화', '국립중앙도서관 서울 서초구 반포대로 201']] },
  { stations: ['l2:신답'], attractions: [['dapsimni-antique-shopping-center', '답십리 고미술상가', '고미술·상가', '답십리 고미술상가 서울 동대문구 고미술로 21']] },
  { stations: ['l3:화정'], attractions: [['hwajeong-culture-street', '화정 문화의거리', '거리·상권', '화정 문화의거리 경기도 고양시 덕양구 화정로 56-1']] },
  { stations: ['l3:금호'], attractions: [['geumnam-market', '금남시장', '전통시장', '금남시장 서울 성동구 독서당로 303-7']] },

  { stations: ['l5:길동'], attractions: [['gil-dong-bokjori-market', '길동복조리시장', '전통시장', '길동복조리시장 서울 강동구 양재대로116길']] },
  { stations: ['l5:명일'], attractions: [['myeongil-market', '명일전통시장', '전통시장', '명일전통시장 서울 강동구 양재대로138길 22']] },
  { stations: ['l5:둔촌동'], attractions: [['duncheon-station-market', '둔촌역 전통시장', '전통시장', '둔촌역 전통시장 서울 강동구 풍성로58길']] },
  { stations: ['l5:마천'], attractions: [['macheon-central-market', '마천중앙시장', '전통시장', '마천중앙시장 서울 송파구 마천로51가길 23']] },

  { stations: ['l8:암사역사공원'], attractions: [['amsa-history-park', '암사역사공원', '역사·공원', '암사역사공원 서울 강동구 암사동 137-2']] },

  { stations: ['ic2:석바위시장'], attractions: [['seokbawi-market', '석바위시장', '전통시장', '석바위시장 인천 미추홀구 경인로485번길 17-1']] },
  { stations: ['ic2:인천가좌'], attractions: [['incheon-gajwa-market', '인천 가좌시장', '전통시장', '가좌시장 인천 서구 원적로96번길 5']] },

  { stations: ['gc:가좌'], attractions: [['gyeongui-line-forest-park', '경의선숲길', '도심산책', '경의선숲길 가좌역 서울 마포구']] },
  { stations: ['gc:한국항공대'], attractions: [['kau-aerospace-museum', '한국항공대학교 항공우주박물관', '박물관·캠퍼스', '한국항공대학교 항공우주박물관 경기도 고양시 덕양구 항공대학로 76']] },

  { stations: ['sb:기흥'], attractions: [['nam-june-paik-art-center', '백남준아트센터', '미술관', '백남준아트센터 경기도 용인시 기흥구 백남준로 10']] },
  { stations: ['sb:인천논현'], attractions: [['neulsolgil-park', '늘솔길공원', '공원·체험', '늘솔길공원 인천 남동구 앵고개로 783']] },

  { stations: ['sh:신천'], attractions: [['sammi-market', '삼미시장', '전통시장', '삼미시장 경기도 시흥시 신천동']] },

  { stations: ['ui:솔샘'], attractions: [['bukhansan-dullegil-solsaem', '북한산둘레길 흰구름길', '자연·산책', '북한산둘레길 흰구름길 솔샘역 서울 강북구']] },

  { stations: ['gj:의정부시청'], attractions: [['uijeongbu-arts-center', '의정부예술의전당', '공연·문화', '의정부예술의전당 경기도 의정부시 의정로 1']] },

  { stations: ['ev:삼가'], attractions: [['yongin-mireu-stadium', '용인미르스타디움', '스포츠·랜드마크', '용인미르스타디움 경기도 용인시 처인구 동백죽전대로 61']] },

  { stations: ['gm:구래'], attractions: [['gimpo-independence-memorial', '김포독립운동기념관', '역사·기념관', '김포독립운동기념관 경기도 김포시 양촌읍 양곡2로30번길 46']] },

  { stations: ['l1:역곡'], attractions: [['yeokgok-sangsang-market', '역곡상상시장', '문화관광형시장', '역곡상상시장 경기도 부천시 원미구 부일로749번길']] },
  { stations: ['l1:송내'], attractions: [['boksagol-culture-center', '복사골문화센터', '복합문화공간', '복사골문화센터 경기도 부천시 원미구 장말로 107']] },


  // 2026-09-18 zero-coverage audit, third pass.
  { stations: ['l1:창동', 'l4:창동'], attractions: [['seoul-photo-museum', '서울시립 사진미술관', '미술관', '서울시립 사진미술관 서울 도봉구 마들로13길 68'], ['seoul-robot-ai-museum', '서울로봇인공지능과학관', '과학·체험', '서울로봇인공지능과학관 서울 도봉구 마들로13길 56']] },
  { stations: ['l4:숙대입구'], attractions: [['sookmyung-moonshin-museum', '숙명여자대학교 문신미술관', '미술관·캠퍼스', '숙명여자대학교 문신미술관 서울 용산구 청파로47길 100']] },

  { stations: ['l5:송정', 'l9:공항시장'], attractions: [['airport-market', '공항시장', '전통시장', '공항시장 서울 강서구 개화동로31길 39']] },
  { stations: ['l9:신방화'], attractions: [['bangsin-market', '방신전통시장', '전통시장', '방신전통시장 서울 강서구 방화동로16길 31']] },
  { stations: ['l5:마곡'], attractions: [['lg-art-center-seoul', 'LG아트센터 서울', '공연·문화', 'LG아트센터 서울 서울 강서구 마곡중앙로 136']] },
  { stations: ['l5:상일동'], attractions: [['godeok-traditional-market', '고덕전통시장', '전통시장', '고덕전통시장 서울 강동구 고덕로83길 36']] },
  { stations: ['l2:까치산', 'l5:까치산'], attractions: [['kkachisan-market', '까치산시장', '전통시장', '까치산시장 서울 강서구 화곡동 663-15']] },

  { stations: ['l6:새절', 'l6:증산'], attractions: [['eungam-daerim-market', '응암동 대림시장', '전통시장·먹거리', '대림시장 서울 은평구 응암로4길 22']] },
  { stations: ['l6:상월곡'], attractions: [['karts-seokgwan-campus', '한국예술종합학교 석관동캠퍼스', '예술·캠퍼스', '한국예술종합학교 석관동캠퍼스 서울 성북구 화랑로32길 146-37']] },

  { stations: ['l7:중곡'], attractions: [['junggok-jeil-market', '중곡제일시장', '전통시장', '중곡제일시장 서울 광진구 중곡동 229-5']] },
  { stations: ['l7:남성'], attractions: [['namseong-station-market', '남성역골목시장', '전통시장', '남성역골목시장 서울 동작구 사당로16가길 19']] },
  { stations: ['l7:남구로'], attractions: [['namguro-market', '남구로시장', '전통시장·다문화', '남구로시장 서울 구로구 구로동로26길 58']] },

  { stations: ['l8:송파'], attractions: [['seokchon-market-local', '석촌시장', '전통시장', '석촌시장 서울 송파구 송파대로37길 40']] },


  // 2026-09-18 zero-coverage audit, map-verified follow-up.
  { stations: ['l3:백석'], attractions: [['bellacitta-ilsan', '벨라시타', '복합문화·쇼핑', '벨라시타 경기도 고양시 일산동구 강송로 33']] },
  { stations: ['l9:등촌'], attractions: [['deungchon-market', '등촌시장', '전통시장', '등촌시장 서울 양천구 목동중앙북로7길']] },
  { stations: ['l7:산곡'], attractions: [['wonjeoksan-park', '원적산공원', '공원·산책', '원적산공원 인천광역시 부평구 산곡동']] },


  // 2026-09-18 zero-coverage audit, official-access follow-up.
  { stations: ['l5:강동'], attractions: [['gangfull-cartoon-street', '강풀만화거리', '문화거리', '강풀만화거리 서울 강동구 천호대로168가길']] },
  { stations: ['l3:도곡'], attractions: [['yangjaecheon-stream', '양재천', '수변·산책', '양재천 도곡역 서울 강남구']] },
  { stations: ['l3:일원'], attractions: [['daemosan-mountain', '대모산', '자연·산행', '대모산 일원역 서울 강남구']] },
  { stations: ['l6:월곡'], attractions: [['dongduk-womens-university', '동덕여자대학교', '캠퍼스', '동덕여자대학교 서울 성북구 화랑로13길 60']] },
  { stations: ['l7:강남구청', 'sb:강남구청'], attractions: [['dosan-park', '도산공원', '역사·공원', '도산공원 서울 강남구 도산대로45길 20']] },

];

const MAP = new Map<string, AttractionRecommendation[]>();
for (const group of GROUPS) {
  for (const station of group.stations) MAP.set(station, group.attractions.map(a).slice(0, 2));
}

export const LOCAL_CURATED_STATION_KEYS = Object.freeze([...MAP.keys()]);

export function getLocalCuratedAttractions(lineId: string, stationName: string): AttractionRecommendation[] {
  return (MAP.get(`${lineId}:${stationName}`) ?? []).map((item) => ({ ...item }));
}
