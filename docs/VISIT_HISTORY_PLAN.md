# Random Seoul — Visit History / Long-term Use Roadmap

Last updated: 2026-09-18

이 문서는 Random Seoul의 단기 랜덤 추첨을 장기 사용 경험으로 연결하는 방문 기록 로드맵입니다.

핵심 원칙은 **최근 추첨 기록과 실제 방문 기록을 분리**하는 것입니다. 랜덤으로 뽑혔다는 사실과 실제로 갔다는 사실은 다르며, 최근 추첨 기록을 삭제해도 실제 방문 기록은 유지되어야 합니다.

## Phase 1 — Durable visit records

Status: **IMPLEMENTED / VERIFIED WEB + ANDROID**

최근 추첨 카드의 `다녀왔어요`에서 실제 방문 기록을 만듭니다.

Record rules:
- **역은 필수**: 당시 뽑힌 노선/역을 항상 방문 기록에 저장
- **음식은 선택**: 당시 뽑힌 음식/주류 종목 하나만 후보로 보여주며, 실제로 먹었을 때만 사용자가 체크
- **추천 명소는 선택**: 당시 화면에 표시된 first-party 추천 명소 0~2곳만 후보로 제공
- 명소는 복수 선택 가능
- 추천 식당 Google Places 결과는 방문 기록 후보에 포함하지 않음
- 방문일은 선택사항이며 신규 기록 화면에서는 오늘 날짜를 기본값으로 제공하고 사용자가 지울 수 있음
- 최초 등록은 최근 추첨 카드의 `다녀왔어요`에서만 수행
- 등록 완료 뒤 최근 추첨 카드에서는 `발자취에 등록됨` 상태만 표시하고 수정 진입은 제공하지 않음
- 이후 조회/수정/삭제는 `발자취 노선도` 안의 durable visit history에서 수행

Persistence:
- recent draw history: `next_stop_history_v1`, max 12
- durable visit history: `random_seoul_visits_v1`, independent collection
- `최근 추첨 기록 지우기`는 visit history를 건드리지 않음
- 새 draw history는 당시 표시된 attraction snapshot을 저장하여 이후 curation이 바뀌어도 visit picker의 당시 후보를 복구 가능
- 기존 legacy history는 attraction snapshot이 없으므로 현재 station curation을 fallback으로 사용

## Phase 2 — Footprint map

Status: **IMPLEMENTED / VERIFIED WEB + ANDROID**

`다녀온 곳`의 `발자취 노선도`는 **수도권 전체 노선도 한 장** 위에 durable visit records를 표시합니다.

- 앱에 번들된 public-domain 수도권 전철 SVG를 기준 geometry로 사용
- 앱 수록 24개 노선 / **800개 line×station outcome 전체를 reference anchor에 매핑**
- 방문한 physical station만 reference map 위에 **화면 고정 크기 marker**로 강조하여 전체보기/확대 상태 모두에서 식별 가능
- 같은 physical station의 여러 노선/여러 방문은 하나의 marker + 방문 횟수 + 날짜별 history로 표현
- 노선도 아래에는 `역명 · 최근 방문일` compact horizontal strip을 항상 표시하고 옆으로 밀어 방문 역을 탐색
- 처음 열었을 때는 상세기록을 펼치지 않으며 marker 또는 strip item을 선택한 경우에만 상세 표시
- 선택 상세에서 날짜/노선/실제 방문 음식·명소를 확인하고 개별 방문기록 수정/삭제 가능
- 실제 방문으로 체크한 명소는 발자취 상세에서 기존 prominence 테두리(Diamond/Gold/Silver/Standard)를 재사용하고 Nightscape는 어두운 야경 스타일로 표시
- 명소 등급명 텍스트는 표시하지 않으며 노선도 방문역 marker 자체에는 명소 스타일을 섞지 않음
- 상세가 열린 상태에서도 horizontal strip은 계속 스크롤 가능
- marker 선택은 map DOM을 재생성하지 않고 selection/detail만 갱신하여 모바일 tap 시 위치가 움직이지 않음
- pan / wheel zoom / pinch zoom / 전체보기 지원
- physical interchange equivalence를 그대로 재사용
- 2호선/경의중앙선 신촌과 5호선/경의중앙선 양평은 서로 다른 reference anchor 유지
- `총신대입구(이수)` ↔ `이수`는 같은 physical anchor
- reference에 표기되지 않은 `의정부경전철 차량기지 임시승강장`만 유일한 synthetic terminal-extension anchor이며 UI에서 dashed extension으로 구분
- current-location/GPS permission 및 runtime map-provider/tile 요청 없음
- Android hardware back은 footprint → visit picker → settings 순으로 열린 overlay를 먼저 닫음

Anchor source/generation/audit 상세: `docs/FOOTPRINT_MAP_REFERENCE.md`.

Main 화면에는 durable visit card 목록을 노출하지 않고 방문 기록 수 + `발자취 노선도 보기` 진입만 제공합니다. Phase 2는 `VisitRecord` persistence schema를 변경하지 않으며 별도 방문 DB를 만들지 않습니다.

## Phase 3 — Unvisited-aware random

Status: **PLANNED**

방문 기록을 랜덤 기능 자체와 연결합니다.

Modes:
- `완전 랜덤` — 현재 기본 동작
- `안 가본 역 우선` — 미방문 역에 가중치를 주되 랜덤성 유지
- `다녀온 역 제외` — 방문 완료 physical station을 후보에서 제외

Default remains full random. 방문 기록이 사용자의 추첨 선택을 자동으로 바꾸지 않으며, 위 기능은 명시적 option으로 제공합니다.

## Phase 4 — Simple visit statistics

Status: **PLANNED**

복잡한 소셜/랭킹 게임화 대신 개인 탐험 진행도를 가볍게 보여줍니다.

Candidate metrics:
- 가본 고유 역 / 전체 역
- 노선별 방문 역 수와 비율
- 총 방문 기록 수
- 최근 방문일
- 음식 종목 / 명소 방문 수

Avoid:
- 친구 ranking
- 강제 출석체크
- streak 압박
- 과도한 badge system

목표는 Random Seoul의 핵심인 우연한 외출을 유지하면서, 사용자가 시간이 지날수록 **내가 채운 서울·수도권 발자취**를 소유하게 하는 것입니다.

## Change-control rule

Phase 1 visit schema와 이후 지도/랜덤/statistics가 공유할 source of truth는 `VisitRecord`입니다. 이후 단계는 visit persistence를 별도 DB처럼 재해석하지 말고 이 shared record contract를 확장하거나 migration을 명시적으로 추가합니다.
